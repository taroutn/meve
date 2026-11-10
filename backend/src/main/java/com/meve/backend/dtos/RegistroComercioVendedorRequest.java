package com.meve.backend.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegistroComercioVendedorRequest {

    // Datos del Usuario Vendedor
    @NotBlank(message = "El nombre del responsable es obligatorio")
    private String nombreVendedor;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    // Datos del Comercio
    @NotBlank(message = "El nombre del comercio es obligatorio")
    private String nombreComercio;

    @NotBlank(message = "El WhatsApp de contacto es obligatorio")
    private String whatsapp;

    @NotNull(message = "La latitud es obligatoria")
    private Double latitud;

    @NotNull(message = "La longitud es obligatoria")
    private Double longitud;
}