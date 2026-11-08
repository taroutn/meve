package com.meve.backend.models;

// Ciclo de vida de un comercio dentro de MeVe.
// PENDIENTE: recién creado, todavía no aparece en la vitrina.
// ACTIVO: aprobado por el SuperAdmin, visible para los compradores.
// SUSPENDIDO: dado de baja temporalmente por el SuperAdmin.
public enum EstadoComercio {
    PENDIENTE,
    ACTIVO,
    SUSPENDIDO
}