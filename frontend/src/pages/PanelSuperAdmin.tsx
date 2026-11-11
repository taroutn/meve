import { useState, useEffect } from 'react';
import type { Comercio as ComercioBase } from '../types/comercio';
import './PanelSuperAdmin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface Comercio extends ComercioBase {
  estado?: string;
}

export default function PanelSuperAdmin() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarComerciosAdmin();
  }, []);

  const cargarComerciosAdmin = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Obtenemos el token JWT guardado en el login
      const res = await fetch(`${API_URL}/api/admin/comercios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al obtener la lista de comercios para moderación.');
      const data = await res.json();
      setComercios(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // RF-07: Aprobar (ACTIVO) o Suspender locales
  const cambiarEstadoComercio = async (comercioId: string, nuevoEstado: 'ACTIVO' | 'SUSPENDIDO') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/comercios/${comercioId}/estado`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar el estado del comercio.');

      setComercios(prev => prev.map(c => c.id === comercioId ? { ...c, estado: nuevoEstado } : c));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="home-container panel-superadmin">
      <header className="home-header">
        <h2>Panel de Moderación SuperAdmin</h2>
        <p>Aprobación y control de comercios pendientes o activos en la plataforma.</p>
      </header>

      {error && <div className="status-message error">⚠️ {error}</div>}

      {loading ? (
        <p>Cargando comercios...</p>
      ) : (
        <div className="tabla-comercios-container">
          <table className="tabla-comercios">
            <thead>
              <tr>
                <th>Comercio</th>
                <th>Descripción</th>
                <th>Estado Actual</th>
                <th>Acciones de Moderación</th>
              </tr>
            </thead>
            <tbody>
              {comercios.map(comercio => (
                <tr key={comercio.id}>
                  <td><strong>{comercio.nombre}</strong></td>
                  <td>{comercio.descripcion}</td>
                  <td>
                    <span className={`badge-comercio ${(comercio.estado || 'PENDIENTE').toLowerCase()}`}>
                      {comercio.estado || 'PENDIENTE'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      {comercio.estado !== 'ACTIVO' && (
                        <button 
                          className="btn-aprobar"
                          onClick={() => cambiarEstadoComercio(comercio.id, 'ACTIVO')}
                        >
                          Aprobar / Activar
                        </button>
                      )}
                      {comercio.estado !== 'SUSPENDIDO' && (
                        <button 
                          className="btn-suspender"
                          onClick={() => cambiarEstadoComercio(comercio.id, 'SUSPENDIDO')}
                        >
                          Suspender
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}