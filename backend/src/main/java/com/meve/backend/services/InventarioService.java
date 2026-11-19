package com.meve.backend.services;

import com.meve.backend.dtos.ProductoRequest;
import com.meve.backend.models.Producto;
import com.meve.backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

// Gestión del inventario por parte del VENDEDOR (RF-08 a RF-11).
// En todos los métodos el comercio sale del token, nunca del body ni de la URL.
@Service
public class InventarioService {

    @Autowired
    private ProductoRepository productoRepository;

    // Productos del vendedor: activos y pausados, sin los eliminados
    public List<Producto> listarMisProductos(String comercioIdDelVendedor) {
        return productoRepository.findByComercioIdAndEliminadoNot(comercioIdDelVendedor, true);
    }

    // Editar datos y ajustar stock a mano (RF-08, RF-11)
    public Producto editarProducto(String id, ProductoRequest request, String comercioIdDelVendedor) {
        Producto producto = buscarProductoDelVendedor(id, comercioIdDelVendedor);

        producto.setNombre(request.getNombre());
        producto.setCategoria(request.getCategoria().trim());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());

        return productoRepository.save(producto);
    }

    // Pausar o volver a publicar en la vitrina (RF-10)
    public Producto cambiarPublicacion(String id, boolean activo, String comercioIdDelVendedor) {
        Producto producto = buscarProductoDelVendedor(id, comercioIdDelVendedor);
        producto.setActivo(activo);
        return productoRepository.save(producto);
    }

    // Baja lógica (RF-09): no se borra el documento para no romper pedidos históricos
    public void eliminarProducto(String id, String comercioIdDelVendedor) {
        Producto producto = buscarProductoDelVendedor(id, comercioIdDelVendedor);
        producto.setEliminado(true);
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    // Punto único de control: el producto tiene que existir, no estar eliminado
    // y pertenecer al comercio del vendedor que hace el request
    private Producto buscarProductoDelVendedor(String id, String comercioIdDelVendedor) {
        Producto producto = productoRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getEliminado()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        if (!comercioIdDelVendedor.equals(producto.getComercioId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo podés modificar productos de tu comercio");
        }
        return producto;
    }
}