import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCarrito } from '../hooks/useCarrito';
import CarritoDrawer from './CarritoDrawer';
import './navbar.css';

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cantidadItems } = useCarrito();

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">MeVe</Link>
        </div>
        <div className="navbar-links">
          <Link to="/">Inicio</Link>
          <Link to="/comercios">Comercios</Link>
          
          {/* Botón del Carrito */}
          <button className="cart-toggle-btn" onClick={() => setIsCartOpen(true)}>
            🛒 <span className="cart-badge">{cantidadItems}</span>
          </button>
        </div>
      </nav>

      {/* Renderizado condicional del Drawer */}
      <CarritoDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}