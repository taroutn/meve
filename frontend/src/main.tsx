import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AccessibilityProvider } from './context/AccessibilityContext.tsx';
import AccessibilityBar from './components/AccessibilityBar.tsx';
import './index.css';
import './styles/variables.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <AccessibilityBar />
      <App />
    </AccessibilityProvider>
  </React.StrictMode>,
);
