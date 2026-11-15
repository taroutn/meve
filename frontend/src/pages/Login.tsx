import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

// Función auxiliar para decodificar el payload del JWT de forma segura
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return {};
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Credenciales inválidas o error en el servidor.');

      const data = await res.json();
      console.log("Respuesta completa del login:", data);

      const token = data.token;
      if (!token) throw new Error('No se recibió un token válido.');

      // Guardamos el token en localStorage
      localStorage.setItem('token', token);

      // Decodificamos el token para extraer el rol y el comercioId que vienen dentro
      const decodedToken = parseJwt(token);
      console.log("Token decodificado:", decodedToken);

      const rol = (decodedToken.rol || decodedToken.role || '').toUpperCase();
      const comercioId = decodedToken.comercioId || decodedToken.idComercio || data.comercioId;

      if (rol) localStorage.setItem('rol', rol);
      if (comercioId) localStorage.setItem('comercioId', comercioId);

      // Redirección condicional exacta según el rol obtenido del token
      if (rol === 'SUPERADMIN' || rol.includes('ADMIN')) {
        navigate('/admin/moderacion');
      } else if (rol === 'VENDEDOR' || rol.includes('VENDEDOR')) {
        navigate('/vendedor/panel');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <p>Accedé a tu panel de gestión</p>
        
        {error && <div className="status-message error">⚠️ {error}</div>}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ejemplo@correo.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}