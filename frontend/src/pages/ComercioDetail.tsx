import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import type { Comercio } from '../types/comercio';
import type { Product } from '../types/product';
import './ComercioDetail.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ComercioDetail() {
  const { id } = useParams<{ id: string }>();
  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      // Intento 1: GET /api/comercios/{id}
      fetch(`${API_URL}/api/comercios/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('fallback-comercio');
          return res.json();
        })
        .catch(async () => {
          const resAll = await fetch(`${API_URL}/api/comercios`);
          if (!resAll.ok) throw new Error('No se pudo obtener la información del comercio.');
          const comercios: Comercio[] = await resAll.json();
          const encontrado = comercios.find((c) => c.id === id);
          if (!encontrado) throw new Error('Comercio no encontrado.');
          return encontrado;
        }),

      // Intento 2: GET /api/comercios/{id}/productos
      fetch(`${API_URL}/api/comercios/${id}/productos`)
        .then((res) => {
          if (!res.ok) throw new Error('fallback-productos');
          return res.json();
        })
        .catch(async () => {
          const resProd = await fetch(`${API_URL}/api/productos`, {
            headers: { 'X-Tenant-ID': id },
          });
          if (resProd.ok) return resProd.json();

          const resAllProd = await fetch(`${API_URL}/api/productos`);
          if (!resAllProd.ok) return [];
          const todos: Product[] = await resAllProd.json();
          return todos.filter((p) => String(p.comercioId) === String(id));
        }),
    ])
      .then(([comercioData, productosData]: [Comercio, Product[]]) => {
        setComercio(comercioData);
        setProducts(productosData || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error al cargar los datos del catálogo.');
        setLoading(false);
      });
  }, [id]);

  // Agrupamiento visual utilizando el campo 'categoria'
  const groupedProducts = products.reduce<Record<string, Product[]>>((acc, product) => {
    const category = product.categoria || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  if (loading) return <Spinner />;

  if (error || !comercio) {
    return (
      <div className="comercio-detail-container">
        <Link to="/comercios" className="back-link">← Volver a Comercios</Link>
        <div className="status-message error">
          <p>⚠️ {error || 'Comercio no encontrado'}</p>
        </div>
      </div>
    );
  }

  const categories = Object.keys(groupedProducts);

  return (
    <div className="comercio-detail-container">
      <Link to="/comercios" className="back-link">← Volver a Comercios</Link>

      <header className="comercio-header">
        <div className="comercio-header-info">
          <h1>{comercio.nombre}</h1>
          <p className="descripcion">{comercio.descripcion}</p>
          <div className="horario-badge">
            <span>🕒 {comercio.horarios || 'Horarios no informados'}</span>
          </div>
        </div>
      </header>

      {products.length === 0 ? (
        <div className="no-products-fallback">
          <p>Este comercio aún no tiene productos.</p>
        </div>
      ) : (
        <div className="categories-list">
          {categories.map((category) => (
            <section key={category} className="category-section">
              <h2 className="category-title">{category}</h2>
              <div className="product-grid">
                {groupedProducts[category].map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}