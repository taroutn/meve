package com.meve.backend.repositories;

import com.meve.backend.models.Producto;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoRepository extends MongoRepository<Producto, String> {
    // Spring Data MongoDB autogenera la query para esto:
    List<Producto> findByComercioId(String comercioId);
    List<Producto> findByActivoNot(Boolean activo);
    // Productos de un comercio que NO están eliminados (incluye los que no tienen el campo)
    List<Producto> findByComercioIdAndEliminadoNot(String comercioId, Boolean eliminado);
}