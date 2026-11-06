import { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  darkMode: boolean;
  highContrast: boolean;
  fontSizeScale: number; // 1 = 100%, 1.25 = 125%, etc. hasta 2.0 (200%)
  toggleDarkMode: () => void;
  toggleHighContrast: () => void;
  setFontSizeScale: (scale: number) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('meve_accessibility_dark') === 'true';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('meve_accessibility_contrast') === 'true';
  });

  const [fontSizeScale, setFontSizeScaleState] = useState<number>(() => {
    const saved = localStorage.getItem('meve_accessibility_zoom');
    return saved ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem('meve_accessibility_dark', String(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('meve_accessibility_contrast', String(highContrast));
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('meve_accessibility_zoom', String(fontSizeScale));
    document.documentElement.style.fontSize = `${fontSizeScale * 100}%`;
  }, [fontSizeScale]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const setFontSizeScale = (scale: number) => setFontSizeScaleState(scale);

  return (
    <AccessibilityContext.Provider 
      value={{ darkMode, highContrast, fontSizeScale, toggleDarkMode, toggleHighContrast, setFontSizeScale }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe usarse dentro de un AccessibilityProvider');
  }
  return context;
}