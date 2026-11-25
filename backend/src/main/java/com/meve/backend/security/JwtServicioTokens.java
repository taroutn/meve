package com.meve.backend.security;

import com.meve.backend.models.Usuario;
import com.meve.backend.ports.ServicioTokens;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class JwtServicioTokens implements ServicioTokens {

    private static final long SEGUNDOS_DE_VALIDEZ = 86400; // 24 horas

    @Autowired
    private JwtEncoder jwtEncoder;

    @Override
    public String generarToken(Usuario usuario) {
        Instant ahora = Instant.now();

        JwtClaimsSet.Builder datos = JwtClaimsSet.builder()
                .issuer("meve")
                .subject(usuario.getEmail())
                .issuedAt(ahora)
                .expiresAt(ahora.plusSeconds(SEGUNDOS_DE_VALIDEZ))
                .claim("rol", usuario.getRol().name());

        if (usuario.getComercioId() != null) {
            datos.claim("comercioId", usuario.getComercioId());
        }

        JwsHeader cabecera = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(cabecera, datos.build())).getTokenValue();
    }

    @Override
    public long obtenerSegundosDeValidez() {
        return SEGUNDOS_DE_VALIDEZ;
    }
}