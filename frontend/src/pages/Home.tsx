import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import './Home.css'; // O el CSS que uses

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtros
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [radio, setRadio] = useState('todos');
  
  // Coordenadas
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // 1. Obtener ubicación al cargar
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocalización denegada o falló. Usando fallback de Jujuy.", error);
          // Fallback a San Salvador de Jujuy / Palpalá
          setLat(-24.1858);
          setLng(-65.2995);
        }
      );
    } else {
      setLat(-24.1858);
      setLng(-65.2995);
    }
  }, []);

  // 2. Buscar productos cuando cambian los filtros o la ubicación
  useEffect(() => {
    // Evitamos buscar si todavía no tenemos las coordenadas iniciales
    if (lat === null || lng === null) return;

    const fetchProductos = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (categoria) params.append('categoria', categoria);
        
        // Si el radio no es "todos", enviamos lat, lng y el radio
        if (radio !== 'todos') {
          params.append('lat', lat.toString());
          params.append('lng', lng.toString());
          params.append('radioKm', radio);
        }

        const response = await fetch(`http://localhost:8080/api/productos?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProductos(data);
        }
      } catch (error) {
        console.error("Error al buscar productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [q, categoria, radio, lat, lng]);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Exploración Hiperlocal</h1>
        <p>Descubrí los mejores productos de los comercios cercanos en un solo lugar.</p>
      </header>

      {/* Barra de Filtros (RF-14, RF-15, RF-16) */}
      <div className="filtros-container">
        <input 
          type="text" 
          placeholder="Buscar productos por nombre..." 
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="search-input"
        />
        
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="filter-select">
          <option value="">Todas las categorías</option>
          <option value="comida rápida">Comida Rápida</option>
          <option value="panadería">Panadería</option>
          <option value="kiosco">Kiosco</option>
          <option value="saludable">Saludable</option>
        </select>

        <select value={radio} onChange={(e) => setRadio(e.target.value)} className="filter-select">
          <option value="1">Radio: 1 km</option>
          <option value="3">Radio: 3 km</option>
          <option value="5">Radio: 5 km</option>
          <option value="todos">Todos (Sin límite)</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Buscando productos cercanos...</p>
      ) : (
        <div className="productos-grid">
          {productos.length > 0 ? (
            productos.map((prod: any) => (
              <ProductCard key={prod.id} product={prod} />
            ))
          ) : (
            <p className="no-results">No se encontraron productos en tu zona con esos filtros.</p>
          )}
        </div>
      )}
    </div>
  );
}