package com.meve.backend.services;

import com.meve.backend.models.Categoria;
import com.meve.backend.repositories.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    public List<Categoria> listarActivas() {
        return categoriaRepository.findByActivaTrueOrderByNombreAsc();
    }

    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

}