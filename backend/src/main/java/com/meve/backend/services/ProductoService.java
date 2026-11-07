package com.meve.backend.services;

import com.meve.backend.dtos.ProductoCatalogoDTO;
import com.meve.backend.dtos.ProductoRequest;
import com.meve.backend.models.Comercio;
import com.meve.backend.models.Producto;
import com.meve.backend.repositories.ComercioRepository;
import com.meve.backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.geo.Distance;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ComercioRepository comercioRepository;

    // El comercio sale del token del vendedor, nunca del body:
    // así nadie puede cargar productos en un comercio que no es el suyo
    public Producto crearProducto(ProductoRequest request, String comercioIdDelVendedor) {
        Producto producto = new Producto();
        producto.setComercioId(comercioIdDelVendedor);
        producto.setNombre(request.getNombre());
        producto.setCategoria(request.getCategoria().trim());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setActivo(true);
        
        return productoRepository.save(producto);
    }

    public List<Producto> listarProductosPorComercio(String comercioId) {
        List<Producto> productosDelComercio = productoRepository.findByComercioId(comercioId);
        List<Producto> activos = new ArrayList<>();

        for (Producto producto : productosDelComercio) {
            if (Boolean.TRUE.equals(producto.getActivo())) {
                activos.add(producto);
            }
        }
        return activos;
    }

    public List<ProductoCatalogoDTO> listarCatalogoPublico(
            String q,
            String categoria,
            Boolean disponible,
            Double lat,
            Double lng,
            Double radioKm
    ) {
        // 1. Obtener comercios activos
        List<Comercio> comerciosValidos;
        if (lat != null && lng != null) {
            double radio = (radioKm != null && radioKm > 0) ? radioKm : 5.0;
            comerciosValidos = comercioRepository.findByActivoTrueAndUbicacionNear(
                    new Point(lng, lat),
                    new Distance(radio, Metrics.KILOMETERS)
            );
        } else {
            comerciosValidos = comercioRepository.findByActivoTrue();
        }

        if (comerciosValidos.isEmpty()) {
            return List.of();
        }

        // Mapa manteniendo el orden de proximidad de los comercios (LinkedHashMap)
        Map<String, Comercio> mapaComercios = new LinkedHashMap<>();
        for (Comercio c : comerciosValidos) {
            mapaComercios.put(c.getId(), c);
        }

        // 2. Traer productos activos y aplicar filtros en memoria sobre el set de comercios cercanos
        List<Producto> todosActivos = productoRepository.findByActivoNot(false);
        String textoBusqueda = (q != null && !q.isBlank()) ? q.trim().toLowerCase() : null;
        String catFiltro = (categoria != null && !categoria.isBlank()) ? categoria.trim().toLowerCase() : null;

        List<ProductoCatalogoDTO> resultado = new java.util.ArrayList<>();

        // Iteramos respetando el orden de cercanía de los comercios
        for (String comercioId : mapaComercios.keySet()) {
            Comercio comercio = mapaComercios.get(comercioId);

            for (Producto p : todosActivos) {
                if (!comercioId.equals(p.getComercioId())) {
                    continue;
                }
                // Filtro de disponibilidad (RF-16)
                if (Boolean.TRUE.equals(disponible) && (p.getStock() == null || p.getStock() <= 0)) {
                    continue;
                }
                // Filtro de categoría (RF-16)
                if (catFiltro != null && (p.getCategoria() == null || !p.getCategoria().toLowerCase().equals(catFiltro))) {
                    continue;
                }
                // Búsqueda textual en nombre
                if (textoBusqueda != null) {
                    boolean coincideNombre = p.getNombre() != null && p.getNombre().toLowerCase().contains(textoBusqueda);
                    if (!coincideNombre) {
                        continue;
                    }
                }

                // Mapear al DTO público que ya usan en el frontend
                resultado.add(new ProductoCatalogoDTO(
                    p.getId(),
                    p.getNombre(),
                    p.getPrecio(),
                    p.getComercioId(),
                    comercio.getId(),
                    p.getCategoria()
                ));
            }
        }

        return resultado;
    }
}