package com.meve.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FranjaHoraria {
    private String rango; // Ej: "17:00 - 17:30"
    private Integer capacidadMaxima = 3;
    private Integer cuposDisponibles = 3;
}