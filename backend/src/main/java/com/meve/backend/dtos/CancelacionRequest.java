package com.meve.backend.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// Para cancelar hay que conocer el id del pedido Y el código del ticket:
// los tiene el comprador (pantalla del ticket) y el vendedor (su panel).
@Data
public class CancelacionRequest {

    @NotBlank(message = "El código del ticket es obligatorio")
    private String codigoTicket;
}
