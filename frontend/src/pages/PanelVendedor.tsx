import { useState, useEffect } from 'react';
import type { PedidoResponse as PedidoBase } from '../types/pedido';
import type { Product as ProductBase } from '../types/product';
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
  const [tabActiva, setTabActiva] = useState<'pedidos' | 'stock'>('pedidos');
  const [pedidos, setPedidos] = useState<PedidoResponse[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [busquedaTicket, setBusquedaTicket] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const comercioIdActual = localStorage.getItem('comercioId') || 'comercio-1'; 

  useEffect(() => {
    cargarDatosVendedor();
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
      } else {
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
        } catch (e) {
          errData = { message: errorText };
        }
        throw new Error(errData.message || 'No se pudo actualizar el estado del pedido.');
      }
      
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: 'RETIRADO' } : p));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const actualizarStockYEstado = async (productoId: string, nuevoStock: number, activo: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const productoActual = productos.find(p => p.id === productoId);
      if (!productoActual) return;

      const payload = {
        nombre: productoActual.nombre || 'Producto MeVe',
        precio: productoActual.precio ?? 0,
        categoria: productoActual.categoria || 'General',
        descripcion: productoActual.descripcion || '',
        stock: nuevoStock,
        activo: activo,
        comercioId: comercioIdActual
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
      
      setProductos(prev => prev.map(p => p.id === productoId ? { ...p, stock: nuevoStock, activo } : p));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
          {loading ? (
            <p>Cargando catálogo...</p>
          ) : productos.length === 0 ? (
            <p className="empty-state">No hay productos cargados en el catálogo de este comercio.</p>
          ) : (
            <div className="productos-stock-grid">
              {productos.map(prod => (
                <div key={prod.id} className="product-stock-card">
                  <h4>{prod.nombre}</h4>
                  <p className="precio-prod">Precio: ${prod.precio}</p>
                  <div className="stock-controls">
                    <label>
                      Stock: 
                      <input 
                        type="number" 
                        value={prod.stock ?? 0} 
                        onChange={(e) => actualizarStockYEstado(prod.id, Number(e.target.value), prod.activo ?? true)}
                        min="0"
                      />
                    </label>
                    <button 
                      className={`btn-toggle-activo ${prod.activo !== false ? 'activo' : 'pausado'}`}
                      onClick={() => actualizarStockYEstado(prod.id, prod.stock ?? 0, !(prod.activo !== false))}
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
    </div>
  );
}