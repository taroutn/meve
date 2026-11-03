package com.meve.backend.models;

// Roles que se guardan en la base. El "Guest" no es un rol guardado:
// es cualquiera que entra sin token a las rutas públicas.
public enum Rol {
    SUPERADMIN,
    VENDEDOR
}