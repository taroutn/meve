import { useState } from 'react';
import type { PedidoResponse } from '../types/pedido';
import './CheckoutForm.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface TicketSuccessProps {
  pedido?: PedidoResponse;
  onCerrar: () => void;
}

export default function TicketSuccess({ pedido, onCerrar }: TicketSuccessProps) {
  // Copia local del pedido: cambia cuando se simula el pago o se cancela
  const [pedidoActual, setPedidoActual] = useState<PedidoResponse | undefined>(pedido);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pedidoActual) {
    return (
      <div className="ticket-success-container loading-state">
        <div className="spinner"></div>
        <p>Generando tu ticket de retiro y link de pago...</p>
        <button onClick={onCerrar} className="btn-cancel">Volver</button>
      </div>
    );
  }

  // POST al backend; si responde bien, el pedido actualizado reemplaza al que se muestra
  const actualizarPedido = async (ruta: string, body?: object) => {
    setProcesando(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${ruta}`, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || 'No se pudo actualizar el pedido.');
      }
      setPedidoActual(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setProcesando(false);
    }
  };

  // Simula la notificación de MercadoPago (webhook): el pedido pasa a PAGADO_CONFIRMADO
  const simularPago = () => {
    const pagoId = `pago-simulado-${Date.now()}`;
    actualizarPedido(`/api/pedidos/webhook?pedidoId=${pedidoActual.id}&data.id=${pagoId}`);
  };

  // Cancela con el código del ticket: el backend devuelve el stock y el cupo de la franja
  const cancelarPedido = () => {
    if (!window.confirm('¿Cancelar el pedido? Se liberan los productos y el turno de retiro.')) return;
    actualizarPedido(`/api/pedidos/${pedidoActual.id}/cancelar`, { codigoTicket: pedidoActual.codigoTicket });
  };

  const estado = pedidoActual.estado;
  const pendiente = estado === 'PENDIENTE_PAGO';
  const pagado = estado === 'PAGADO_CONFIRMADO';
  const cancelado = estado === 'CANCELADO';

  return (
    <div className="ticket-success-container">
      <h2>{cancelado ? 'Pedido cancelado' : '¡Pedido Confirmado!'}</h2>

      <div className="ticket-card">
        <p>Tu código de retiro es:</p>
        <h3 className="ticket-codigo">{pedidoActual.codigoTicket}</h3>
        <p className="ticket-estado">Estado: <strong>{estado?.replace(/_/g, ' ')}</strong></p>
      </div>

      {!cancelado && (
        <p className="ticket-instrucciones">
          Presentá este código en el mostrador del comercio en la franja horaria seleccionada.
        </p>
      )}

      {error && <div className="form-error">⚠️ {error}</div>}

      <div className="ticket-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
        {pendiente && (
          <>
            <button
              onClick={simularPago}
              disabled={procesando}
              className="btn-confirm"
              style={{ backgroundColor: '#009ee3' }}
            >
              {procesando ? 'Procesando...' : 'Simular pago aprobado (MercadoPago Sandbox)'}
            </button>
            <button onClick={cancelarPedido} disabled={procesando} className="btn-cancel">
              Cancelar pedido
            </button>
          </>
        )}

        {pagado && pedidoActual.whatsappUrl && (
          <a
            href={pedidoActual.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            Enviar ticket por WhatsApp
          </a>
        )}

        {cancelado && (
          <p className="ticket-instrucciones">
            Se liberaron los productos y el turno de retiro.
          </p>
        )}

        <button onClick={onCerrar} className="btn-cancel">
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}