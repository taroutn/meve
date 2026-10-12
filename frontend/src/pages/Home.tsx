import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';
import './Home.css';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Llamada HTTP al endpoint del backend
    fetch('http://localhost:8080/api/productos')
      .then((response) => {
        if (!response.ok) {
          throw new Error('No se pudo obtener el catálogo de productos del servidor.');
        }
        return response.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error de conexión con la API.');
        setLoading(false);
      });
  }, []);

  // Lógica de filtrado en el cliente (case-insensitive evaluando el nombre del producto)
  const filteredProducts = products.filter((product) =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Exploración Hiperlocal</h1>
        <p>Descubrí los mejores productos de los comercios cercanos en un solo lugar.</p>

        {/* Input de texto (barra de búsqueda) */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar productos por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Estado de Carga */}
      {loading && (
        <div className="status-message">
          <p>Cargando productos del catálogo...</p>
        </div>
      )}

      {/* Estado de Error */}
      {error && (
        <div className="status-message error">
          <p>{error}</p>
        </div>
      )}

      {/* Estado de Búsqueda sin Resultados */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="status-message">
          <p>No se encontraron productos que coincidan con "{searchTerm}".</p>
        </div>
      )}

      {/* Grilla de Resultados Dinámica */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}