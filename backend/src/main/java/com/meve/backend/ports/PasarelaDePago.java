package com.meve.backend.ports;

import com.meve.backend.models.Pedido;

public interface PasarelaDePago {
    PreferenciaPago crearPreferencia(Pedido pedido);
    String resolverPaymentId(String paymentId);

    record PreferenciaPago(String preferenceId, String sandboxInitPoint) {}
}