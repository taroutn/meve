package com.meve.backend.config;

import com.meve.backend.models.Rol;
import com.meve.backend.models.Usuario;
import com.meve.backend.repositories.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class UsuariosDePrueba implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Se lee de la variable de entorno MEVE_SEED_PASSWORD. Si no está, no se crea nada.
    @Value("${meve.seed.password:}")
    private String passwordDePrueba;

    @Override
    public void run(String... args) {
        if (passwordDePrueba.isBlank()) {
            log.info("MEVE_SEED_PASSWORD no definida: no se crean usuarios de prueba");
            return;
        }
        crearSiNoExiste("admin@meve.test", "Admin MeVe", Rol.SUPERADMIN, null);
        crearSiNoExiste("burger@meve.test", "Vendedor Burger Palpalá", Rol.VENDEDOR, "651a2b3c4d5e6f7000000002");
        crearSiNoExiste("otro@meve.test", "Vendedor de otro comercio", Rol.VENDEDOR, "651a2b3c4d5e6f7000000001");
    }

    private void crearSiNoExiste(String email, String nombre, Rol rol, String comercioId) {
        if (usuarioRepository.findByEmail(email).isPresent()) {
            return;
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setNombre(nombre);
        usuario.setRol(rol);
        usuario.setComercioId(comercioId);
        usuario.setPassword(passwordEncoder.encode(passwordDePrueba));
        usuarioRepository.save(usuario);
        log.info("Usuario de prueba creado: {} ({})", email, rol);
    }
}