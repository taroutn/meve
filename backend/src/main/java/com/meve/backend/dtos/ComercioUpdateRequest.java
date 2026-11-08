package com.meve.backend.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

// Lo ÚNICO que el vendedor puede cambiar de su comercio (RF-12, RF-19).
// Estado, activo y slug no están acá a propósito: los maneja el sistema o el SuperAdmin.
@Data
public class ComercioUpdateRequest {
    @NotBlank(message = "Los horarios son obligatorios")
    private String horarios;

    @Valid
    @NotEmpty(message = "El comercio tiene que tener al menos una franja de retiro")
    private List<FranjaRequest> franjas;

    @NotNull(message = "La latitud es obligatoria")
    @DecimalMin(value = "-90", message = "Latitud inválida")
    @DecimalMax(value = "90", message = "Latitud inválida")
    private Double lat;

    @NotNull(message = "La longitud es obligatoria")
    @DecimalMin(value = "-180", message = "Longitud inválida")
    @DecimalMax(value = "180", message = "Longitud inválida")
    private Double lng;
}