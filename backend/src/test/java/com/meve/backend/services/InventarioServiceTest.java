package com.meve.backend.services;

import com.meve.backend.dtos.ProductoRequest;
import com.meve.backend.models.Producto;
import com.meve.backend.repositories.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// ---------- 5. Aislamiento multitenant sobre productos (RF-02, RNF-06) ----------
@ExtendWith(MockitoExtension.class)
class InventarioServiceTest {

    @Mock private ProductoRepository productoRepository;

    @InjectMocks private InventarioService inventarioService;

    @Test
    void unVendedorNoPuedeEditarProductosDeOtroComercio() {
        Producto ajeno = new Producto();
        ajeno.setId("p1");
        ajeno.setComercioId("c1");
        ajeno.setStock(10);
        when(productoRepository.findById("p1")).thenReturn(Optional.of(ajeno));

        ProductoRequest cambio = new ProductoRequest();
        cambio.setNombre("Precio roto");
        cambio.setCategoria("Comidas");
        cambio.setPrecio(1.0);
        cambio.setStock(0);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> inventarioService.editarProducto("p1", cambio, "c2"));

        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        assertEquals(10, ajeno.getStock());                 // no se tocó
        verify(productoRepository, never()).save(any());
    }

    @Test
    void unVendedorNoPuedeEliminarProductosDeOtroComercio() {
        Producto ajeno = new Producto();
        ajeno.setId("p1");
        ajeno.setComercioId("c1");
        when(productoRepository.findById("p1")).thenReturn(Optional.of(ajeno));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> inventarioService.eliminarProducto("p1", "c2"));

        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        verify(productoRepository, never()).save(any());
    }
}