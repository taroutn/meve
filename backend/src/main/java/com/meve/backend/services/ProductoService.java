package com.meve.backend.services;

import com.meve.backend.dtos.ProductoRequest;
import com.meve.backend.models.Producto;
import com.meve.backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public Producto crearProducto(ProductoRequest request) {
        Producto producto = new Producto();
        producto.setComercioId(request.getComercioId());
        producto.setNombre(request.getNombre());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setActivo(true);
        
        return productoRepository.save(producto);
    }
}