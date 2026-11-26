package com.meve.backend.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "categorias")
public class Categoria {
    @Id
    private String id;

    private String nombre;

    @Indexed(unique = true)
    private String slug;

    private boolean activa = true;
}