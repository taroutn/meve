package com.meve.backend.controllers;

import com.meve.backend.dtos.ProductoCatalogoDTO;
import com.meve.backend.dtos.ProductoRequest;
import com.meve.backend.models.Producto;
import com.meve.backend.security.UsuarioActual;
import com.meve.backend.services.ProductoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@Valid @RequestBody ProductoRequest request,
                                                    @AuthenticationPrincipal Jwt jwt) {
        String comercioId = UsuarioActual.comercioId(jwt);
        Producto nuevoProducto = productoService.crearProducto(request, comercioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }

    @GetMapping
    public ResponseEntity<List<ProductoCatalogoDTO>> listarCatalogo() {
        return ResponseEntity.ok(productoService.listarCatalogoPublico());
    }
}