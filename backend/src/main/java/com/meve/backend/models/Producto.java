package com.meve.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "productos")
public class Producto {
    @Id
    private String id;
    
    // Este es el vínculo crucial con el Tenant
    private String comercioId; 
    
    private String nombre;
    private Double precio;
}