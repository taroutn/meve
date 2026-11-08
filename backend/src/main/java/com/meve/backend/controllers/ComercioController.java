package com.meve.backend.controllers;

import com.meve.backend.models.Comercio;
import com.meve.backend.models.EstadoPedido;
import com.meve.backend.models.Pedido;
import com.meve.backend.models.Producto;
import com.meve.backend.security.UsuarioActual;
import com.meve.backend.services.ComercioService;
import com.meve.backend.services.PedidoService;
import com.meve.backend.services.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import com.meve.backend.dtos.ComercioUpdateRequest;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/comercios")
public class ComercioController {

    @Autowired
    private ComercioService comercioService;

    @Autowired
    private ProductoService productoService;

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<Comercio> crear(@RequestBody Comercio comercio) {
        Comercio nuevo = comercioService.crearComercio(comercio);
        return new ResponseEntity<>(nuevo, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Comercio>> listar(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radioKm
    ) {
        return ResponseEntity.ok(comercioService.listarComercios(lat, lng, radioKm));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comercio> obtenerDetalle(@PathVariable String id) {
        return comercioService.obtenerComercioActivo(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{comercioId}/productos")
    public ResponseEntity<List<Producto>> obtenerCatalogoPorComercio(@PathVariable String comercioId) {
        return ResponseEntity.ok(productoService.listarProductosPorComercio(comercioId));
    }

    // Panel del vendedor: solo con token de VENDEDOR (SecurityConfig) y solo de su comercio (PedidoService)
    @GetMapping("/{comercioId}/pedidos")
    public ResponseEntity<List<Pedido>> panelDePedidos(@PathVariable String comercioId,
                                                        @RequestParam(required = false) EstadoPedido estado,
                                                        @AuthenticationPrincipal Jwt jwt) {
        String comercioDelVendedor = UsuarioActual.comercioId(jwt);
        return ResponseEntity.ok(pedidoService.pedidosDelDia(comercioId, comercioDelVendedor, estado));
    }
    // Configuración del comercio: solo su propio VENDEDOR (SecurityConfig + ComercioService)
    @PutMapping("/{id}")
    public ResponseEntity<Comercio> actualizar(@PathVariable String id,
                                                @Valid @RequestBody ComercioUpdateRequest request,
                                                @AuthenticationPrincipal Jwt jwt) {
        String comercioDelVendedor = UsuarioActual.comercioId(jwt);
        return ResponseEntity.ok(comercioService.actualizarComercio(id, request, comercioDelVendedor));
    }
}