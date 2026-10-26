package com.meve.backend.dtos;

public record ProductoCatalogoDTO(
        String id,
        String nombre,
        Double precio,
        String comercioId,
        String comercioNombre,
        String categoria
) {
}