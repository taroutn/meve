import { Link } from 'react-router-dom';
import LogoMeve from './LogoMeve';
import { useCarrito } from '../hooks/useCarrito';
import './navbar.css';

interface NavbarProps {
  onOpenCart: () => void;
}

export default function Navbar({ onOpenCart }: NavbarProps) {
  const { items } = useCarrito();
  const cantidadCarrito = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <LogoMeve width={160} />
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Inicio</Link>
        <Link to="/comercios">Comercios</Link>
        
        {/* Restauramos tu clase original para que recupere su estilo y el evento onClick */}
        <button className="cart-toggle-btn" onClick={onOpenCart} type="button">
          🛒 <span className="cart-badge">{cantidadCarrito}</span>
        </button>
      </div>
    </nav>
  );
}