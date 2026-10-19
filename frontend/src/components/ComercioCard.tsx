import { useNavigate } from 'react-router-dom';
import type { Comercio } from '../types/comercio';
import './ComercioCard.css';

interface ComercioCardProps {
  comercio: Comercio;
}

export default function ComercioCard({ comercio }: ComercioCardProps) {
  const navigate = useNavigate();

  // Imagen por defecto si el comercio no provee una
  const fallbackImage = 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=500';

  const handleClick = () => {
    // Navegación hacia la ruta del catálogo del comercio
    navigate(`/comercios/${comercio.id}`);
  };

  return (
    <div className="comercio-card" onClick={handleClick} role="button" tabIndex={0}>
      <div className="comercio-image-container">
        <img 
          src={comercio.imagenUrl || fallbackImage} 
          alt={comercio.nombre} 
          className="comercio-image" 
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