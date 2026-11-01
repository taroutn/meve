package com.meve.backend.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "pedidos")
public class Pedido {
    @Id
    private String id;

    private String codigoTicket;
    private String comercioId;
    private String comercioNombre;

    private String compradorNombre;
    private String compradorTelefono;
    private String franjaHoraria;

    private List<ItemPedido> items = new ArrayList<>();
    private Double total;

    private EstadoPedido estado = EstadoPedido.PENDIENTE_PAGO;
    private String whatsappUrl;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}