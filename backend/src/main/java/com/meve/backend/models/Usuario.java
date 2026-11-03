package com.meve.backend.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "usuarios")
public class Usuario {
    @Id
    private String id;

    private String nombre;
    private String email;

    // Se guarda el hash BCrypt, nunca la contraseña en texto
    private String password;

    private Rol rol;

    // Comercio que administra el VENDEDOR. Para el SUPERADMIN queda en null.
    private String comercioId;

    private boolean activo = true;
}