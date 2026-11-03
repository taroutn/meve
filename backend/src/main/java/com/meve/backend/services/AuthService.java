package com.meve.backend.services;

import com.meve.backend.dtos.LoginRequest;
import com.meve.backend.dtos.LoginResponse;
import com.meve.backend.models.Usuario;
import com.meve.backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
public class AuthService {

    private static final long SEGUNDOS_DE_VALIDEZ = 86400; // 24 horas

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtEncoder jwtEncoder;

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .filter(Usuario::isActivo)
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos"));

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
        String token = jwtEncoder.encode(JwtEncoderParameters.from(cabecera, datos.build())).getTokenValue();

        return new LoginResponse(token, "Bearer", SEGUNDOS_DE_VALIDEZ);
    }
}