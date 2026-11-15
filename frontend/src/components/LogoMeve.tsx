interface LogoProps {
  width?: number | string;
  className?: string;
}

export default function LogoMeve({ width = 180, className = "" }: LogoProps) {
  return (
    <svg
      width={width}
      viewBox="-10 0 450 170" /* Ampliamos el viewBox para que entre todo el texto horizontal */
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Logo MeVe"
    >
      <g transform="translate(0, 5)">
        <path d="M 60 85 L 40 45" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
        <path d="M 140 85 L 160 45" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
        <path d="M 30 85 L 170 85" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
        <path d="M 40 85 L 65 145 Q 70 155 80 155 L 120 155 Q 130 155 135 145 L 160 85" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 48 110 L 152 110" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
        <path d="M 57 135 L 143 135" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
        <path d="M 80 85 L 80 155" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
        <path d="M 100 85 L 100 155" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
        <path d="M 120 85 L 120 155" stroke="#5a7d65" strokeWidth="8" strokeLinecap="round" />
        <path d="M 100 15 C 75 15 55 35 55 60 C 55 90 100 125 100 125 C 100 125 145 90 145 60 C 145 35 125 15 100 15 Z" stroke="#9caea4" strokeWidth="8" fill="var(--bg-color, #1a1a1a)" strokeLinejoin="round" />
        <circle cx="100" cy="55" r="14" stroke="#9caea4" strokeWidth="8" fill="var(--bg-color, #1a1a1a)" />
      </g>
      
      {/* Usamos currentColor para que sea negro en modo claro y blanco en modo oscuro */}
      <text 
        x="190" 
        y="115" 
        textAnchor="start" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontWeight="900" 
        fontSize="85" 
        fill="currentColor" 
        letterSpacing="-2"
      >
        MeVe
      </text>
    </svg>
  );
}