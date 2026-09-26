package com.meve.backend.services;

import com.meve.backend.models.Producto;
import com.meve.backend.repositories.ProductoRepository;
import com.meve.backend.security.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public Producto crearProducto(Producto producto) {
        // 1. Obtenemos el ID del comercio desde el contexto
        String tenantId = TenantContext.getCurrentTenant();
        
        if (tenantId == null) {
            throw new RuntimeException("Acceso denegado: Falta identificar el comercio (Tenant).");
        }
        
        // 2. Se lo inyectamos al producto antes de guardarlo
        producto.setComercioId(tenantId);
        return productoRepository.save(producto);
    }

    public List<Producto> listarProductos() {
        // Filtramos la base de datos para que devuelva SOLO los de este comercio
        String tenantId = TenantContext.getCurrentTenant();
        return productoRepository.findByComercioId(tenantId);
    }
}