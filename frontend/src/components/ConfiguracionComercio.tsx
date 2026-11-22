import { useState, useEffect, type FormEvent } from 'react';
import './ConfiguracionComercio.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface FranjaItem {
  rango: string;
  capacidadMaxima: number;
  cuposDisponibles?: number;
}

interface ConfiguracionComercioProps {
  comercioId: string;
  onEstadoActualizado?: (nuevoEstado: string) => void;
}

export default function ConfiguracionComercio({
  comercioId,
  onEstadoActualizado,
}: ConfiguracionComercioProps) {
  const [nombreComercio, setNombreComercio] = useState('');
  const [estadoActual, setEstadoActual] = useState<string>('');
  const [horarios, setHorarios] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // Coordenadas originales para detectar cambio sensible de ubicación
  const [latOriginal, setLatOriginal] = useState<number | null>(null);
  const [lngOriginal, setLngOriginal] = useState<number | null>(null);

  // Franjas horarias
  const [franjas, setFranjas] = useState<FranjaItem[]>([]);
  const [nuevoRango, setNuevoRango] = useState('');
  const [nuevaCapacidad, setNuevaCapacidad] = useState<number>(5);

  // Estados de UI
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatosComercio = async () => {
      if (!comercioId) {
        setCargando(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/comercios/${comercioId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setNombreComercio(data.nombre || '');
          setEstadoActual(data.estado || '');
          setHorarios(data.horarios || '');

          // GeoJSON en MongoDB guarda [longitud, latitud]
          if (data.ubicacion) {
            let latParsed: number | null = null;
            let lngParsed: number | null = null;

            if (Array.isArray(data.ubicacion.coordinates) && data.ubicacion.coordinates.length >= 2) {
              lngParsed = Number(data.ubicacion.coordinates[0]);
              latParsed = Number(data.ubicacion.coordinates[1]);
            } else if (typeof data.ubicacion.y === 'number' && typeof data.ubicacion.x === 'number') {
              latParsed = Number(data.ubicacion.y);
              lngParsed = Number(data.ubicacion.x);
            }

            if (latParsed !== null && lngParsed !== null) {
              setLat(String(latParsed));
              setLng(String(lngParsed));
              setLatOriginal(latParsed);
              setLngOriginal(lngParsed);
            }
          }

          if (Array.isArray(data.franjas)) {
            setFranjas(
              data.franjas.map((f: any) => ({
                rango: f.rango,
                capacidadMaxima: Number(f.capacidadMaxima),
                cuposDisponibles:
                  typeof f.cuposDisponibles === 'number'
                    ? f.cuposDisponibles
                    : typeof f.disponibles === 'number'
                      ? f.disponibles
                      : undefined,
              }))
            );
          }
        }
      } catch {
        // Si el comercio está en PENDIENTE y el GET público lo oculta, permite cargar manual
      } finally {
        setCargando(false);
      }
    };

    cargarDatosComercio();
  }, [comercioId]);

  const ubicacionModificada =
    latOriginal !== null &&
    lngOriginal !== null &&
    !Number.isNaN(Number(lat)) &&
    !Number.isNaN(Number(lng)) &&
    (Number(lat) !== latOriginal || Number(lng) !== lngOriginal);

  const capturarUbicacionActual = () => {
    setError(null);
    if (!('geolocation' in navigator)) {
      setError('Tu navegador no soporta geolocalización.');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        setError('No se pudo obtener la ubicación. Verificá los permisos o cargala manualmente.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const agregarFranja = () => {
    setError(null);
    const rangoLimpio = nuevoRango.trim();

    if (!rangoLimpio) {
      setError('Ingresá un rango horario (ej: 10:00 - 11:00).');
      return;
    }
    if (franjas.some((f) => f.rango.toLowerCase() === rangoLimpio.toLowerCase())) {
      setError(`La franja "${rangoLimpio}" ya existe en la lista.`);
      return;
    }
    if (!nuevaCapacidad || nuevaCapacidad < 1) {
      setError('La capacidad máxima debe ser al menos 1.');
      return;
    }

    setFranjas((prev) => [
      ...prev,
      { rango: rangoLimpio, capacidadMaxima: Number(nuevaCapacidad) },
    ]);
    setNuevoRango('');
    setNuevaCapacidad(5);
  };

  const actualizarCapacidadFranja = (index: number, valor: number) => {
    setFranjas((prev) =>
      prev.map((f, i) => (i === index ? { ...f, capacidadMaxima: valor } : f))
    );
  };

  const eliminarFranja = (index: number) => {
    setFranjas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (!horarios.trim()) {
      setError('El horario de atención es obligatorio.');
      return;
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!lat.trim() || Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Ingresá una latitud válida (entre -90 y 90).');
      return;
    }
    if (!lng.trim() || Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError('Ingresá una longitud válida (entre -180 y 180).');
      return;
    }
    if (franjas.length === 0) {
      setError('Debés configurar al menos una franja horaria de retiro.');
      return;
    }

    setGuardando(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        horarios: horarios.trim(),
        lat: latNum,
        lng: lngNum,
        franjas: franjas.map((f) => ({
          rango: f.rango.trim(),
          capacidadMaxima: Number(f.capacidadMaxima),
        })),
      };

      const res = await fetch(`${API_URL}/api/comercios/${comercioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
        throw new Error(data.message || 'No se pudo actualizar la configuración del comercio.');
      }

      // Actualizamos referencias locales con la respuesta del servidor
      setLatOriginal(latNum);
      setLngOriginal(lngNum);
      if (data.estado) {
        setEstadoActual(data.estado);
        onEstadoActualizado?.(data.estado);
      }
      if (Array.isArray(data.franjas)) {
        setFranjas(
          data.franjas.map((f: any) => ({
            rango: f.rango,
            capacidadMaxima: Number(f.capacidadMaxima),
            cuposDisponibles:
              typeof f.cuposDisponibles === 'number' ? f.cuposDisponibles : f.disponibles,
          }))
        );
      }

      if (data.estado === 'PENDIENTE') {
        setExito(
          'Configuración guardada. Como modificaste las coordenadas, tu comercio pasó a estado PENDIENTE hasta ser aprobado nuevamente por el SuperAdmin.'
        );
      } else {
        setExito('Configuración de comercio y franjas horarias actualizada correctamente.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <p className="config-loading">Cargando configuración del comercio...</p>;
  }

  return (
    <section className="config-comercio-card">
      <header className="config-comercio-header">
        <div>
          <h3>Configurar mi Comercio y Franjas {nombreComercio ? `— ${nombreComercio}` : ''}</h3>
          <p>Administrá tus horarios de atención, ubicación del local y cupos por franja de retiro.</p>
        </div>
        {estadoActual && (
          <span className={`badge-estado-comercio estado-${estadoActual.toLowerCase()}`}>
            Estado: {estadoActual}
          </span>
        )}
      </header>

      {error && <div className="config-alerta error">⚠️ {error}</div>}
      {exito && <div className="config-alerta exito">✅ {exito}</div>}

      <form onSubmit={handleSubmit} className="config-comercio-form" noValidate>
        {/* Bloque 1: Horarios y Ubicación */}
        <div className="config-seccion">
          <h4>1. Horarios y Ubicación Geográfica</h4>

          <div className="config-grupo">
            <label htmlFor="config-horarios">Horarios de Atención *</label>
            <input
              id="config-horarios"
              type="text"
              placeholder="Ej: Lun a Sáb 09:00 - 20:00"
              value={horarios}
              onChange={(e) => setHorarios(e.target.value)}
              required
            />
          </div>

          <div className="config-ubicacion-bar">
            <span>Coordenadas del Local *</span>
            <button
              type="button"
              className="btn-geo-config"
              onClick={capturarUbicacionActual}
              disabled={geoLoading}
            >
              {geoLoading ? '⏳ Obteniendo...' : '📍 Usar mi ubicación actual'}
            </button>
          </div>

          <div className="config-fila-dos">
            <div className="config-grupo">
              <label htmlFor="config-lat">Latitud *</label>
              <input
                id="config-lat"
                type="number"
                step="any"
                placeholder="Ej: -34.603722"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
              />
            </div>

            <div className="config-grupo">
              <label htmlFor="config-lng">Longitud *</label>
              <input
                id="config-lng"
                type="number"
                step="any"
                placeholder="Ej: -58.381592"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                required
              />
            </div>
          </div>

          {ubicacionModificada && (
            <div className="config-alerta advertencia">
              ⚠️ <strong>Re-moderación sensible:</strong> Detectamos un cambio en las coordenadas. Al guardar, tu comercio pasará temporalmente a estado <strong>PENDIENTE</strong> hasta que un administrador valide la nueva ubicación.
            </div>
          )}
        </div>

        {/* Bloque 2: Franjas Horarias */}
        <div className="config-seccion">
          <h4>2. Franjas Horarias de Retiro (Click & Collect)</h4>
          <p className="config-ayuda">
            Definí los rangos horarios y la cantidad máxima de pedidos simultáneos por turno. No podés reducir la capacidad por debajo de los turnos ya reservados.
          </p>

          <div className="agregar-franja-box">
            <div className="config-grupo">
              <label htmlFor="nuevo-rango">Rango Horario</label>
              <input
                id="nuevo-rango"
                type="text"
                placeholder="Ej: 10:00 - 11:00"
                value={nuevoRango}
                onChange={(e) => setNuevoRango(e.target.value)}
              />
            </div>

            <div className="config-grupo">
              <label htmlFor="nueva-capacidad">Capacidad Máx.</label>
              <input
                id="nueva-capacidad"
                type="number"
                min={1}
                value={nuevaCapacidad}
                onChange={(e) => setNuevaCapacidad(Number(e.target.value))}
              />
            </div>

            <button type="button" className="btn-agregar-franja" onClick={agregarFranja}>
              + Agregar Franja
            </button>
          </div>

          {franjas.length === 0 ? (
            <p className="franjas-vacio">Todavía no tenés franjas horarias cargadas.</p>
          ) : (
            <div className="franjas-lista">
              {franjas.map((franja, idx) => {
                const usados =
                  typeof franja.cuposDisponibles === 'number'
                    ? Math.max(franja.capacidadMaxima - franja.cuposDisponibles, 0)
                    : null;

                return (
                  <div key={`${franja.rango}-${idx}`} className="franja-item">
                    <div className="franja-info">
                      <strong>🕒 {franja.rango}</strong>
                      {usados !== null && (
                        <span className="franja-reservas-tag">
                          Reservas activas: {usados} | Disponibles: {franja.cuposDisponibles}
                        </span>
                      )}
                    </div>

                    <div className="franja-controles">
                      <label htmlFor={`cap-${idx}`}>Cupo máx.:</label>
                      <input
                        id={`cap-${idx}`}
                        type="number"
                        min={1}
                        value={franja.capacidadMaxima}
                        onChange={(e) =>
                          actualizarCapacidadFranja(idx, Number(e.target.value))
                        }
                      />
                      <button
                        type="button"
                        className="btn-eliminar-franja"
                        onClick={() => eliminarFranja(idx)}
                        title="Eliminar franja"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="config-acciones">
          <button type="submit" className="btn-guardar-config" disabled={guardando}>
            {guardando ? 'Guardando cambios...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </section>
  );
}