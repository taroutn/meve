package com.meve.backend.ports;

import com.meve.backend.models.Usuario;

public interface ServicioTokens {
    String generarToken(Usuario usuario);
    long obtenerSegundosDeValidez();
}