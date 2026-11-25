import { useState, useEffect } from 'react';
import { useCarrito } from '../hooks/useCarrito';
import type { PedidoRequest, PedidoResponse } from '../types/pedido';
import type { Comercio, FranjaHoraria } from '../types/comercio';
import TicketSuccess from './TicketSuccess';
import './CheckoutForm.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface CheckoutFormProps {
  onSuccess: (res: PedidoResponse) => void;
  onCancel: () => void;
}

export default function CheckoutForm({ onSuccess, onCancel }: CheckoutFormProps) {
  const { items, total, vaciar } = useCarrito();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pedidoConfirmado, setPedidoConfirmado] = useState<PedidoResponse | undefined>(undefined);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [franjaHoraria, setFranjaHoraria] = useState('');

  // Estados para las franjas dinámicas del comercio (RF-19, RF-20)
  const [franjas, setFranjas] = useState<FranjaHoraria[]>([]);
  const [loadingFranjas, setLoadingFranjas] = useState<boolean>(true);
  const [errorFranjas, setErrorFranjas] = useState<string | null>(null);

  const comercioId = items[0]?.comercioId;

  useEffect(() => {
    if (!comercioId) {
      setLoadingFranjas(false);
      return;
    }

    const controller = new AbortController();

    const cargarFranjasComercio = async () => {
      setLoadingFranjas(true);
      setErrorFranjas(null);

      try {
        const response = await fetch(`${API_URL}/api/comercios/${comercioId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('No se pudieron obtener las franjas horarias del comercio.');
        }

        const data: Comercio = await response.json();
        const listaFranjas: FranjaHoraria[] = Array.isArray(data.franjas)
          ? data.franjas.map((f: any) => ({
              rango: f.rango,
              capacidadMaxima: Number(f.capacidadMaxima ?? 0),
              cuposDisponibles:
                typeof f.cuposDisponibles === 'number'
                  ? f.cuposDisponibles
                  : Number(f.disponibles ?? 0),
            }))
          : [];

        setFranjas(listaFranjas);

        // Preseleccionar la primera franja que tenga cupos disponibles
        const primeraDisponible = listaFranjas.find((f) => f.cuposDisponibles > 0);
        setFranjaHoraria(primeraDisponible ? primeraDisponible.rango : '');
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setErrorFranjas(err.message || 'Error al cargar los turnos de retiro.');
        setFranjas([]);
        setFranjaHoraria('');
      } finally {
        if (!controller.signal.aborted) {
          setLoadingFranjas(false);
        }
      }
    };

    cargarFranjasComercio();
    return () => controller.abort();
  }, [comercioId]);

  const hayCuposDisponibles = franjas.some((f) => f.cuposDisponibles > 0);
  const puedeConfirmar =
    !loading && !loadingFranjas && hayCuposDisponibles && Boolean(franjaHoraria);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !puedeConfirmar) return;

    setLoading(true);
    setError(null);

    const pedidoData: PedidoRequest = {
      comercioId: items[0].comercioId,
      compradorNombre: nombre,
      compradorTelefono: telefono,
      franjaHoraria,
      items: items.map((item) => ({
        productoId: item.id,
        cantidad: item.cantidad,
        precio: item.precio,
        nombre: item.nombre,
      })),
      total,
    };

    try {
      const response = await fetch(`${API_URL}/api/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al procesar el pedido. Verificá el cupo.');
      }

      const resData: PedidoResponse = await response.json();
      vaciar();
      setPedidoConfirmado(resData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (pedidoConfirmado) {
    return (
      <TicketSuccess
        pedido={pedidoConfirmado}
        onCerrar={() => onSuccess(pedidoConfirmado)}
      />
    );
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <h3>Datos de Retiro</h3>
      <p className="checkout-subtitle">Completá tus datos para asegurar tu reserva.</p>

      {error && <div className="form-error">⚠️ {error}</div>}

      <div className="form-group">
        <label htmlFor="checkout-nombre">Nombre y Apellido</label>
        <input
          id="checkout-nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          placeholder="Ej: Juan Pérez"
        />
      </div>

      <div className="form-group">
        <label htmlFor="checkout-telefono">Teléfono (WhatsApp)</label>
        <input
          id="checkout-telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
          placeholder="Ej: 1122334455"
        />
      </div>

      <div className="form-group">
        <label htmlFor="checkout-franja">Franja Horaria de Retiro</label>

        {loadingFranjas ? (
          <div className="franjas-loading" role="status">
            ⏳ Consultando turnos y cupos disponibles...
          </div>
        ) : errorFranjas ? (
          <div className="form-error">⚠️ {errorFranjas}</div>
        ) : franjas.length === 0 ? (
          <div className="franjas-warning">
            Este comercio todavía no tiene franjas horarias configuradas para retiro.
          </div>
        ) : (
          <>
            <select
              id="checkout-franja"
              value={franjaHoraria}
              onChange={(e) => setFranjaHoraria(e.target.value)}
              disabled={!hayCuposDisponibles}
              required
            >
              <option value="" disabled>
                {hayCuposDisponibles
                  ? 'Seleccioná un horario disponible'
                  : 'Sin turnos disponibles'}
              </option>
              {franjas.map((f) => {
                const sinCupo = f.cuposDisponibles === 0;
                return (
                  <option key={f.rango} value={f.rango} disabled={sinCupo}>
                    {sinCupo
                      ? `${f.rango} (Sin cupo)`
                      : `${f.rango} (${f.cuposDisponibles} cupos disp.)`}
                  </option>
                );
              })}
            </select>

            {!hayCuposDisponibles && (
              <div className="franjas-warning">
                Todos los turnos de retiro de este comercio están completos por el momento.
              </div>
            )}
          </>
        )}
      </div>

      <div className="checkout-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
          Volver al carrito
        </button>
        <button type="submit" className="btn-confirm" disabled={!puedeConfirmar}>
          {loading
            ? 'Procesando...'
            : loadingFranjas
              ? 'Cargando turnos...'
              : 'Confirmar Reserva'}
        </button>
      </div>
    </form>
  );
}