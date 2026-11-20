package com.meve.backend.adapters;

import com.meve.backend.models.Comercio;
import com.meve.backend.models.ItemPedido;
import com.meve.backend.models.Pedido;
import com.meve.backend.ports.GeneradorDeTicket;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
public class WhatsAppTicketGenerator implements GeneradorDeTicket {

    @Override
    public String generarCodigoTicket() {
        return "MEVE-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    @Override
    public String generarWhatsappUrl(Comercio comercio, Pedido pedido) {
        String telefono = (comercio.getWhatsapp() != null && !comercio.getWhatsapp().isBlank())
                ? comercio.getWhatsapp().replaceAll("[^0-9]", "")
                : "5493884000000";

        StringBuilder mensaje = new StringBuilder();
        mensaje.append("Hola *").append(comercio.getNombre()).append("*! Realicé un pedido en *MeVe*.\n\n");
        mensaje.append("🎟️ *Ticket de Retiro:* ").append(pedido.getCodigoTicket()).append("\n");
        mensaje.append("👤 *Cliente:* ").append(pedido.getCompradorNombre()).append("\n");
        mensaje.append("⏰ *Franja de Retiro:* ").append(pedido.getFranjaHoraria()).append("\n\n");
        mensaje.append("📦 *Detalle del pedido:*\n");

        for (ItemPedido item : pedido.getItems()) {
            mensaje.append("- ").append(item.getCantidad()).append("x ")
                    .append(item.getNombre()).append(" ($").append(item.getSubtotal()).append(")\n");
        }

        mensaje.append("\n💰 *Total:* $").append(pedido.getTotal());

        String textoCodificado = URLEncoder.encode(mensaje.toString(), StandardCharsets.UTF_8);
        return "https://wa.me/" + telefono + "?text=" + textoCodificado;
    }
}