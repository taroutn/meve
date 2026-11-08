package com.meve.backend.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

// Una franja de retiro tal como la manda el vendedor: { "rango": "17:00 - 18:00", "capacidadMaxima": 3 }
@Data
public class FranjaRequest {
    @NotBlank(message = "El rango de la franja es obligatorio (ej: 17:00 - 18:00)")
    private String rango;

    @NotNull(message = "La capacidad de la franja es obligatoria")
    @Min(value = 1, message = "La capacidad de la franja debe ser al menos 1")
    private Integer capacidadMaxima;
}