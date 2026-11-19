package com.meve.backend.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "comercios")
public class Comercio {
    @Id
    private String id;
    private String nombre;
    private String slug;
    private String descripcion;
    private String whatsapp;
    private String horarios;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint ubicacion;

    private List<FranjaHoraria> franjas = new ArrayList<>(List.of(
            new FranjaHoraria("10:00 - 11:00", 3, 3),
            new FranjaHoraria("11:00 - 12:00", 3, 3),
            new FranjaHoraria("17:00 - 18:00", 3, 3),
            new FranjaHoraria("18:00 - 19:00", 3, 3)
    ));

    private boolean activo = false;
    private EstadoComercio estado = EstadoComercio.PENDIENTE;
}