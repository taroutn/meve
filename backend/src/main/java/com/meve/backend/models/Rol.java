package com.meve.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "roles")
public class Rol {
    @Id
    private String id;
    private String nombre; 
}