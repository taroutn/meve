package com.meve.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import lombok.Data;

@Data
@Document(collection = "comercios")
public class Comercio {
    @Id
    private String id;
    private String nombre;
    private String slug;
    private String descripcion;
    private String horarios; 
    
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint ubicacion; 
    
    private boolean activo = false;
    private String estado = "PENDIENTE";
}