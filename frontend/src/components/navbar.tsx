import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCarrito } from '../hooks/useCarrito';
import CarritoDrawer from './CarritoDrawer';
import './navbar.css';

export default function Navbar() {
  // Lógica del carrito original
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cantidadItems } = useCarrito();

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
  }, [location]); // Se actualiza solo cuando cambia la URL (ej: al hacer login)

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
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">MeVe</Link>
        </div>
        
        <div className="navbar-links">
          <Link to="/">Inicio</Link>
          <Link to="/comercios">Comercios</Link>
          
          {/* Botón del Carrito Intacto */}
          <button className="cart-toggle-btn" onClick={() => setIsCartOpen(true)}>
            🛒 <span className="cart-badge">{cantidadItems}</span>
          </button>

          {/* Renderizado Condicional de Sesión */}
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

      {/* Renderizado del Drawer */}
      <CarritoDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}