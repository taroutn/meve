package com.meve.backend.services;

import com.meve.backend.dtos.LoginRequest;
import com.meve.backend.dtos.LoginResponse;
import com.meve.backend.dtos.RegistroComercioResponse;
import com.meve.backend.dtos.RegistroComercioVendedorRequest;
import com.meve.backend.models.Comercio;
import com.meve.backend.models.EstadoComercio;
import com.meve.backend.models.Rol;
import com.meve.backend.models.Usuario;
import com.meve.backend.repositories.ComercioRepository;
import com.meve.backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
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

    @Autowired
    private ComercioRepository comercioRepository;

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

        return new LoginResponse(
                token,
                "Bearer",
                SEGUNDOS_DE_VALIDEZ,
                usuario.getRol().name(),
                usuario.getComercioId(),
                usuario.getEmail());
    }

    public RegistroComercioResponse registrarComercioYVendedor(RegistroComercioVendedorRequest req) {
        String emailNormalizado = req.getEmail().trim().toLowerCase();

        if (usuarioRepository.findByEmail(emailNormalizado).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario registrado con ese email");
        }

        // Crear el Comercio en estado PENDIENTE
        Comercio nuevoComercio = new Comercio();
        nuevoComercio.setNombre(req.getNombreComercio().trim());
        nuevoComercio.setWhatsapp(req.getWhatsapp().trim());
        nuevoComercio.setEstado(EstadoComercio.PENDIENTE); // Requiere aprobación del SuperAdmin
        nuevoComercio.setActivo(false);

        // GeoJSON Point: [longitud, latitud]
        nuevoComercio.setUbicacion(new GeoJsonPoint(req.getLongitud(), req.getLatitud()));

        Comercio comercioGuardado = comercioRepository.save(nuevoComercio);

        // Crear el Usuario con rol VENDEDOR y vincularle el comercioId recién creado
        Usuario nuevoVendedor = new Usuario();
        nuevoVendedor.setNombre(req.getNombreVendedor().trim());
        nuevoVendedor.setEmail(emailNormalizado);
        nuevoVendedor.setPassword(passwordEncoder.encode(req.getPassword()));
        nuevoVendedor.setRol(Rol.VENDEDOR);
        nuevoVendedor.setActivo(true);
        nuevoVendedor.setComercioId(comercioGuardado.getId());

        Usuario vendedorGuardado = usuarioRepository.save(nuevoVendedor);

        return new RegistroComercioResponse(
                "Comercio registrado en estado PENDIENTE y vinculado al vendedor correctamente",
                comercioGuardado.getId(),
                comercioGuardado.getEstado().name(),
                vendedorGuardado.getId(),
                vendedorGuardado.getEmail());
    }
}