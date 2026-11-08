package com.meve.backend.controllers;

import com.meve.backend.dtos.ProductoRequest;
import com.meve.backend.dtos.PublicacionProductoRequest;
import com.meve.backend.models.Producto;
import com.meve.backend.security.UsuarioActual;
import com.meve.backend.services.InventarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Endpoints del VENDEDOR sobre sus productos. Comparte el prefijo /api/productos
// con ProductoController (catálogo público), pero cada ruta exige rol VENDEDOR (SecurityConfig)
@RestController
@RequestMapping("/api/productos")
public class InventarioController {

    @Autowired
    private InventarioService inventarioService;

    @GetMapping("/mios")
    public ResponseEntity<List<Producto>> misProductos(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(inventarioService.listarMisProductos(UsuarioActual.comercioId(jwt)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> editar(@PathVariable String id,
                                            @Valid @RequestBody ProductoRequest request,
                                            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(inventarioService.editarProducto(id, request, UsuarioActual.comercioId(jwt)));
    }

    @PatchMapping("/{id}/publicacion")
    public ResponseEntity<Producto> cambiarPublicacion(@PathVariable String id,
                                                        @Valid @RequestBody PublicacionProductoRequest request,
                                                        @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(inventarioService.cambiarPublicacion(id, request.getActivo(), UsuarioActual.comercioId(jwt)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        inventarioService.eliminarProducto(id, UsuarioActual.comercioId(jwt));
        return ResponseEntity.noContent().build();
    }
}