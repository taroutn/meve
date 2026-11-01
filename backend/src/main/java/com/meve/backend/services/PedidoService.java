package com.meve.backend.services;

import com.meve.backend.dtos.ItemPedidoRequest;
import com.meve.backend.dtos.PedidoRequest;
import com.meve.backend.models.*;
import com.meve.backend.repositories.ComercioRepository;
import com.meve.backend.repositories.PedidoRepository;
import com.meve.backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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

        return pedidoRepository.save(pedido);
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
}