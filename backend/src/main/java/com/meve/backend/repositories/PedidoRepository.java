package com.meve.backend.repositories;

import com.meve.backend.models.EstadoPedido;
import com.meve.backend.models.Pedido;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends MongoRepository<Pedido, String> {
    List<Pedido> findByComercioIdOrderByCreatedAtDesc(String comercioId);
    Optional<Pedido> findByCodigoTicket(String codigoTicket);
    List<Pedido> findByEstadoAndCreatedAtBefore(EstadoPedido estado, LocalDateTime fechaLimite);
}