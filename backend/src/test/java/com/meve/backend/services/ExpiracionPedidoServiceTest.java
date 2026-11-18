package com.meve.backend.services;

import com.meve.backend.models.EstadoPedido;
import com.meve.backend.models.Pedido;
import com.meve.backend.repositories.PedidoRepository;
import com.mongodb.client.result.UpdateResult;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

// ---------- 4. Rollback al expirar pedidos vencidos (RF-22, RNF-08) ----------
@ExtendWith(MockitoExtension.class)
class ExpiracionPedidoServiceTest {

    @Mock private PedidoRepository pedidoRepository;
    @Mock private MongoTemplate mongoTemplate;
    @Mock private PedidoService pedidoService;

    @InjectMocks private ExpiracionPedidoService expiracionService;

    @Test
    void unPedidoVencidoPasaAExpiradoYDevuelveStockYCupo() {
        ReflectionTestUtils.setField(expiracionService, "minutosExpiracion", 15L);
        Pedido vencido = pedidoPendiente();
        when(pedidoRepository.findByEstadoAndCreatedAtBefore(eq(EstadoPedido.PENDIENTE_PAGO), any()))
                .thenReturn(List.of(vencido));
        when(mongoTemplate.updateFirst(any(Query.class), any(Update.class), eq(Pedido.class)))
                .thenReturn(UpdateResult.acknowledged(1, 1L, null));

        expiracionService.expirarPedidosVencidos();

        ArgumentCaptor<Update> update = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate).updateFirst(any(Query.class), update.capture(), eq(Pedido.class));
        Document set = (Document) update.getValue().getUpdateObject().get("$set");
        assertEquals(EstadoPedido.EXPIRADO, set.get("estado"));
        assertNotNull(set.get("expiradoEn"), "Tiene que registrar cuándo expiró (RNF-11)");

        verify(pedidoService).liberarReserva(vencido);
    }

    @Test
    void siOtroProcesoLoCambioAntesNoDevuelveNada() {
        ReflectionTestUtils.setField(expiracionService, "minutosExpiracion", 15L);
        when(pedidoRepository.findByEstadoAndCreatedAtBefore(eq(EstadoPedido.PENDIENTE_PAGO), any()))
                .thenReturn(List.of(pedidoPendiente()));
        // Se pagó o se canceló justo antes: el update condicional no modifica nada
        when(mongoTemplate.updateFirst(any(Query.class), any(Update.class), eq(Pedido.class)))
                .thenReturn(UpdateResult.acknowledged(0, 0L, null));

        expiracionService.expirarPedidosVencidos();

        verify(pedidoService, never()).liberarReserva(any());
    }

    private Pedido pedidoPendiente() {
        Pedido p = new Pedido();
        p.setId("ped1");
        p.setComercioId("c1");
        p.setEstado(EstadoPedido.PENDIENTE_PAGO);
        return p;
    }
}
