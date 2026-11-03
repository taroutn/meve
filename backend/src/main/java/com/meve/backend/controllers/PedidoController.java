package com.meve.backend.controllers;

import com.meve.backend.dtos.PedidoRequest;
import com.meve.backend.dtos.RetiroRequest;
import com.meve.backend.models.Pedido;
import com.meve.backend.security.UsuarioActual;
import com.meve.backend.services.PedidoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<Pedido> crearPedido(@Valid @RequestBody PedidoRequest request) {
        Pedido nuevoPedido = pedidoService.registrarPedido(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
    }

    // Solo VENDEDOR (SecurityConfig) y solo pedidos de su comercio (PedidoService)
    @PatchMapping("/{id}/confirmar-pago")
    public ResponseEntity<Pedido> confirmarPago(@PathVariable String id,
                                                @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(pedidoService.confirmarPago(id, UsuarioActual.comercioId(jwt)));
    }

    @PatchMapping("/{id}/retirar")
    public ResponseEntity<Pedido> retirar(@PathVariable String id,
                                            @Valid @RequestBody RetiroRequest request,
                                            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(pedidoService.retirar(id, request.getCodigoTicket(), UsuarioActual.comercioId(jwt)));
    }
}