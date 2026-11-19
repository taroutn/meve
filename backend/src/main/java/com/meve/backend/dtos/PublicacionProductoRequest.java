package com.meve.backend.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

// Body del PATCH de publicación: { "activo": false } pausa, { "activo": true } vuelve a publicar
@Data
public class PublicacionProductoRequest {
    @NotNull(message = "Indicá si el producto queda activo (true) o pausado (false)")
    private Boolean activo;
}