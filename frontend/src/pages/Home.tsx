import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';
import './Home.css';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Llamada HTTP al endpoint que retorna List<ProductoCatalogoDTO>
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

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Exploración Hiperlocal</h1>
        <p>Descubrí los mejores productos de los comercios cercanos en un solo lugar.</p>
      </div>

      {/* Estado 1: Cargando */}
      {loading && (
        <div className="status-message">
          <p>Cargando productos del catálogo...</p>
        </div>
      )}

      {/* Estado 2: Error */}
      {error && (
        <div className="status-message error">
          <p>{error}</p>
          <small>Asegurate de tener corriendo el servidor backend Spring Boot en localhost:8080.</small>
        </div>
      )}

      {/* Estado 3: Sin Productos */}
      {!loading && !error && products.length === 0 && (
        <div className="status-message">
          <p>No hay productos activos en el catálogo actualmente.</p>
        </div>
      )}

      {/* Estado 4: Éxito con datos de la API */}
      {!loading && !error && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}