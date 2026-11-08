package com.meve.backend.services;

import com.meve.backend.dtos.ItemPedidoRequest;
import com.meve.backend.dtos.PedidoRequest;
import com.meve.backend.models.*;
import com.meve.backend.repositories.ComercioRepository;
import com.meve.backend.repositories.PedidoRepository;
import com.meve.backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ComercioRepository comercioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Pedido registrarPedido(PedidoRequest request) {
        Comercio comercio = comercioRepository.findById(request.getComercioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comercio no encontrado"));

        if (!comercio.isActivo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El comercio no se encuentra activo para recibir pedidos");
        }

        FranjaHoraria franjaSeleccionada = null;
        if (comercio.getFranjas() != null) {
            for (FranjaHoraria f : comercio.getFranjas()) {
                if (f.getRango().equalsIgnoreCase(request.getFranjaHoraria().trim())) {
                    franjaSeleccionada = f;
                    break;
                }
            }
        }

        if (franjaSeleccionada == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La franja horaria seleccionada no existe en este comercio");
        }

        if (franjaSeleccionada.getCuposDisponibles() == null || franjaSeleccionada.getCuposDisponibles() <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No quedan cupos disponibles para la franja horaria: " + request.getFranjaHoraria());
        }

        List<ItemPedido> itemsPedido = new ArrayList<>();
        List<Producto> productosParaActualizar = new ArrayList<>();
        double total = 0.0;

        for (ItemPedidoRequest itemReq : request.getItems()) {
            Producto producto = productoRepository.findById(itemReq.getProductoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado: " + itemReq.getProductoId()));

            if (!comercio.getId().equals(producto.getComercioId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto '" + producto.getNombre() + "' no pertenece a este comercio");
            }

            if (!Boolean.TRUE.equals(producto.getActivo())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto '" + producto.getNombre() + "' no está disponible");
            }

            if (producto.getStock() == null || producto.getStock() < itemReq.getCantidad()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Stock insuficiente para el producto: " + producto.getNombre());
            }

            // Descuento preventivo de stock
            producto.setStock(producto.getStock() - itemReq.getCantidad());
            productosParaActualizar.add(producto);

            double subtotal = producto.getPrecio() * itemReq.getCantidad();
            total += subtotal;

            itemsPedido.add(new ItemPedido(
                    producto.getId(),
                    producto.getNombre(),
                    producto.getPrecio(),
                    itemReq.getCantidad(),
                    subtotal
            ));
        }

        productoRepository.saveAll(productosParaActualizar);
        franjaSeleccionada.setCuposDisponibles(franjaSeleccionada.getCuposDisponibles() - 1);
        comercioRepository.save(comercio);

        String codigoTicket = "MEVE-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Pedido pedido = new Pedido();
        pedido.setCodigoTicket(codigoTicket);
        pedido.setComercioId(comercio.getId());
        pedido.setComercioNombre(comercio.getNombre());
        pedido.setCompradorNombre(request.getCompradorNombre());
        pedido.setCompradorTelefono(request.getCompradorTelefono());
        pedido.setFranjaHoraria(franjaSeleccionada.getRango());
        pedido.setItems(itemsPedido);
        pedido.setTotal(total);
        pedido.setEstado(EstadoPedido.PENDIENTE_PAGO);
        pedido.setCreatedAt(LocalDateTime.now());
        pedido.setUpdatedAt(LocalDateTime.now());

        pedido.setWhatsappUrl(generarWhatsappUrl(comercio, pedido));

        String prefId = "PREF-SBX-" + pedido.getCodigoTicket();
        pedido.setPreferenceId(prefId);
        pedido.setSandboxInitPoint(
            "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=" + prefId
        );

        return pedidoRepository.save(pedido);
    }

    // Panel del vendedor (RF-29): pedidos de hoy de SU comercio, ordenados por franja horaria.
    // Si se pasa un estado, devuelve solo los pedidos en ese estado.
    public List<Pedido> pedidosDelDia(String comercioId, String comercioIdDelVendedor, EstadoPedido estado) {
        if (!comercioId.equals(comercioIdDelVendedor)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo podés ver los pedidos de tu comercio");
        }

        LocalDateTime inicioDelDia = LocalDate.now().atStartOfDay();
        Sort orden = Sort.by("franjaHoraria").and(Sort.by("createdAt"));
        List<Pedido> pedidos = pedidoRepository.findByComercioIdAndCreatedAtAfter(comercioId, inicioDelDia, orden);

        if (estado == null) {
            return pedidos;
        }
        return pedidos.stream()
                .filter(p -> p.getEstado() == estado)
                .toList();
    }

    // El vendedor confirma que el pedido está pagado: PENDIENTE_PAGO -> PAGADO_CONFIRMADO
    public Pedido confirmarPago(String pedidoId, String comercioIdDelVendedor) {
        Pedido pedido = buscarPedidoDelComercio(pedidoId, comercioIdDelVendedor);
        return cambiarEstado(pedido, EstadoPedido.PAGADO_CONFIRMADO);
    }

    // El cliente retira (RF-30): se verifica el código del ticket. PAGADO_CONFIRMADO -> RETIRADO
    public Pedido retirar(String pedidoId, String codigoTicket, String comercioIdDelVendedor) {
        Pedido pedido = buscarPedidoDelComercio(pedidoId, comercioIdDelVendedor);

        if (!pedido.getCodigoTicket().equalsIgnoreCase(codigoTicket.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código del ticket no coincide con el pedido");
        }
        return cambiarEstado(pedido, EstadoPedido.RETIRADO);
    }

    // El pedido tiene que existir y ser del comercio del vendedor.
    // Si es de otro comercio respondemos 404 (y no 403) para no revelar que ese pedido existe.
    private Pedido buscarPedidoDelComercio(String pedidoId, String comercioIdDelVendedor) {
        return pedidoRepository.findById(pedidoId)
                .filter(p -> p.getComercioId().equals(comercioIdDelVendedor))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
    }

    // Cambia el estado solo si el pedido sigue en el estado anterior que corresponde.
    // Es un update condicional, igual que en la expiración (#28): si el job lo expiró
    // un instante antes, Mongo no modifica nada y respondemos 409.
    private Pedido cambiarEstado(Pedido pedido, EstadoPedido nuevoEstado) {
        EstadoPedido estadoAnterior = (nuevoEstado == EstadoPedido.RETIRADO)
                ? EstadoPedido.PAGADO_CONFIRMADO
                : EstadoPedido.PENDIENTE_PAGO;

        Query query = new Query(Criteria.where("id").is(pedido.getId())
                .and("estado").is(estadoAnterior));
        Update update = new Update()
                .set("estado", nuevoEstado)
                .set("updatedAt", LocalDateTime.now());

        Pedido actualizado = mongoTemplate.findAndModify(
                query, update, FindAndModifyOptions.options().returnNew(true), Pedido.class);

        if (actualizado == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El pedido está en estado " + pedido.getEstado() + " y no puede pasar a " + nuevoEstado);
        }
        return actualizado;
    }

    private String generarWhatsappUrl(Comercio comercio, Pedido pedido) {
        String telefono = (comercio.getWhatsapp() != null && !comercio.getWhatsapp().isBlank())
                ? comercio.getWhatsapp().replaceAll("[^0-9]", "")
                : "5493884000000";

        StringBuilder mensaje = new StringBuilder();
        mensaje.append("Hola *").append(comercio.getNombre()).append("*! Realicé un pedido en *MeVe*.\n\n");
        mensaje.append("🎟️ *Ticket de Retiro:* ").append(pedido.getCodigoTicket()).append("\n");
        mensaje.append("👤 *Cliente:* ").append(pedido.getCompradorNombre()).append("\n");
        mensaje.append("⏰ *Franja de Retiro:* ").append(pedido.getFranjaHoraria()).append("\n\n");
        mensaje.append("📦 *Detalle del pedido:*\n");

        for (ItemPedido item : pedido.getItems()) {
            mensaje.append("- ").append(item.getCantidad()).append("x ")
                    .append(item.getNombre()).append(" ($").append(item.getSubtotal()).append(")\n");
        }

        mensaje.append("\n💰 *Total:* $").append(pedido.getTotal());

        String textoCodificado = URLEncoder.encode(mensaje.toString(), StandardCharsets.UTF_8);
        return "https://wa.me/" + telefono + "?text=" + textoCodificado;
    }

    public Pedido confirmarPagoIdempotente(String pedidoIdOCodigo, String paymentId) {
        Pedido pedidoActual = pedidoRepository.findById(pedidoIdOCodigo)
                .or(() -> pedidoRepository.findByCodigoTicket(pedidoIdOCodigo))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));

        if (pedidoActual.getEstado() == EstadoPedido.PAGADO_CONFIRMADO || pedidoActual.getEstado() == EstadoPedido.RETIRADO) {
            return pedidoActual; 
        }

        Pedido actualizado = cambiarEstado(pedidoActual, EstadoPedido.PAGADO_CONFIRMADO);

        actualizado.setPaymentId(paymentId != null && !paymentId.isBlank() ? paymentId : "MP-SANDBOX-SIM");
        return pedidoRepository.save(actualizado);
    }
}