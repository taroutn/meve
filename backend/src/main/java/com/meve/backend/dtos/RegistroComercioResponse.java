package com.meve.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegistroComercioResponse {
    private String mensaje;
    private String comercioId;
    private String estadoComercio;
    private String usuarioId;
    private String email;
}