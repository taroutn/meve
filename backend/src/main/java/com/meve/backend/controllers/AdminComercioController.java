package com.meve.backend.controllers;

import com.meve.backend.dtos.CambioEstadoComercioRequest;
import com.meve.backend.models.Comercio;
import com.meve.backend.services.ComercioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Moderación de comercios (RF-07). Todo /api/admin/** exige rol SUPERADMIN (SecurityConfig)
@RestController
@RequestMapping("/api/admin/comercios")
public class AdminComercioController {

    @Autowired
    private ComercioService comercioService;

    // Lista TODOS los comercios, incluidos los PENDIENTE y SUSPENDIDO
    @GetMapping
    public ResponseEntity<List<Comercio>> listarTodos() {
        return ResponseEntity.ok(comercioService.listarTodos());
    }

    // Aprueba (ACTIVO) o suspende (SUSPENDIDO) un comercio
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Comercio> cambiarEstado(@PathVariable String id,
                                                    @Valid @RequestBody CambioEstadoComercioRequest request) {
        return ResponseEntity.ok(comercioService.cambiarEstado(id, request.getEstado()));
    }
}