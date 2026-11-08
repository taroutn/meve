interface LogoProps {
  width?: number | string;
  className?: string;
}

export default function LogoMeve({ width = 160, className = "" }: LogoProps) { // Aumentamos el tamaño por defecto a 160
  return (
    <svg
      width={width}
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Logo MeVe"
    >
      {/* --- CANASTA (Color Verde Tema: #5a7d65) --- */}
      {/* Asas */}
      <path d="M 60 85 L 40 45" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
      <path d="M 140 85 L 160 45" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />

      {/* Contorno y base */}
      <path d="M 30 85 L 170 85" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
      <path 
        d="M 40 85 L 65 145 Q 70 155 80 155 L 120 155 Q 130 155 135 145 L 160 85" 
        stroke="#5a7d65" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Líneas horizontales de la grilla */}
      <path d="M 48 110 L 152 110" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
      <path d="M 57 135 L 143 135" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
      
      {/* Líneas verticales de la grilla */}
      <path d="M 80 85 L 80 155" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
      <path d="M 100 85 L 100 155" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
      <path d="M 120 85 L 120 155" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />

      {/* --- PIN DE UBICACIÓN (Color Verde Salvia claro) --- */}
      <path 
        d="M 100 15 C 75 15 55 35 55 60 C 55 90 100 125 100 125 C 100 125 145 90 145 60 C 145 35 125 15 100 15 Z" 
        stroke="#9caea4" 
        strokeWidth="8" 
        fill="#1a1a1a" 
        strokeLinejoin="round" 
      />
      <circle cx="100" cy="55" r="14" stroke="#9caea4" strokeWidth="8" fill="#1a1a1a" />

      {/* --- TEXTO MEVE --- */}
      <text 
        x="100" 
        y="210" 
        textAnchor="middle" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontWeight="900" 
        fontSize="48" 
        fill="currentColor" 
        letterSpacing="-1"
      >
        MeVe
      </text>
    </svg>
  );
}