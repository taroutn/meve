import { useCarrito } from '../hooks/useCarrito';
import type { ItemCarrito } from '../types/carrito';
import './CarritoDrawer.css';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, vaciar, total, cantidadItems } = useCarrito();

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Tu Pedido ({cantidadItems})</h2>
          <button onClick={onClose} className="close-btn">✖</button>
        </div>

        {cantidadItems === 0 ? (
          <div className="cart-empty">
            <p>Tu carrito está vacío.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {/* 2. Reemplazamos "any" por "ItemCarrito" */}
              {items.map((item: ItemCarrito) => (
                <div key={item.id} className="cart-item" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div className="item-info">
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.nombre}</h4>
                    <p style={{ margin: 0, color: '#666' }}>
                      {item.cantidad} x ${item.precio}
                    </p>
                  </div>
                  <div className="item-subtotal" style={{ fontWeight: 'bold', color: '#5a7d65' }}>
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
                <button className="btn-checkout">Confirmar</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}