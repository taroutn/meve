package com.meve.backend.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RetiroRequest {
    @NotBlank(message = "El código del ticket es obligatorio")
    private String codigoTicket;
}