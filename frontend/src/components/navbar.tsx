import { NavLink } from 'react-router-dom';
import './navbar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <h2>MeVe</h2>
      </div>
      <nav className="navbar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'link active' : 'link'}>
          Inicio
        </NavLink>
        <NavLink to="/comercios" className={({ isActive }) => isActive ? 'link active' : 'link'}>
          Comercios
        </NavLink>
      </nav>
    </header>
  );
}