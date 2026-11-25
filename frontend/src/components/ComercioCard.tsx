import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Comercio } from '../types/comercio';
import { FALLBACK_COMERCIO } from '../utils/fallbackImages';
import './ComercioCard.css';

interface ComercioCardProps {
  comercio: Comercio;
}

export default function ComercioCard({ comercio }: ComercioCardProps) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [comercio.imagenUrl]);

  const imagenMostrar =
    comercio.imagenUrl && !imgError ? comercio.imagenUrl : FALLBACK_COMERCIO;

  const handleClick = () => {
    navigate(`/comercios/${comercio.id}`);
  };

  return (
    <div className="comercio-card" onClick={handleClick} role="button" tabIndex={0}>
      <div className="comercio-image-container">
        <img
          src={imagenMostrar}
          alt={comercio.nombre}
          className="comercio-card-img"
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
        />
      </div>
      <div className="comercio-info">
        <h3 className="comercio-nombre">{comercio.nombre}</h3>
        <p className="comercio-descripcion">{comercio.descripcion}</p>
        <div className="comercio-horarios">
          <span className="horario-icon">🕒</span>
          <span>{comercio.horarios || 'Horarios no especificados'}</span>
        </div>
      </div>
    </div>
  );
}