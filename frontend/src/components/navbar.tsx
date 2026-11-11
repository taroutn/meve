import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LogoMeve from './LogoMeve';
import { useCarrito } from '../hooks/useCarrito';
import './navbar.css';

interface NavbarProps {
  onOpenCart: () => void;
}

export default function Navbar({ onOpenCart }: NavbarProps) {
  // Lógica del carrito de develop
  const { items } = useCarrito();
  const cantidadCarrito = items.reduce((acc, item) => acc + item.cantidad, 0);

  // Hooks para ruteo y escucha de URL
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lógica de sesión
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRol = localStorage.getItem('rol'); 
    
    if (token) {
      setIsAuthenticated(true);
      setRol(userRol);
    } else {
      setIsAuthenticated(false);
      setRol(null);
    }
  }, [location]); // Se actualiza al cambiar de ruta

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('comercioId');
    
    setIsAuthenticated(false);
    setRol(null);
    navigate('/login');
  };

  const irAlPanel = () => {
    if (rol === 'SUPERADMIN') {
      navigate('/admin/moderacion');
    } else {
      navigate('/vendedor/panel');
    }
  };

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
        
        <button className="cart-toggle-btn" onClick={onOpenCart} type="button">
          🛒 <span className="cart-badge">{cantidadCarrito}</span>
        </button>

        {!isAuthenticated ? (
          <button className="btn-login-nav" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </button>
        ) : (
          <div className="auth-actions">
            <button className="btn-panel-nav" onClick={irAlPanel}>
              Mi Panel
            </button>
            <button className="btn-logout-nav" onClick={handleLogout}>
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}