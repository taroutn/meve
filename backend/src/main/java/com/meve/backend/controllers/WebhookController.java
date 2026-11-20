package com.meve.backend.controllers;

import com.meve.backend.models.Pedido;
import com.meve.backend.services.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pedidos/webhook")
public class WebhookController {

    @Autowired
    private PedidoService pedidoService;

    // Webhook de Mercado Pago SIMULADO: no valida la firma x-signature de MP.
    // Cualquiera que conozca el id del pedido o el código del ticket puede marcarlo como pagado.
    @PostMapping
    public ResponseEntity<Pedido> recibirWebhookMercadoPago(
            @RequestParam(name = "pedidoId") String pedidoId,
            @RequestParam(name = "data.id", required = false) String paymentId
    ) {
        Pedido pedidoConfirmado = pedidoService.confirmarPagoIdempotente(pedidoId, paymentId);
        return ResponseEntity.ok(pedidoConfirmado);
    }
}