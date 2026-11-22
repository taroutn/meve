import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import type { Comercio } from '../types/comercio';
import type { Product } from '../types/product';
import './ComercioDetail.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

type ProductConStock = Product & {
  stock?: number;
  activo?: boolean;
};

export default function ComercioDetail() {
  const { id } = useParams<{ id: string }>();
  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [products, setProducts] = useState<ProductConStock[]>([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>([]);
  const [loadingComercio, setLoadingComercio] = useState<boolean>(true);
  const [loadingProductos, setLoadingProductos] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros del catálogo del comercio
  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounced(busqueda.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // 1. Cargar información del comercio
  useEffect(() => {
    if (!id) return;

    setLoadingComercio(true);
    setError(null);

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
      })
      .then((comercioData: Comercio) => {
        setComercio(comercioData);
        setLoadingComercio(false);
      })
      .catch((err) => {
        setError(err.message || 'Error al cargar los datos del comercio.');
        setLoadingComercio(false);
      });
  }, [id]);

  // 2. Cargar y filtrar productos del comercio
  useEffect(() => {
    if (!id) return;

    let cancelado = false;
    setLoadingProductos(true);

    const params = new URLSearchParams();
    if (busquedaDebounced) params.set('q', busquedaDebounced);
    if (categoriaFiltro) params.set('categoria', categoriaFiltro);
    if (soloDisponibles) params.set('disponible', 'true');
    const queryString = params.toString();

    const cargarProductos = async () => {
      try {
        let lista: ProductConStock[] = [];

        const res = await fetch(
          `${API_URL}/api/comercios/${id}/productos${queryString ? `?${queryString}` : ''}`
        );

        if (res.ok) {
          lista = await res.json();
        } else {
          // Fallback multitenant si el endpoint específico no responde
          const resProd = await fetch(`${API_URL}/api/productos`, {
            headers: { 'X-Tenant-ID': id },
          });
          if (resProd.ok) {
            lista = await resProd.json();
          } else {
            const resAllProd = await fetch(`${API_URL}/api/productos`);
            if (resAllProd.ok) {
              const todos: ProductConStock[] = await resAllProd.json();
              lista = todos.filter((p) => String(p.comercioId) === String(id));
            }
          }
        }

        if (cancelado) return;

        // Guardamos las categorías únicas descubiertas en el comercio
        const cats = lista
          .map((p) => p.categoria)
          .filter((cat): cat is string => Boolean(cat));
        if (cats.length > 0) {
          setCategoriasDisponibles((prev) => Array.from(new Set([...prev, ...cats])));
        }

        // Refinamiento consistente en cliente por si el endpoint /comercios/{id}/productos ignora query params
        const filtrados = lista.filter((p) => {
          const matchTexto = busquedaDebounced
            ? p.nombre.toLowerCase().includes(busquedaDebounced.toLowerCase())
            : true;
          const matchCategoria = categoriaFiltro ? p.categoria === categoriaFiltro : true;
          const matchDisponible = soloDisponibles
            ? p.activo !== false && (p.stock === undefined || p.stock > 0)
            : true;
          return matchTexto && matchCategoria && matchDisponible;
        });

        setProducts(filtrados);
      } catch {
        if (!cancelado) setProducts([]);
      } finally {
        if (!cancelado) setLoadingProductos(false);
      }
    };

    cargarProductos();
    return () => {
      cancelado = true;
    };
  }, [id, busquedaDebounced, categoriaFiltro, soloDisponibles]);

  if (loadingComercio) return <Spinner />;

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

  // Agrupamiento visual utilizando el campo 'categoria'
  const groupedProducts = products.reduce<Record<string, ProductConStock[]>>((acc, product) => {
    const category = product.categoria || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  const categories = Object.keys(groupedProducts);
  const hayFiltrosActivos = Boolean(busqueda.trim() || categoriaFiltro || soloDisponibles);

  const limpiarFiltros = () => {
    setBusqueda('');
    setBusquedaDebounced('');
    setCategoriaFiltro('');
    setSoloDisponibles(false);
  };

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

      {/* Barra de búsqueda y filtros del catálogo del comercio */}
      <div className="filtros-container comercio-filtros">
        <input
          type="text"
          placeholder={`Buscar en ${comercio.nombre}...`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar productos del comercio"
        />

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {categoriasDisponibles.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
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

      {loadingProductos ? (
        <Spinner />
      ) : products.length === 0 ? (
        <div className="no-products-fallback">
          <p>
            {hayFiltrosActivos
              ? 'No se encontraron productos que coincidan con los filtros aplicados.'
              : 'Este comercio aún no tiene productos.'}
          </p>
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