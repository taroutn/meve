package com.meve.backend.dtos;

import com.meve.backend.models.EstadoComercio;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

// Body del PATCH de moderación: { "estado": "ACTIVO" } o { "estado": "SUSPENDIDO" }
@Data
public class CambioEstadoComercioRequest {
    @NotNull(message = "El estado es obligatorio")
    private EstadoComercio estado;
}