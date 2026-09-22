package com.meve.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Set;

@Data
@Document(collection = "usuarios")
public class Usuario {
    @Id
    private String id;
    private String comercioId; 
    private String nombre;
    private String email;
    private String password;
    
    @DBRef
    private Set<Rol> roles;
    private boolean activo = true;
}