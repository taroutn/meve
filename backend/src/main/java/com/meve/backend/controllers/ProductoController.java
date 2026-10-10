package com.meve.backend.controllers;

import com.meve.backend.dtos.ProductoRequest;
import com.meve.backend.models.Producto;
import com.meve.backend.services.ProductoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@Valid @RequestBody ProductoRequest request) {
        Producto nuevoProducto = productoService.crearProducto(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }
}