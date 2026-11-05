import { useAccessibility } from '../context/AccessibilityContext';
import './AccessibilityBar.css';

export default function AccessibilityBar() {
  const { darkMode, highContrast, fontSizeScale, toggleDarkMode, toggleHighContrast, setFontSizeScale } = useAccessibility();

  return (
    <div className="accessibility-bar" role="region" aria-label="Barra de Accesibilidad">
      <div className="accessibility-container">
        <span className="accessibility-title">♿ Accesibilidad:</span>
        
        <div className="accessibility-controls">
          <button 
            onClick={toggleDarkMode} 
            className={`accessibility-btn ${darkMode ? 'active' : ''}`}
            title="Activar o desactivar modo oscuro"
          >
            {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </button>

          <button 
            onClick={toggleHighContrast} 
            className={`accessibility-btn ${highContrast ? 'active' : ''}`}
            title="Activar paleta de alto contraste"
          >
            Alto Contraste
          </button>

          <div className="zoom-controls">
            <span>Zoom:</span>
            <button 
              onClick={() => setFontSizeScale(Math.max(1, fontSizeScale - 0.15))} 
              className="zoom-btn"
              title="Reducir letra"
              disabled={fontSizeScale <= 1}
            >
              A-
            </button>
            <span className="zoom-value">{Math.round(fontSizeScale * 100)}%</span>
            <button 
              onClick={() => setFontSizeScale(Math.min(2.0, fontSizeScale + 0.15))} 
              className="zoom-btn"
              title="Aumentar letra hasta 200%"
              disabled={fontSizeScale >= 2.0}
            >
              A+
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}