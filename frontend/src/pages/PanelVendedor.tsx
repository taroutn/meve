import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import type { PedidoResponse as PedidoBase } from '../types/pedido';
import type { Product as ProductBase } from '../types/product';
import ConfiguracionComercio from '../components/ConfiguracionComercio';
import { subirImagenCloudinary } from '../utils/cloudinary';
import { obtenerFallbackProducto } from '../utils/fallbackImages';
import './PanelVendedor.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface PedidoResponse extends PedidoBase {
  compradorNombre?: string;
  franjaHoraria?: string;
  total?: number;
}

interface Product extends ProductBase {
  stock?: number;
  activo?: boolean;
  categoria?: string;
  descripcion?: string;
}

export default function PanelVendedor() {
  const [tabActiva, setTabActiva] = useState<'pedidos' | 'stock' | 'configuracion'>('pedidos');
  const [pedidos, setPedidos] = useState<PedidoResponse[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [busquedaTicket, setBusquedaTicket] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para alta de nuevo producto (RF + Cloudinary #45)
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('General');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoStock, setNuevoStock] = useState('10');
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState('');
  const [subiendoNuevaImg, setSubiendoNuevaImg] = useState(false);
  const [creandoProducto, setCreandoProducto] = useState(false);
  const [subiendoIdProducto, setSubiendoIdProducto] = useState<string | null>(null);

  const comercioIdActual = localStorage.getItem('comercioId') || 'comercio-1'; 

  useEffect(() => {
    setError(null);
    if (tabActiva === 'pedidos' || tabActiva === 'stock') {
      cargarDatosVendedor();
    }
  }, [tabActiva]);

  const cargarDatosVendedor = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      if (tabActiva === 'pedidos') {
        const res = await fetch(`${API_URL}/api/comercios/${comercioIdActual}/pedidos`, { headers });
        if (!res.ok) throw new Error('Error al cargar los pedidos de la jornada.');
        const data = await res.json();
        setPedidos(data);
      } else if (tabActiva === 'stock') {
        const res = await fetch(`${API_URL}/api/comercios/${comercioIdActual}/productos`, { headers });
        if (!res.ok) throw new Error('Error al cargar el catálogo de productos.');
        const data = await res.json();
        setProductos(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubirImagenNuevoProducto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoNuevaImg(true);
    setError(null);
    try {
      const url = await subirImagenCloudinary(file);
      setNuevaImagenUrl(url);
    } catch (err: any) {
      setError(err.message || 'No se pudo subir la imagen del producto.');
    } finally {
      setSubiendoNuevaImg(false);
      e.target.value = '';
    }
  };

  const handleCrearProducto = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nuevoNombre.trim() || !nuevoPrecio || Number(nuevoPrecio) <= 0) {
      setError('Completá el nombre y un precio mayor a 0 para el producto.');
      return;
    }

    setCreandoProducto(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        nombre: nuevoNombre.trim(),
        precio: Number(nuevoPrecio),
        categoria: nuevaCategoria.trim() || 'General',
        descripcion: nuevaDescripcion.trim(),
        stock: Number(nuevoStock) || 0,
        imagenUrl: nuevaImagenUrl.trim() || undefined,
      };

      const res = await fetch(`${API_URL}/api/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'No se pudo crear el producto.');
      }

      const creado: Product = await res.json();
      setProductos((prev) => [creado, ...prev]);

      // Reset del formulario
      setNuevoNombre('');
      setNuevoPrecio('');
      setNuevaCategoria('General');
      setNuevaDescripcion('');
      setNuevoStock('10');
      setNuevaImagenUrl('');
    } catch (err: any) {
      setError(err.message || 'Error al crear el producto.');
    } finally {
      setCreandoProducto(false);
    }
  };

  const marcarComoRetirado = async (pedidoId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const pedidoActual = pedidos.find(p => p.id === pedidoId);
      if (!pedidoActual || !pedidoActual.codigoTicket) {
        throw new Error('No se pudo encontrar el código de ticket para este pedido.');
      }

      const res = await fetch(`${API_URL}/api/pedidos/${pedidoId}/retirar`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codigoTicket: pedidoActual.codigoTicket }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        let errData;
        try {
          errData = JSON.parse(errorText);
        } catch {
          errData = { message: errorText };
        }
        throw new Error(errData.message || 'No se pudo actualizar el estado del pedido.');
      }
      
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: 'RETIRADO' } : p));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const actualizarProducto = async (
    productoId: string,
    nuevoStock: number,
    activo: boolean,
    imagenUrlActualizada?: string
  ) => {
    try {
      const token = localStorage.getItem('token');
      const productoActual = productos.find(p => p.id === productoId);
      if (!productoActual) return;

      const imagenFinal =
        imagenUrlActualizada !== undefined
          ? imagenUrlActualizada
          : (productoActual.imagenUrl ?? null);

      const payload = {
        nombre: productoActual.nombre || 'Producto MeVe',
        precio: productoActual.precio ?? 0,
        categoria: productoActual.categoria || 'General',
        descripcion: productoActual.descripcion || '',
        stock: nuevoStock,
        activo: activo,
        comercioId: comercioIdActual,
        imagenUrl: imagenFinal,
      };

      const res = await fetch(`${API_URL}/api/productos/${productoId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al actualizar el producto.');
      }
      
      setProductos(prev =>
        prev.map(p =>
          p.id === productoId
            ? { ...p, stock: nuevoStock, activo, imagenUrl: imagenFinal || undefined }
            : p
        )
      );
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCambiarFotoProductoExistente = async (
    producto: Product,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoIdProducto(producto.id);
    try {
      const urlSubida = await subirImagenCloudinary(file);
      await actualizarProducto(producto.id, producto.stock ?? 0, producto.activo ?? true, urlSubida);
    } catch (err: any) {
      alert(`Error al subir imagen: ${err.message}`);
    } finally {
      setSubiendoIdProducto(null);
      e.target.value = '';
    }
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (!busquedaTicket.trim()) return true;
    return p.codigoTicket?.toLowerCase().includes(busquedaTicket.toLowerCase());
  });

  return (
    <div className="home-container panel-vendedor">
      <header className="home-header">
        <h2>Panel Operativo del Vendedor</h2>
        <p>Gestioná la jornada de pedidos y el catálogo de tu comercio de forma ágil.</p>
      </header>

      <div className="panel-tabs">
        <button 
          className={`tab-btn ${tabActiva === 'pedidos' ? 'active' : ''}`}
          onClick={() => setTabActiva('pedidos')}
        >
          Panel de la Jornada (Pedidos)
        </button>
        <button 
          className={`tab-btn ${tabActiva === 'stock' ? 'active' : ''}`}
          onClick={() => setTabActiva('stock')}
        >
          Gestión de Stock y Catálogo
        </button>
        <button 
          className={`tab-btn ${tabActiva === 'configuracion' ? 'active' : ''}`}
          onClick={() => setTabActiva('configuracion')}
        >
          Configurar mi Comercio y Franjas
        </button>
      </div>

      {error && <div className="status-message error">⚠️ {error}</div>}

      {tabActiva === 'pedidos' && (
        <div className="seccion-pedidos">
          <div className="acciones-rapidas">
            <input 
              type="text" 
              placeholder="Filtrar o verificar por Código de Ticket (Ej: MEVE-...)" 
              value={busquedaTicket}
              onChange={(e) => setBusquedaTicket(e.target.value)}
              className="input-busqueda-ticket"
            />
          </div>

          {loading ? (
            <p>Cargando pedidos de la jornada...</p>
          ) : pedidos.length === 0 ? (
            <p className="empty-state">No hay pedidos registrados para la jornada de hoy en este comercio.</p>
          ) : pedidosFiltrados.length === 0 ? (
            <p className="empty-state">No se encontró ningún pedido con el código "{busquedaTicket}".</p>
          ) : (
            <div className="tabla-pedidos-container">
              <table className="tabla-pedidos">
                <thead>
                  <tr>
                    <th>Código Ticket</th>
                    <th>Cliente</th>
                    <th>Franja Horaria</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acción Rápida</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.map(pedido => (
                    <tr key={pedido.id}>
                      <td><strong>{pedido.codigoTicket}</strong></td>
                      <td>{pedido.compradorNombre || 'Cliente MeVe'}</td>
                      <td>🕒 {pedido.franjaHoraria || 'Sin franja horaria'}</td>
                      <td>${pedido.total ?? 0}</td>
                      <td>
                        <span className={`badge-estado ${(pedido.estado || '').toLowerCase()}`}>
                          {pedido.estado?.replace('_', ' ') || 'PENDIENTE'}
                        </span>
                      </td>
                      <td>
                        {pedido.estado !== 'RETIRADO' && (
                          <button 
                            className="btn-confirmar-retiro"
                            onClick={() => marcarComoRetirado(pedido.id)}
                          >
                            Marcar Retirado
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tabActiva === 'stock' && (
        <div className="seccion-stock">
          {/* Formulario de creación de producto con imagen */}
          <form onSubmit={handleCrearProducto} className="nuevo-producto-form">
            <h3>+ Agregar Producto al Catálogo</h3>
            <div className="nuevo-producto-grid">
              <input
                type="text"
                placeholder="Nombre del producto *"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Precio ($) *"
                min="1"
                step="any"
                value={nuevoPrecio}
                onChange={(e) => setNuevoPrecio(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Categoría (Ej: Panadería, Bebidas)"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
              />
              <input
                type="number"
                placeholder="Stock inicial"
                min="0"
                value={nuevoStock}
                onChange={(e) => setNuevoStock(e.target.value)}
              />
            </div>

            <div className="nuevo-producto-imagen-row">
              <label className="label-file-producto">
                Foto del producto:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSubirImagenNuevoProducto}
                  disabled={subiendoNuevaImg}
                />
              </label>

              {subiendoNuevaImg && <span>⏳ Subiendo a Cloudinary...</span>}

              {nuevaImagenUrl && (
                <div className="preview-mini-box">
                  <img src={nuevaImagenUrl} alt="Vista previa" className="preview-mini-img" />
                  <button
                    type="button"
                    className="btn-quitar-mini"
                    onClick={() => setNuevaImagenUrl('')}
                  >
                    ✕
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="btn-crear-producto"
                disabled={creandoProducto || subiendoNuevaImg}
              >
                {creandoProducto ? 'Guardando...' : 'Agregar Producto'}
              </button>
            </div>
          </form>

          {loading ? (
            <p>Cargando catálogo...</p>
          ) : productos.length === 0 ? (
            <p className="empty-state">No hay productos cargados en el catálogo de este comercio.</p>
          ) : (
            <div className="productos-stock-grid">
              {productos.map(prod => (
                <div key={prod.id} className="product-stock-card">
                  <img
                    src={prod.imagenUrl || obtenerFallbackProducto(prod.categoria)}
                    alt={prod.nombre}
                    className="stock-card-thumb"
                    onError={(e) => {
                      e.currentTarget.src = obtenerFallbackProducto(prod.categoria);
                    }}
                  />
                  <h4>{prod.nombre}</h4>
                  <p className="precio-prod">Precio: ${prod.precio}</p>

                  <div className="stock-foto-edit">
                    <label className="btn-cambiar-foto">
                      {subiendoIdProducto === prod.id ? '⏳ Subiendo...' : 'Cambiar foto'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={subiendoIdProducto === prod.id}
                        onChange={(e) => handleCambiarFotoProductoExistente(prod, e)}
                      />
                    </label>
                  </div>

                  <div className="stock-controls">
                    <label>
                      Stock: 
                      <input 
                        type="number" 
                        value={prod.stock ?? 0} 
                        onChange={(e) => actualizarProducto(prod.id, Number(e.target.value), prod.activo ?? true)}
                        min="0"
                      />
                    </label>
                    <button 
                      className={`btn-toggle-activo ${prod.activo !== false ? 'activo' : 'pausado'}`}
                      onClick={() => actualizarProducto(prod.id, prod.stock ?? 0, !(prod.activo !== false))}
                    >
                      {prod.activo !== false ? ' Activo' : ' Pausado'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tabActiva === 'configuracion' && (
        <ConfiguracionComercio comercioId={comercioIdActual} />
      )}
    </div>
  );
}