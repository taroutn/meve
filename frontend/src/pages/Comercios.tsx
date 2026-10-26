import { useState, useEffect } from 'react';
import ComercioCard from '../components/ComercioCard';
import Spinner from '../components/Spinner';
import type { Comercio } from '../types/comercio';

export default function Comercios() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/comercios')
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener los comercios.');
        return res.json();
      })
      .then((data: Comercio[]) => {
        setComercios(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Comercios Disponibles</h1>
        <p>Elegí tu local favorito y explorá sus productos en la plataforma.</p>
      </div>

      {loading && <Spinner />}
      {error && <p className="status-message error">⚠️ {error}</p>}

      {!loading && !error && (
        <div className="comercios-grid">
          {comercios.map((comercio) => (
            <ComercioCard key={comercio.id} comercio={comercio} />
          ))}
        </div>
      )}
    </div>
  );
}