package com.meve.backend.adapters;

import com.meve.backend.models.Pedido;
import com.meve.backend.ports.PasarelaDePago;
import org.springframework.stereotype.Component;

@Component
public class MercadoPagoSandboxAdapter implements PasarelaDePago {

    @Override
    public PreferenciaPago crearPreferencia(Pedido pedido) {
        String prefId = "PREF-SBX-" + pedido.getCodigoTicket();
        String initPoint = "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=" + prefId;
        return new PreferenciaPago(prefId, initPoint);
    }

    @Override
    public String resolverPaymentId(String paymentId) {
        return (paymentId != null && !paymentId.isBlank()) ? paymentId : "MP-SANDBOX-SIM";
    }
}