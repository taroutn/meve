package com.meve.backend.services;

import com.meve.backend.dtos.ItemPedidoRequest;
import com.meve.backend.dtos.PedidoRequest;
import com.meve.backend.models.*;
import com.meve.backend.repositories.ComercioRepository;
import com.meve.backend.repositories.PedidoRepository;
import com.meve.backend.repositories.ProductoRepository;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

// Pruebas unitarias del ciclo de vida del pedido: sin Spring y sin MongoDB.
// Los repositorios y MongoTemplate son mocks: devuelven lo que les indicamos
// y nos dejan revisar qué se intentó guardar.
@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    private static final String FRANJA = "17:00 - 17:30";

    @Mock private PedidoRepository pedidoRepository;
    @Mock private ComercioRepository comercioRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private MongoTemplate mongoTemplate;

    @InjectMocks private PedidoService pedidoService;

    // ---------- 1. Bloqueo preventivo (RF-21, RNF-07) ----------

    @Test
    void alCrearElPedidoSeDescuentaElStockYUnCupoDeLaFranja() {
        Comercio comercio = comercioActivo("c1", 3);
        Producto hamburguesa = producto("p1", "c1", 10);
        when(comercioRepository.findById("c1")).thenReturn(Optional.of(comercio));
        when(productoRepository.findById("p1")).thenReturn(Optional.of(hamburguesa));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        Pedido pedido = pedidoService.registrarPedido(pedidoDe("c1", "p1", 4));

        assertEquals(6, hamburguesa.getStock());                              // 10 - 4
        assertEquals(2, comercio.getFranjas().get(0).getCuposDisponibles());  // 3 - 1
        verify(productoRepository).saveAll(List.of(hamburguesa));
        verify(comercioRepository).save(comercio);
        assertEquals(EstadoPedido.PENDIENTE_PAGO, pedido.getEstado());
    }

    // ---------- 2. Rechazos por stock o cupo (RF-20) ----------

    @Test
    void sinStockSuficienteResponde409YNoTocaNada() {
        when(comercioRepository.findById("c1")).thenReturn(Optional.of(comercioActivo("c1", 3)));
        when(productoRepository.findById("p1")).thenReturn(Optional.of(producto("p1", "c1", 2)));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> pedidoService.registrarPedido(pedidoDe("c1", "p1", 5)));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(productoRepository, never()).saveAll(any());
        verify(comercioRepository, never()).save(any());
        verify(pedidoRepository, never()).save(any());
    }

    @Test
    void franjaSinCupoResponde409() {
        when(comercioRepository.findById("c1")).thenReturn(Optional.of(comercioActivo("c1", 0)));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> pedidoService.registrarPedido(pedidoDe("c1", "p1", 1)));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(pedidoRepository, never()).save(any());
    }

    // ---------- 3. Webhook idempotente (RF-26) ----------

    @Test
    void notificacionRepetidaDeUnPedidoYaPagadoNoHaceNada() {
        Pedido yaPagado = pedido("ped1", "c1", EstadoPedido.PAGADO_CONFIRMADO);
        when(pedidoRepository.findById("ped1")).thenReturn(Optional.of(yaPagado));

        Pedido respuesta = pedidoService.confirmarPagoIdempotente("ped1", "MP-123");

        assertSame(yaPagado, respuesta);
        verifyNoInteractions(mongoTemplate);              // no intenta cambiar el estado
        verify(pedidoRepository, never()).save(any());    // ni guarda nada
    }

    @Test
    void primeraNotificacionPasaAPagadoYGuardaLaFecha() {
        Pedido pendiente = pedido("ped1", "c1", EstadoPedido.PENDIENTE_PAGO);
        Pedido pagado = pedido("ped1", "c1", EstadoPedido.PAGADO_CONFIRMADO);
        when(pedidoRepository.findById("ped1")).thenReturn(Optional.of(pendiente));
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), eq(Pedido.class))).thenReturn(pagado);
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        pedidoService.confirmarPagoIdempotente("ped1", "MP-123");

        Document set = setDelUpdate();
        assertEquals(EstadoPedido.PAGADO_CONFIRMADO, set.get("estado"));
        assertNotNull(set.get("pagadoEn"), "Tiene que registrar el momento del pago (RNF-11)");
    }

    // ---------- 5. Aislamiento multitenant (RF-02, RNF-06) ----------

    @Test
    void unVendedorNoPuedeConfirmarElPedidoDeOtroComercio() {
        when(pedidoRepository.findById("ped1"))
                .thenReturn(Optional.of(pedido("ped1", "c1", EstadoPedido.PENDIENTE_PAGO)));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> pedidoService.confirmarPago("ped1", "c2"));

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode()); // 404: no revela que existe
        verifyNoInteractions(mongoTemplate);
    }

    @Test
    void unVendedorNoPuedeMarcarComoRetiradoElPedidoDeOtroComercio() {
        when(pedidoRepository.findById("ped1"))
                .thenReturn(Optional.of(pedido("ped1", "c1", EstadoPedido.PAGADO_CONFIRMADO)));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> pedidoService.retirar("ped1", "MEVE-ABC123", "c2"));

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verifyNoInteractions(mongoTemplate);
    }

    // ---------- Cancelación (RF-23) ----------

    @Test
    void cancelarUnPedidoPendienteDevuelveStockYCupo() {
        Pedido pendiente = pedido("ped1", "c1", EstadoPedido.PENDIENTE_PAGO);
        Pedido cancelado = pedido("ped1", "c1", EstadoPedido.CANCELADO);
        when(pedidoRepository.findById("ped1")).thenReturn(Optional.of(pendiente));
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), eq(Pedido.class))).thenReturn(cancelado);

        pedidoService.cancelar("ped1", "meve-abc123"); // mayúsculas/minúsculas dan igual

        Document set = setDelUpdate();
        assertEquals(EstadoPedido.CANCELADO, set.get("estado"));
        assertNotNull(set.get("canceladoEn"));

        // Un update para el stock del producto (+2) y otro para el cupo de la franja (+1)
        ArgumentCaptor<Update> devoluciones = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate).updateFirst(any(Query.class), devoluciones.capture(), eq(Producto.class));
        verify(mongoTemplate).updateFirst(any(Query.class), devoluciones.capture(), eq(Comercio.class));
        assertEquals(new Document("stock", 2), devoluciones.getAllValues().get(0).getUpdateObject().get("$inc"));
        assertEquals(new Document("franjas.$.cuposDisponibles", 1), devoluciones.getAllValues().get(1).getUpdateObject().get("$inc"));
    }

    @Test
    void cancelarConUnCodigoQueNoCoincideDevuelve400() {
        when(pedidoRepository.findById("ped1"))
                .thenReturn(Optional.of(pedido("ped1", "c1", EstadoPedido.PENDIENTE_PAGO)));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> pedidoService.cancelar("ped1", "MEVE-ZZZZZZ"));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(mongoTemplate);
    }

    @Test
    void siYaNoEstabaPendienteNoSeDevuelveNadaDosVeces() {
        // El job de expiración (o un pago) le ganó: el update condicional no encuentra el pedido
        when(pedidoRepository.findById("ped1"))
                .thenReturn(Optional.of(pedido("ped1", "c1", EstadoPedido.PENDIENTE_PAGO)));
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), eq(Pedido.class))).thenReturn(null);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> pedidoService.cancelar("ped1", "MEVE-ABC123"));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(mongoTemplate, never()).updateFirst(any(Query.class), any(Update.class), any(Class.class));
    }

    // ---------- Datos de prueba ----------

    // Lo que se le pidió a Mongo dentro de "$set" en el último cambio de estado
    private Document setDelUpdate() {
        ArgumentCaptor<Update> update = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate).findAndModify(any(Query.class), update.capture(),
                any(FindAndModifyOptions.class), eq(Pedido.class));
        return (Document) update.getValue().getUpdateObject().get("$set");
    }

    private Comercio comercioActivo(String id, int cupos) {
        Comercio c = new Comercio();
        c.setId(id);
        c.setNombre("Burger Test");
        c.setActivo(true);
        c.setFranjas(new ArrayList<>(List.of(new FranjaHoraria(FRANJA, 3, cupos))));
        return c;
    }

    private Producto producto(String id, String comercioId, int stock) {
        Producto p = new Producto();
        p.setId(id);
        p.setComercioId(comercioId);
        p.setNombre("Hamburguesa");
        p.setPrecio(100.0);
        p.setStock(stock);
        p.setActivo(true);
        return p;
    }

    private PedidoRequest pedidoDe(String comercioId, String productoId, int cantidad) {
        ItemPedidoRequest item = new ItemPedidoRequest();
        item.setProductoId(productoId);
        item.setCantidad(cantidad);

        PedidoRequest request = new PedidoRequest();
        request.setComercioId(comercioId);
        request.setCompradorNombre("Rosa");
        request.setCompradorTelefono("3884123456");
        request.setFranjaHoraria(FRANJA);
        request.setItems(List.of(item));
        return request;
    }

    private Pedido pedido(String id, String comercioId, EstadoPedido estado) {
        Pedido p = new Pedido();
        p.setId(id);
        p.setComercioId(comercioId);
        p.setCodigoTicket("MEVE-ABC123");
        p.setFranjaHoraria(FRANJA);
        p.setEstado(estado);
        p.setItems(List.of(new ItemPedido("p1", "Hamburguesa", 100.0, 2, 200.0)));
        return p;
    }
}