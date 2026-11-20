package com.meve.backend.services;

import com.meve.backend.dtos.ComercioUpdateRequest;
import com.meve.backend.dtos.FranjaRequest;
import com.meve.backend.models.Comercio;
import com.meve.backend.models.EstadoComercio;
import com.meve.backend.models.FranjaHoraria;
import com.meve.backend.repositories.ComercioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class ComercioService {

    @Autowired
    private ComercioRepository comercioRepository;

    public Comercio crearComercio(Comercio comercio) {
        String slug = comercio.getNombre().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        slug = slug.replaceAll("^-|-$", "");

        comercio.setSlug(slug);
        comercio.setActivo(false);
        comercio.setEstado(EstadoComercio.PENDIENTE);

        return comercioRepository.save(comercio);
    }

    public List<Comercio> listarComercios(Double lat, Double lng, Double radioKm) {
        if (lat != null && lng != null) {
            double radio = (radioKm != null && radioKm > 0) ? radioKm : 5.0;
            Point puntoComprador = new Point(lng, lat);
            Distance distancia = new Distance(radio, Metrics.KILOMETERS);
            return comercioRepository.findByActivoTrueAndUbicacionNear(puntoComprador, distancia);
        }
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
        if (nuevoEstado == EstadoComercio.PENDIENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El estado solo puede cambiarse a ACTIVO o SUSPENDIDO");
        }

        Comercio comercio = comercioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comercio no encontrado"));

        comercio.setEstado(nuevoEstado);
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

        boolean cambioUbicacion = comercio.getUbicacion() == null
                || Double.compare(comercio.getUbicacion().getY(), request.getLat()) != 0
                || Double.compare(comercio.getUbicacion().getX(), request.getLng()) != 0;

        comercio.setHorarios(request.getHorarios().trim());
        comercio.setFranjas(armarFranjas(request.getFranjas(), comercio.getFranjas()));
        // GeoJSON guarda primero la LONGITUD y después la latitud
        comercio.setUbicacion(new GeoJsonPoint(request.getLng(), request.getLat()));

        if (request.getImagenUrl() != null) {
            String url = request.getImagenUrl().trim();
            comercio.setImagenUrl(url.isEmpty() ? null : url);
        }
      
        if (cambioUbicacion) {
            comercio.setEstado(EstadoComercio.PENDIENTE);
            comercio.setActivo(false);
        }

        return comercioRepository.save(comercio);
    }

    // Arma las franjas nuevas sin perder los cupos que ya reservaron los pedidos en curso
    private List<FranjaHoraria> armarFranjas(List<FranjaRequest> nuevas, List<FranjaHoraria> actuales) {
        Map<String, Integer> cuposUsadosPorRango = new HashMap<>();
        if (actuales != null) {
            for (FranjaHoraria f : actuales) {
                if (f.getCapacidadMaxima() != null && f.getCuposDisponibles() != null) {
                    int usados = f.getCapacidadMaxima() - f.getCuposDisponibles();
                    cuposUsadosPorRango.put(f.getRango(), Math.max(usados, 0));
                }
            }
        }

        List<FranjaHoraria> resultado = new ArrayList<>();
        Set<String> rangosVistos = new HashSet<>();
        for (FranjaRequest nueva : nuevas) {
            String rango = nueva.getRango().trim();
            if (!rangosVistos.add(rango)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La franja " + rango + " está repetida");
            }
            int nuevaCapacidad = nueva.getCapacidadMaxima();
            int usados = cuposUsadosPorRango.getOrDefault(rango, 0);

            if (nuevaCapacidad < usados) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La franja '" + rango + "' ya tiene " + usados + " reservas activas; la capacidad máxima no puede ser menor."
                );
            }

            resultado.add(new FranjaHoraria(rango, nuevaCapacidad, nuevaCapacidad - usados));
        }
        return resultado;
    }
}