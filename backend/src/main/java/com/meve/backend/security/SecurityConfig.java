package com.meve.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable()) // API sin sesiones ni cookies: CSRF no aplica
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Se evalúan de arriba hacia abajo: gana la PRIMERA regla que coincide

                // 1. Rutas del VENDEDOR (van antes que el GET público de /api/comercios/**)
                .requestMatchers(HttpMethod.GET, "/api/comercios/*/pedidos").hasRole("VENDEDOR")
                .requestMatchers(HttpMethod.PATCH, "/api/pedidos/*/confirmar-pago").hasRole("VENDEDOR")
                .requestMatchers(HttpMethod.PATCH, "/api/pedidos/*/retirar").hasRole("VENDEDOR")
                .requestMatchers(HttpMethod.POST, "/api/productos").hasRole("VENDEDOR")

                // 2. Rutas del SUPERADMIN
                .requestMatchers(HttpMethod.POST, "/api/comercios").hasRole("SUPERADMIN")

                // 3. Rutas públicas (Guest): sin token
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/pedidos", "/api/pedidos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/productos", "/api/comercios/**").permitAll()

                // 4. Cualquier otra cosa: con token válido
                .anyRequest().authenticated()
            )
            // Lee el header "Authorization: Bearer <token>" y verifica la firma con el JwtDecoder
            .oauth2ResourceServer(oauth -> oauth
                .jwt(jwt -> jwt.jwtAuthenticationConverter(rolesDelToken())));

        return http.build();
    }

    // Convierte el claim "rol" del token (ej. "VENDEDOR") en el permiso ROLE_VENDEDOR
    private JwtAuthenticationConverter rolesDelToken() {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("rol");
        roles.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);
        return converter;
    }

    // CORS: qué sitios web (orígenes) pueden llamar a esta API desde el navegador
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173")); // frontend de Vite en desarrollo
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}