package com.meve.backend.repositories;

import com.meve.backend.models.Producto;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoRepository extends MongoRepository<Producto, String> {
    // Spring Data MongoDB autogenera la query para esto:
    List<Producto> findByComercioId(String comercioId);
}