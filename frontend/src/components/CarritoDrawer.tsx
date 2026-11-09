import { useState } from 'react';
import { useCarrito } from '../hooks/useCarrito';
import CheckoutForm from './CheckoutForm';
import './CarritoDrawer.css';

type DrawerStep = 'CART' | 'CHECKOUT';

interface CarritoDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function CarritoDrawer({ isOpen, setIsOpen }: CarritoDrawerProps) {
  const { items, total, restar } = useCarrito(); 
  const [step, setStep] = useState<DrawerStep>('CART');

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => setStep('CART'), 300);
  };

  const handleSuccess = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={handleClose} />
      <div className={`drawer-content ${isOpen ? 'open' : ''}`}>
        
        <div className="drawer-header">
          <h2>{step === 'CART' ? 'Tu Carrito' : 'Finalizar Compra'}</h2>
          <button className="btn-close" onClick={handleClose}>✕</button>
        </div>

        <div className="drawer-body">
          {step === 'CART' && (
            <div className="cart-content-wrapper">
              {items.length === 0 ? (
                <p className="empty-cart">Tu carrito está vacío.</p>
              ) : (
                <div className="cart-items">
                  {items.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <h4>{item.nombre}</h4>
                        <p>{item.cantidad} x ${item.precio}</p>
                      </div>
                      <button className="btn-remove" onClick={() => restar(item.id)}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'CHECKOUT' && (
            <CheckoutForm 
              onSuccess={handleSuccess} 
              onCancel={() => setStep('CART')} 
            />
          )}
        </div>

        {step === 'CART' && items.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>${total}</span>
            </div>
            <button className="btn-checkout" onClick={() => setStep('CHECKOUT')}>
              Continuar al pago
            </button>
          </div>
        )}

      </div>
    </>
  );
}