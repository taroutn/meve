import type { PedidoResponse } from '../types/pedido';
import './CheckoutForm.css';

interface TicketSuccessProps {
  pedidoInfo: PedidoResponse;
  onClose: () => void;
}

export default function TicketSuccess({ pedidoInfo, onClose }: TicketSuccessProps) {
  return (
    <div className="ticket-container">
      <div className="ticket-icon">✅</div>
      <h2>¡Pedido Confirmado!</h2>
      <p>Tu reserva quedó asegurada con éxito.</p>

      <div className="ticket-box">
        <span className="ticket-label">Código de Retiro</span>
        <strong className="ticket-code">{pedidoInfo.codigoTicket}</strong>
      </div>

      <a 
        href={pedidoInfo.whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="btn-whatsapp"
      >
        📱 Enviar ticket al comercio por WhatsApp
      </a>

      <button className="btn-close-ticket" onClick={onClose}>
        Cerrar y seguir comprando
      </button>
    </div>
  );
}