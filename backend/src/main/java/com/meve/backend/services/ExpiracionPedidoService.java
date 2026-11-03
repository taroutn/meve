package com.meve.backend.services;

import com.meve.backend.models.Comercio;
import com.meve.backend.models.EstadoPedido;
import com.meve.backend.models.ItemPedido;
import com.meve.backend.models.Pedido;
import com.meve.backend.models.Producto;
import com.meve.backend.repositories.PedidoRepository;
import com.mongodb.client.result.UpdateResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class ExpiracionPedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Value("${meve.pedidos.minutos-expiracion:15}")
    private long minutosExpiracion;

    @Scheduled(fixedDelay = 60000)
    public void expirarPedidosVencidos() {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(minutosExpiracion);

        List<Pedido> vencidos = pedidoRepository
                .findByEstadoAndCreatedAtBefore(EstadoPedido.PENDIENTE_PAGO, limite);

        for (Pedido pedido : vencidos) {
            if (marcarComoExpirado(pedido)) {
                devolverStockYCupo(pedido);
                log.info("Pedido {} expirado: stock y cupo devueltos", pedido.getCodigoTicket());
            }
        }
    }

    // Pasa el pedido a EXPIRADO solo si todavía está en PENDIENTE_PAGO.
    // Devuelve true si fue este job el que lo cambió.
    private boolean marcarComoExpirado(Pedido pedido) {
        Query query = new Query(Criteria.where("id").is(pedido.getId())
                .and("estado").is(EstadoPedido.PENDIENTE_PAGO));

        Update update = new Update()
                .set("estado", EstadoPedido.EXPIRADO)
                .set("updatedAt", LocalDateTime.now());

        UpdateResult resultado = mongoTemplate.updateFirst(query, update, Pedido.class);
        return resultado.getModifiedCount() == 1;
    }

    // Devuelve al stock las unidades del pedido y libera el cupo de su franja.
    private void devolverStockYCupo(Pedido pedido) {
        for (ItemPedido item : pedido.getItems()) {
            Query queryProducto = new Query(Criteria.where("id").is(item.getProductoId()));
            Update sumarStock = new Update().inc("stock", item.getCantidad());
            mongoTemplate.updateFirst(queryProducto, sumarStock, Producto.class);
        }

        Query queryFranja = new Query(Criteria.where("id").is(pedido.getComercioId())
                .and("franjas.rango").is(pedido.getFranjaHoraria()));
        Update sumarCupo = new Update().inc("franjas.$.cuposDisponibles", 1);
        mongoTemplate.updateFirst(queryFranja, sumarCupo, Comercio.class);
    }
}