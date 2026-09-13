package com.meve.backend.repositories;

import com.meve.backend.models.Comercio;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComercioRepository extends MongoRepository<Comercio, String> {
    Optional<Comercio> findBySlug(String slug);
}