package com.meve.backend.services;

import com.meve.backend.models.Comercio;
import com.meve.backend.repositories.ComercioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComercioService {

    @Autowired
    private ComercioRepository comercioRepository;

    public Comercio crearComercio(Comercio comercio) {
        // Genera un slug simple a partir del nombre (Ej: "Mi Kiosco!" -> "mi-kiosco")
        String slug = comercio.getNombre().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        // Quitamos guiones al principio o al final si quedaron
        slug = slug.replaceAll("^-|-$", ""); 
        
        comercio.setSlug(slug);
        
        // Aseguramos que nazca con los valores por defecto del negocio
        comercio.setActivo(false);
        comercio.setEstado("PENDIENTE");
        
        return comercioRepository.save(comercio);
    }

    public List<Comercio> listarComercios() {
        return comercioRepository.findAll();
    }
}