package com.meve.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "comercios")
public class Comercio {
    @Id
    private String id;
    
    private String nombre;
    
    // Identificador único para la URL (ej: meve.com/mi-local)
    private String slug; 
    
    private boolean activo = false;
    
    private String estado = "PENDIENTE";
}