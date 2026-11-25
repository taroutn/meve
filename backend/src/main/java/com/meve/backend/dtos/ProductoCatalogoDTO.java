package com.meve.backend.dtos;

public record ProductoCatalogoDTO(
        String id,
        String nombre,
        String descripcion,
        Double precio,
        String comercioId,
        String comercioNombre,
        String categoria,
        String imagenUrl
) {
}