package com.meve.backend.ports;

import com.meve.backend.models.Comercio;
import com.meve.backend.models.Pedido;

public interface GeneradorDeTicket {
    String generarCodigoTicket();
    String generarWhatsappUrl(Comercio comercio, Pedido pedido);
}