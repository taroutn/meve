import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './SumateMeve.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface RegistroComercioResponse {
  mensaje: string;
  comercioId: string;
  estadoComercio: string;
  usuarioId: string;
  email: string;
}

export default function SumateMeve() {
  // Datos del responsable (Vendedor)
  const [nombreVendedor, setNombreVendedor] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Datos del local (Comercio)
  const [nombreComercio, setNombreComercio] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');

  // Estados de UI
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMensaje, setGeoMensaje] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registroExitoso, setRegistroExitoso] = useState<RegistroComercioResponse | null>(null);

  const capturarUbicacion = () => {
    setGeoMensaje(null);
    setError(null);

    if (!('geolocation' in navigator)) {
      setError('Tu navegador no soporta geolocalización. Ingresá las coordenadas manualmente.');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitud(position.coords.latitude.toFixed(6));
        setLongitud(position.coords.longitude.toFixed(6));
        setGeoMensaje('Ubicación capturada correctamente.');
        setGeoLoading(false);
      },
      (geoError) => {
        setGeoLoading(false);
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError('Permiso de ubicación denegado. Habilitalo en el navegador o cargá las coordenadas manualmente.');
            break;
          case geoError.POSITION_UNAVAILABLE:
            setError('No se pudo determinar tu ubicación actual. Intentá nuevamente o ingresala manual.');
            break;
          default:
            setError('Tiempo de espera agotado al obtener la ubicación.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validarFormulario = (): string | null => {
    if (!nombreVendedor.trim()) return 'El nombre del responsable es obligatorio.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Ingresá un correo electrónico válido.';
    }
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!nombreComercio.trim()) return 'El nombre del comercio es obligatorio.';
    if (!whatsapp.trim()) return 'El número de WhatsApp de contacto es obligatorio.';

    const latNum = Number(latitud);
    const lngNum = Number(longitud);
    if (!latitud.trim() || Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
      return 'Ingresá una latitud válida (entre -90 y 90) o usá el botón de ubicación.';
    }
    if (!longitud.trim() || Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      return 'Ingresá una longitud válida (entre -180 y 180) o usá el botón de ubicación.';
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validarFormulario();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nombreVendedor: nombreVendedor.trim(),
        email: email.trim().toLowerCase(),
        password,
        nombreComercio: nombreComercio.trim(),
        whatsapp: whatsapp.trim(),
        latitud: Number(latitud),
        longitud: Number(longitud),
      };

      const res = await fetch(`${API_URL}/api/auth/registro-comercio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText };
      }

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(data.message || 'Ya existe un usuario registrado con ese email.');
        }
        throw new Error(data.message || 'No se pudo completar el registro. Verificá los datos ingresados.');
      }

      setRegistroExitoso(data as RegistroComercioResponse);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Pantalla de confirmación tras registro exitoso
  if (registroExitoso) {
    return (
      <div className="sumate-container">
        <div className="sumate-card sumate-confirmacion">
          <div className="confirmacion-icono">✅</div>
          <h2>¡Solicitud recibida con éxito!</h2>
          <p className="confirmacion-subtitulo">
            Tu comercio <strong>{nombreComercio}</strong> fue registrado en MeVe y quedó vinculado a tu cuenta.
          </p>

          <div className="estado-pendiente-box">
            <span className="badge-pendiente">
              Estado: {registroExitoso.estadoComercio || 'PENDIENTE'} DE APROBACIÓN
            </span>
            <p>
              Un administrador revisará los datos de tu local antes de habilitarlo en la vitrina pública.
              Una vez aprobado, vas a poder ingresar con tu correo <strong>{registroExitoso.email}</strong> para cargar tus productos y gestionar pedidos.
            </p>
          </div>

          <div className="confirmacion-acciones">
            <Link to="/" className="btn-sumate-secundario">
              Volver al Inicio
            </Link>
            <Link to="/login" className="btn-sumate-primario">
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sumate-container">
      <div className="sumate-card">
        <header className="sumate-header">
          <h2>Sumate a MeVe</h2>
          <p>Registrá tu comercio barrial y empezá a recibir pedidos con retiro programado en tu local.</p>
        </header>

        {error && <div className="sumate-alerta error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="sumate-form" noValidate>
          <fieldset className="sumate-seccion">
            <legend>1. Datos del Responsable (Cuenta Vendedor)</legend>

            <div className="form-grupo">
              <label htmlFor="nombreVendedor">Nombre y Apellido *</label>
              <input
                id="nombreVendedor"
                type="text"
                placeholder="Ej: Martín Gómez"
                value={nombreVendedor}
                onChange={(e) => setNombreVendedor(e.target.value)}
                required
              />
            </div>

            <div className="form-fila">
              <div className="form-grupo">
                <label htmlFor="email">Correo Electrónico *</label>
                <input
                  id="email"
                  type="email"
                  placeholder="comercio@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-grupo">
                <label htmlFor="password">Contraseña (mín. 8 caracteres) *</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="sumate-seccion">
            <legend>2. Datos del Comercio</legend>

            <div className="form-fila">
              <div className="form-grupo">
                <label htmlFor="nombreComercio">Nombre del Local *</label>
                <input
                  id="nombreComercio"
                  type="text"
                  placeholder="Ej: Panadería El Sol"
                  value={nombreComercio}
                  onChange={(e) => setNombreComercio(e.target.value)}
                  required
                />
              </div>

              <div className="form-grupo">
                <label htmlFor="whatsapp">WhatsApp de Contacto *</label>
                <input
                  id="whatsapp"
                  type="tel"
                  placeholder="Ej: 5491123456789"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="ubicacion-header">
              <span>Ubicación Geográfica del Local *</span>
              <button
                type="button"
                className="btn-geo"
                onClick={capturarUbicacion}
                disabled={geoLoading}
              >
                {geoLoading ? '⏳ Obteniendo...' : '📍 Usar mi ubicación actual'}
              </button>
            </div>

            {geoMensaje && <p className="geo-exito">✓ {geoMensaje}</p>}

            <div className="form-fila">
              <div className="form-grupo">
                <label htmlFor="latitud">Latitud *</label>
                <input
                  id="latitud"
                  type="number"
                  step="any"
                  placeholder="Ej: -34.603722"
                  value={latitud}
                  onChange={(e) => setLatitud(e.target.value)}
                  required
                />
              </div>

              <div className="form-grupo">
                <label htmlFor="longitud">Longitud *</label>
                <input
                  id="longitud"
                  type="number"
                  step="any"
                  placeholder="Ej: -58.381592"
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  required
                />
              </div>
            </div>
          </fieldset>

          <button type="submit" className="btn-submit-sumate" disabled={submitting}>
            {submitting ? 'Registrando comercio...' : 'Registrar mi Comercio'}
          </button>

          <p className="sumate-login-link">
            ¿Ya tenés una cuenta registrada? <Link to="/login">Iniciá sesión acá</Link>
          </p>
        </form>
      </div>
    </div>
  );
}