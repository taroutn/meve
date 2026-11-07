package com.meve.backend.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class PedidoRequest {
    @NotBlank(message = "El comercioId es obligatorio")
    private String comercioId;

    @NotBlank(message = "El nombre del comprador es obligatorio")
    private String compradorNombre;

    @NotBlank(message = "El teléfono del comprador es obligatorio")
    private String compradorTelefono;

    @NotBlank(message = "La franja horaria de retiro es obligatoria")
    private String franjaHoraria;

    @NotEmpty(message = "El pedido debe contener al menos un ítem")
    @Valid
    private List<ItemPedidoRequest> items;
}