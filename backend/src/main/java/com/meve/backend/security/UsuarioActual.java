package com.meve.backend.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

// Datos del usuario que hizo el request, leídos del token (nunca del body)
public final class UsuarioActual {

    private UsuarioActual() {
    }

    public static String comercioId(Jwt jwt) {
        String comercioId = jwt.getClaimAsString("comercioId");
        if (comercioId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El usuario no tiene un comercio asignado");
        }
        return comercioId;
    }
}