package com.meve.backend.controllers;

import com.meve.backend.dtos.LoginRequest;
import com.meve.backend.dtos.LoginResponse;
import com.meve.backend.dtos.RegistroComercioResponse;
import com.meve.backend.dtos.RegistroComercioVendedorRequest;
import com.meve.backend.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/registro-comercio")
    public ResponseEntity<RegistroComercioResponse> registrarComercio(
            @Valid @RequestBody RegistroComercioVendedorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registrarComercioYVendedor(request));
    }
}