package com.meve.backend.controllers;

import com.meve.backend.models.Comercio;
import com.meve.backend.services.ComercioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comercios")
public class ComercioController {

    @Autowired
    private ComercioService comercioService;

    @PostMapping
    public ResponseEntity<Comercio> crear(@RequestBody Comercio comercio) {
        Comercio nuevo = comercioService.crearComercio(comercio);
        return new ResponseEntity<>(nuevo, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Comercio>> listar() {
        return ResponseEntity.ok(comercioService.listarComercios());
    }
}