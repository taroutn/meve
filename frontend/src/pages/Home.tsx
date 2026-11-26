import { useState, useEffect } from 'react';
import ProductoCard from '../components/ProductCard';
import type { Product } from '../types/product';
import type { Categoria } from '../types/categoria';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface Coordenadas {
  lat: number;
  lng: number;
}

export default function Home() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [radioFiltro, setRadioFiltro] = useState('');

  // Estados de geolocalización
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoAviso, setGeoAviso] = useState<string | null>(null);

  // Categorías oficiales (RF-14): se piden una sola vez al backend
  useEffect(() => {
    fetch(`${API_URL}/api/categorias`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Categoria[]) => setCategorias(data))
      .catch(() => setCategorias([]));
  }, []);

  // Debounce de 300ms para no disparar una petición en cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounced(busqueda.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // Manejo del selector de cercanía (1, 3, 5 km o sin límite)
  const handleRadioChange = (nuevoRadio: string) => {
    setGeoAviso(null);

    if (!nuevoRadio) {
      setRadioFiltro('');
      return;
    }

    // Si ya tenemos coordenadas en memoria, aplicamos el nuevo radio directo
    if (ubicacion) {
      setRadioFiltro(nuevoRadio);
      return;
    }

    if (!('geolocation' in navigator)) {
      setGeoAviso('Tu navegador no soporta geolocalización. Se muestran todos los comercios.');
      setRadioFiltro('');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setRadioFiltro(nuevoRadio);
        setGeoLoading(false);
      },
      (geoErr) => {
        setGeoLoading(false);
        setRadioFiltro('');
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setGeoAviso('Permiso de ubicación denegado. Habilitalo en tu navegador para filtrar por cercanía.');
        } else {
          setGeoAviso('No se pudo obtener tu ubicación actual. Mostrando productos sin límite de distancia.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Consulta al backend cada vez que cambian los filtros o la ubicación
  useEffect(() => {
    // Si hay radio seleccionado pero aún estamos esperando coordenadas, aguardamos
    if (radioFiltro && !ubicacion) return;

    const controller = new AbortController();

    const fetchProductos = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (busquedaDebounced) params.set('q', busquedaDebounced);
        if (categoriaFiltro) params.set('categoria', categoriaFiltro);
        if (soloDisponibles) params.set('disponible', 'true');
        if (radioFiltro && ubicacion) {
          params.set('lat', String(ubicacion.lat));
          params.set('lng', String(ubicacion.lng));
          params.set('radioKm', radioFiltro);
        }

        const queryString = params.toString();
        const url = `${API_URL}/api/productos${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error('Error al cargar los productos. Verificá tu conexión.');
        }

        const data: Product[] = await response.json();
        setProductos(data);
    
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Error al cargar los productos.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProductos();
    return () => controller.abort();
  }, [busquedaDebounced, categoriaFiltro, soloDisponibles, radioFiltro, ubicacion]);

  const hayFiltrosActivos = Boolean(
    busqueda.trim() || categoriaFiltro || soloDisponibles || radioFiltro
  );

  const limpiarFiltros = () => {
    setBusqueda('');
    setBusquedaDebounced('');
    setCategoriaFiltro('');
    setSoloDisponibles(false);
    setRadioFiltro('');
    setGeoAviso(null);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h2>Exploración Hiperlocal</h2>
        <p>Descubrí los mejores productos de los comercios cercanos en un solo lugar.</p>
      </header>

      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar productos por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar productos por nombre o descripción"
        />

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.nombre}>
                {cat.nombre}
              </option>
          ))}
        </select>

        <select
          value={radioFiltro}
          onChange={(e) => handleRadioChange(e.target.value)}
          disabled={geoLoading}
          aria-label="Filtrar por cercanía"
        >
          <option value="">{geoLoading ? 'Obteniendo ubicación...' : 'Todos (Sin límite)'}</option>
          <option value="1">A menos de 1 km</option>
          <option value="3">A menos de 3 km</option>
          <option value="5">A menos de 5 km</option>
        </select>

        <label className="filtro-disponibles-label">
          <input
            type="checkbox"
            className="filtro-checkbox"
            checked={soloDisponibles}
            onChange={(e) => setSoloDisponibles(e.target.checked)}
          />
          <span>Solo disponibles</span>
        </label>

        {hayFiltrosActivos && (
          <button
            type="button"
            className="btn-limpiar-filtros"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {geoAviso && (
        <div role="alert" className="geo-aviso-banner">
          📍 {geoAviso}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Cargando productos...</div>
      ) : error ? (
        <div className="error-state-container">
          <span className="error-icon">🔌</span>
          <h3>Error de conexión</h3>
          <p>No pudimos conectar con el servidor para cargar los productos.</p>

          <button type="button" className="btn-retry" onClick={() => window.location.reload()}>
            Reintentar conexión
          </button>

          <small className="error-technical">{error}</small>
        </div>
      ) : productos.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#a0a0a0' }}>
          No se encontraron productos con los filtros seleccionados.
        </div>
      ) : (
        <div className="productos-grid">
          {productos.map((producto) => (
            <ProductoCard key={producto.id} product={producto} />
          ))}
        </div>
      )}
    </div>
  );
}