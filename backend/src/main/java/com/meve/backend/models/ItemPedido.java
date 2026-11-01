package com.meve.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemPedido {
    private String productoId;
    private String nombre;
    private Double precioUnitario;
    private Integer cantidad;
    private Double subtotal;
}