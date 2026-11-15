import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CarritoProvider } from './context/CarritoProvider';
import Home from './pages/Home';
import Comercios from './pages/Comercios';
import ComercioDetail from './pages/ComercioDetail';
import Navbar from './components/navbar';
import CarritoDrawer from './components/CarritoDrawer';

export default function App() {
  // Estado que controla si el carrito está visible o no
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CarritoProvider>
      <BrowserRouter>
        {/* Le pasamos la función al Navbar para que el botón la ejecute */}
        <Navbar onOpenCart={() => setIsCartOpen(true)} />
        
        {/* Renderizamos el panel del carrito */}
        <CarritoDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/comercios" element={<Comercios />} />
          <Route path="/comercios/:id" element={<ComercioDetail />} />
        </Routes>
      </BrowserRouter>
    </CarritoProvider>
  );
}