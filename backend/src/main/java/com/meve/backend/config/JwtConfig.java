package com.meve.backend.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtConfig {

    // Se lee de la variable de entorno MEVE_JWT_SECRET
    @Value("${meve.jwt.secret:}")
    private String secreto;

    private SecretKey clave() {
        if (secreto == null || secreto.length() < 32) {
            throw new IllegalStateException(
                    "ERROR CRÍTICO: MEVE_JWT_SECRET no está definida o tiene menos de 32 caracteres.");
        }
        return new SecretKeySpec(secreto.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    // Firma los tokens que entrega el login
    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(clave()));
    }

    // Verifica la firma de los tokens que llegan en cada request
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(clave())
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }
}