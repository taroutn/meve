import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './navbar';
import CarritoDrawer from './CarritoDrawer';

export default function UIShell() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="ui-shell">
      {/* Pasamos la función obligatoria que exigía TypeScript */}
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      
      <main className="main-content" style={{ padding: '2rem' }}>
        <Outlet />
      </main>

      {/* Renderizamos el Drawer globalmente para que funcione desde cualquier página */}
      <CarritoDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </div>
  );
}