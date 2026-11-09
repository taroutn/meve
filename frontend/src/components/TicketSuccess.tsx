import type { PedidoResponse } from '../types/pedido';
import './CheckoutForm.css';

interface TicketSuccessProps {
  pedido?: PedidoResponse;
  onCerrar: () => void;
}

export default function TicketSuccess({ pedido, onCerrar }: TicketSuccessProps) {
  if (!pedido) {
    return (
      <div className="ticket-success-container loading-state">
        <div className="spinner"></div>
        <p>Generando tu ticket de retiro y link de pago...</p>
        {/* Cambiamos btn-cerrar por btn-cancel para usar el estilo adaptativo */}
        <button onClick={onCerrar} className="btn-cancel">Volver</button>
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

      {/* Agregamos flexbox en columna para apilar los botones perfectamente */}
      <div className="ticket-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
        
        {/* Cambiamos el fondo #2a2a2a por transparent para que se adapte al modo claro/oscuro */}
        <div 
          className="simulated-payment-badge" 
          style={{ 
            backgroundColor: 'transparent', 
            border: '1px dashed #009ee3', 
            color: '#009ee3', 
            padding: '0.85rem', 
            borderRadius: '8px', 
            textAlign: 'center', 
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}
        >
          Pago simulado: El comercio confirma el pago.
        </div>

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

        {/* Cambiamos btn-cerrar por btn-cancel para heredar el estilo y que se vea en todos los modos */}
        <button onClick={onCerrar} className="btn-cancel">
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}