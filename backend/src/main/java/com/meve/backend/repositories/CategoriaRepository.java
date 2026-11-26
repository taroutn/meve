package com.meve.backend.repositories;

import com.meve.backend.models.Categoria;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends MongoRepository<Categoria, String> {
    List<Categoria> findByActivaTrueOrderByNombreAsc();
    Optional<Categoria> findBySlug(String slug);
}