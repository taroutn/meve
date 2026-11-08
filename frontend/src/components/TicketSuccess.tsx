import type { PedidoResponse } from '../types/pedido';
import './CheckoutForm.css';

interface TicketSuccessProps {
  pedido?: PedidoResponse; // Make the prop optional
  onCerrar: () => void;
}

export default function TicketSuccess({ pedido, onCerrar }: TicketSuccessProps) {
  // Add a check to return a loading or fallback state if 'pedido' is undefined
  if (!pedido) {
    return (
      <div className="ticket-success-container loading-state">
        <div className="spinner"></div>
        <p>Generando tu ticket de retiro y link de pago...</p>
        <button onClick={onCerrar} className="btn-cerrar">Volver</button>
      </div>
    );
  }

  return (
    <div className="ticket-success-container">
      <h2>¡Pedido Confirmado!</h2>
      
      <div className="ticket-card">
        <p>Tu código de retiro es:</p>
        <h3 className="ticket-codigo">{pedido.codigoTicket}</h3>
        <p className="ticket-estado">Estado: <strong>{pedido.estado?.replace('_', ' ')}</strong></p>
      </div>

      <p className="ticket-instrucciones">
        Presentá este código en el mostrador del comercio en la franja horaria seleccionada.
      </p>

      <div className="ticket-actions">
        {/* RF-24: Botón de Pago Sandbox */}
        {pedido.sandboxInitPoint && (
          <a 
            href={pedido.sandboxInitPoint} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-mercadopago"
          >
            Pagar con MercadoPago (Sandbox)
          </a>
        )}

        {pedido.whatsappUrl && (
          <a 
            href={pedido.whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-whatsapp"
          >
            Avisar por WhatsApp
          </a>
        )}

        <button onClick={onCerrar} className="btn-cerrar">
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}