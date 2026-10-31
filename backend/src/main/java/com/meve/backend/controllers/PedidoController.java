package com.meve.backend.controllers;

import com.meve.backend.dtos.PedidoRequest;
import com.meve.backend.models.Pedido;
import com.meve.backend.services.PedidoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
}