import { useState } from 'react';
import { useCarrito } from '../hooks/useCarrito';
import type { PedidoRequest, PedidoResponse } from '../types/pedido';
import TicketSuccess from './TicketSuccess'; // Importamos el componente del ticket
import './CheckoutForm.css';

interface CheckoutFormProps {
  onSuccess: (res: PedidoResponse) => void;
  onCancel: () => void;
}

export default function CheckoutForm({ onSuccess, onCancel }: CheckoutFormProps) {
  const { items, total, vaciar } = useCarrito();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // NUEVO ESTADO: Guarda los datos devueltos por el backend
  const [pedidoConfirmado, setPedidoConfirmado] = useState<PedidoResponse | undefined>(undefined);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [franjaHoraria, setFranjaHoraria] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    const pedidoData: PedidoRequest = {
      comercioId: items[0].comercioId,
      compradorNombre: nombre,
      compradorTelefono: telefono,
      franjaHoraria,
      items: items.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad,
        precio: item.precio,
        nombre: item.nombre
      })),
      total,
    };

    try {
      const response = await fetch('http://localhost:8080/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al procesar el pedido. Verifica el cupo.');
      }

      const resData: PedidoResponse = await response.json();
      vaciar();
      
      // En lugar de cerrar el modal de inmediato, guardamos los datos para mostrar el ticket
      setPedidoConfirmado(resData); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // INTERCEPTOR DE VISTA: Si ya hay un pedido confirmado, mostramos el TicketSuccess
  if (pedidoConfirmado) {
    return (
      <TicketSuccess 
        pedido={pedidoConfirmado} 
        onCerrar={() => onSuccess(pedidoConfirmado)} // Cierra el cajón lateral/modal al darle a "Volver"
      />
    );
  }

  // Si no hay pedido confirmado, mostramos el formulario normal
  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <h3>Datos de Retiro</h3>
      <p className="checkout-subtitle">Completá tus datos para asegurar tu reserva.</p>

      {error && <div className="form-error">⚠️ {error}</div>}

      <div className="form-group">
        <label>Nombre y Apellido</label>
        <input 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          required 
          placeholder="Ej: Juan Pérez"
        />
      </div>

      <div className="form-group">
        <label>Teléfono (WhatsApp)</label>
        <input 
          type="tel" 
          value={telefono} 
          onChange={(e) => setTelefono(e.target.value)} 
          required 
          placeholder="Ej: 1122334455"
        />
      </div>

      <div className="form-group">
        <label>Franja Horaria de Retiro</label>
        <select value={franjaHoraria} onChange={(e) => setFranjaHoraria(e.target.value)} required>
          <option value="" disabled>Seleccioná un horario disponible</option>
          <option value="10:00 - 11:00">Mañana (10:00 - 11:00)</option>
          <option value="11:00 - 12:00">Mediodía (11:00 - 12:00)</option>
          <option value="17:00 - 18:00">Tarde (17:00 - 18:00)</option>
          <option value="18:00 - 19:00">Noche (18:00 - 19:00)</option>
        </select>
      </div>

      <div className="checkout-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
          Volver al carrito
        </button>
        <button type="submit" className="btn-confirm" disabled={loading}>
          {loading ? 'Procesando...' : 'Confirmar Reserva'}
        </button>
      </div>
    </form>
  );
}