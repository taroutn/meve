package com.meve.backend.services;

import com.meve.backend.dtos.LoginRequest;
import com.meve.backend.dtos.LoginResponse;
import com.meve.backend.dtos.RegistroComercioResponse;
import com.meve.backend.dtos.RegistroComercioVendedorRequest;
import com.meve.backend.models.Comercio;
import com.meve.backend.models.EstadoComercio;
import com.meve.backend.models.Rol;
import com.meve.backend.models.Usuario;
import com.meve.backend.ports.ServicioTokens;
import com.meve.backend.repositories.ComercioRepository;
import com.meve.backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ServicioTokens servicioTokens;

    @Autowired
    private ComercioRepository comercioRepository;

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .filter(Usuario::isActivo)
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos"));

        String token = servicioTokens.generarToken(usuario);

        return new LoginResponse(
                token,
                "Bearer",
                servicioTokens.obtenerSegundosDeValidez(),
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