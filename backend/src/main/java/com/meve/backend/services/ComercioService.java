package com.meve.backend.services;

import com.meve.backend.models.Comercio;
import com.meve.backend.models.EstadoComercio;
import com.meve.backend.repositories.ComercioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.meve.backend.dtos.ComercioUpdateRequest;
import com.meve.backend.dtos.FranjaRequest;
import com.meve.backend.models.FranjaHoraria;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.List;
import java.util.Optional;

@Service
public class ComercioService {

    @Autowired
    private ComercioRepository comercioRepository;

    public Comercio crearComercio(Comercio comercio) {
        // Genera un slug simple a partir del nombre (Ej: "Mi Kiosco!" -> "mi-kiosco")
        String slug = comercio.getNombre().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        // Quitamos guiones al principio o al final si quedaron
        slug = slug.replaceAll("^-|-$", "");

        comercio.setSlug(slug);

        // Aseguramos que nazca con los valores por defecto del negocio
        comercio.setActivo(false);
        comercio.setEstado(EstadoComercio.PENDIENTE);

        return comercioRepository.save(comercio);
    }

    public List<Comercio> listarComercios() {
        return comercioRepository.findByActivoTrue();
    }

    public Optional<Comercio> obtenerComercioActivo(String id) {
        return comercioRepository.findById(id)
                .filter(Comercio::isActivo);
    }
        // ---------- Moderación del SuperAdmin (RF-07) ----------

    public List<Comercio> listarTodos() {
        return comercioRepository.findAll();
    }

    public Comercio cambiarEstado(String id, EstadoComercio nuevoEstado) {
        // La moderación solo aprueba o suspende: volver a PENDIENTE no tiene sentido
        if (nuevoEstado == EstadoComercio.PENDIENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El estado solo puede cambiarse a ACTIVO o SUSPENDIDO");
        }

        Comercio comercio = comercioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comercio no encontrado"));

        comercio.setEstado(nuevoEstado);
        // "activo" es lo que miran la vitrina y los pedidos: solo un comercio ACTIVO es visible
        comercio.setActivo(nuevoEstado == EstadoComercio.ACTIVO);

        return comercioRepository.save(comercio);
    }
    // ---------- Configuración del comercio por su VENDEDOR (RF-12, RF-19) ----------

    public Comercio actualizarComercio(String id, ComercioUpdateRequest request, String comercioIdDelVendedor) {
        if (!id.equals(comercioIdDelVendedor)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo podés modificar tu propio comercio");
        }

        Comercio comercio = comercioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comercio no encontrado"));

        comercio.setHorarios(request.getHorarios().trim());
        comercio.setFranjas(armarFranjas(request.getFranjas(), comercio.getFranjas()));
        // GeoJSON guarda primero la LONGITUD y después la latitud
        comercio.setUbicacion(new GeoJsonPoint(request.getLng(), request.getLat()));

        return comercioRepository.save(comercio);
    }

    // Arma las franjas nuevas sin perder los cupos que ya reservaron los pedidos en curso
    private List<FranjaHoraria> armarFranjas(List<FranjaRequest> nuevas, List<FranjaHoraria> actuales) {
        // 1. Cuántos cupos tiene tomados cada franja actual (capacidad - disponibles)
        Map<String, Integer> cuposUsadosPorRango = new HashMap<>();
        if (actuales != null) {
            for (FranjaHoraria f : actuales) {
                if (f.getCapacidadMaxima() != null && f.getCuposDisponibles() != null) {
                    int usados = f.getCapacidadMaxima() - f.getCuposDisponibles();
                    cuposUsadosPorRango.put(f.getRango(), Math.max(usados, 0));
                }
            }
        }

        // 2. Armamos las nuevas descontando lo ya reservado en el mismo rango
        List<FranjaHoraria> resultado = new ArrayList<>();
        Set<String> rangosVistos = new HashSet<>();
        for (FranjaRequest nueva : nuevas) {
            String rango = nueva.getRango().trim();
            if (!rangosVistos.add(rango)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La franja " + rango + " está repetida");
            }
            int usados = cuposUsadosPorRango.getOrDefault(rango, 0);
            int disponibles = Math.max(nueva.getCapacidadMaxima() - usados, 0);
            resultado.add(new FranjaHoraria(rango, nueva.getCapacidadMaxima(), disponibles));
        }
        return resultado;
    }
}