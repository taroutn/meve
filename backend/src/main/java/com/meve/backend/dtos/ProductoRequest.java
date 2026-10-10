package com.meve.backend.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ProductoRequest {
    
    @NotBlank(message = "El ID del comercio es obligatorio")
    private String comercioId;
    
    @NotBlank(message = "El nombre del producto no puede estar vacío")
    private String nombre;
    
    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a cero")
    private Double precio;
    
    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;
}