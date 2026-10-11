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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ComercioRepository comercioRepository;

    public Producto crearProducto(ProductoRequest request) {
        Producto producto = new Producto();
        producto.setComercioId(request.getComercioId());
        producto.setNombre(request.getNombre());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setActivo(true);
        
        return productoRepository.save(producto);
    }

    public List<ProductoCatalogoDTO> listarCatalogoPublico() {
        // 1. Traemos los productos activos
        List<Producto> productos = productoRepository.findByActivoNot(false);

        // 2. Juntamos los ids de sus comercios, sin repetir
        Set<String> comercioIds = new HashSet<>();
        for (Producto producto : productos) {
            if (producto.getComercioId() != null) {
                comercioIds.add(producto.getComercioId());
            }
        }

        // 3. Traemos todos esos comercios en UNA sola consulta
        //    y armamos un "diccionario": id del comercio -> nombre del comercio
        Map<String, String> nombrePorComercioId = new HashMap<>();
        for (Comercio comercio : comercioRepository.findAllById(comercioIds)) {
            nombrePorComercioId.put(comercio.getId(), comercio.getNombre());
        }

        // 4. Armamos la respuesta: cada producto con el nombre de su comercio
        //    (si el comercio no existe, comercioNombre queda en null)
        List<ProductoCatalogoDTO> catalogo = new ArrayList<>();
        for (Producto producto : productos) {
            catalogo.add(new ProductoCatalogoDTO(
                    producto.getId(),
                    producto.getNombre(),
                    producto.getPrecio(),
                    producto.getComercioId(),
                    nombrePorComercioId.get(producto.getComercioId())
            ));
        }
        return catalogo;
    }
}