import { useState, useEffect } from 'react';
import ProductoCard from '../components/ProductCard';
import type { Product } from '../types/product';
import './Home.css';

// Usar variable de entorno para despliegue
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Home() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [radioFiltro, setRadioFiltro] = useState('');

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Ajustar endpoint a la variable de entorno
        const response = await fetch(`${API_URL}/api/productos`);
        
        if (!response.ok) {
          throw new Error('Error al cargar los productos. Verifica tu conexión.');
        }
        
        const data = await response.json();
        setProductos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Extraer categorías únicas dinámicamente de los productos cargados
  const categoriasUnicas = Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)));

  // Aplicar filtros en el frontend
  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaFiltro ? p.categoria === categoriaFiltro : true;
    return matchBusqueda && matchCategoria;
  });

  return (
    <div className="home-container">
      <header className="home-header">
        <h2>Exploración Hiperlocal</h2>
        <p>Descubrí los mejores productos de los comercios cercanos en un solo lugar.</p>
      </header>

      <div className="filtros-container">
        <input 
          type="text" 
          placeholder="Buscar productos por nombre..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        
        {/* Selector de categorías dinámico */}
        <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categoriasUnicas.map(cat => (
            <option key={cat as string} value={cat as string}>{cat}</option>
          ))}
        </select>

        <select value={radioFiltro} onChange={(e) => setRadioFiltro(e.target.value)}>
          <option value="">Todos (Sin límite)</option>
          <option value="1">A menos de 1 km</option>
          <option value="3">A menos de 3 km</option>
          <option value="5">A menos de 5 km</option>
        </select>
      </div>

      {/* Manejo de estados (Error, Loading, Empty, Grid) */}
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
      ) : productosFiltrados.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#a0a0a0' }}>
          No se encontraron productos en tu zona.
        </div>
      ) : (
        <div className="productos-grid">
          {productosFiltrados.map(producto => (
            <ProductoCard key={producto.id} product={producto} />
          ))}
        </div>
      )}
    </div>
  );
}