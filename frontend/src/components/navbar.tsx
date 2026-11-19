import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCarrito } from '../hooks/useCarrito';
import logoMeve from '../../assets/logo-meve.svg';
import './navbar.css';

interface NavbarProps {
  onOpenCart: () => void;
}

export default function Navbar({ onOpenCart }: NavbarProps) {
  const { items } = useCarrito();
  const cantidadCarrito = items.reduce((acc, item) => acc + item.cantidad, 0);

  const navigate = useNavigate();
  const location = useLocation();
  
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
  }, [location]);

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
          <img src={logoMeve} alt="MeVe" className="navbar-logo-img" />
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Inicio</Link>
        <Link to="/comercios">Comercios</Link>
        {!isAuthenticated && <Link to="/sumate">Sumate a MeVe</Link>}
        
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