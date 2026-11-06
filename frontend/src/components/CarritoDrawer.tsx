import { useState } from 'react';
import { useCarrito } from '../hooks/useCarrito';
import type { ItemCarrito } from '../types/carrito';
import type { PedidoResponse } from '../types/pedido';
import CheckoutForm from './CheckoutForm';
import TicketSuccess from './TicketSuccess';
import './CarritoDrawer.css';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type DrawerStep = 'CART' | 'CHECKOUT' | 'SUCCESS';

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, vaciar, total, cantidadItems } = useCarrito();
  const [step, setStep] = useState<DrawerStep>('CART');
  const [pedidoConfirmado, setPedidoConfirmado] = useState<PedidoResponse | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    // Al cerrar, reseteamos el estado para la próxima apertura
    setTimeout(() => {
      setStep('CART');
      setPedidoConfirmado(null);
    }, 300);
    onClose();
  };

  const handleSuccess = (res: PedidoResponse) => {
    setPedidoConfirmado(res);
    setStep('SUCCESS');
  };

  return (
    <div className="cart-drawer-overlay" onClick={handleClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>{step === 'CART' ? `Tu Pedido (${cantidadItems})` : 'Finalizar Pedido'}</h2>
          <button onClick={handleClose} className="close-btn">✖</button>
        </div>

        <div className="cart-content-wrapper">
          {/* PASO 1: VISTA DEL CARRITO NORMAL */}
          {step === 'CART' && (
            cantidadItems === 0 ? (
              <div className="cart-empty">
                <p>Tu carrito está vacío.</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {items.map((item: ItemCarrito) => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <h4>{item.nombre}</h4>
                        <p>{item.cantidad} x ${item.precio}</p>
                      </div>
                      <div className="item-subtotal">
                        ${item.precio * item.cantidad}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span>${total}</span>
                  </div>
                  <div className="cart-actions">
                    <button className="btn-vaciar" onClick={vaciar}>Vaciar</button>
                    <button className="btn-checkout" onClick={() => setStep('CHECKOUT')}>
                      Continuar
                    </button>
                  </div>
                </div>
              </>
            )
          )}

          {/* PASO 2: FORMULARIO DE CHECKOUT */}
          {step === 'CHECKOUT' && (
            <CheckoutForm 
              onSuccess={handleSuccess} 
              onCancel={() => setStep('CART')} 
            />
          )}

          {/* PASO 3: TICKET DE ÉXITO */}
          {step === 'SUCCESS' && pedidoConfirmado && (
            <TicketSuccess 
              pedidoInfo={pedidoConfirmado} 
              onClose={handleClose} 
            />
          )}
        </div>
      </div>
    </div>
  );
}