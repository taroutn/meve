import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CarritoProvider } from './context/CarritoProvider';
import Home from './pages/Home';
import Comercios from './pages/Comercios';
import ComercioDetail from './pages/ComercioDetail';
import PanelVendedor from './pages/PanelVendedor';
import PanelSuperAdmin from './pages/PanelSuperAdmin';
import Navbar from './components/navbar';
import CarritoDrawer from './components/CarritoDrawer';
import Login from './pages/Login';

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CarritoProvider>
      <BrowserRouter>
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/comercios" element={<Comercios />} />
          <Route path="/comercios/:id" element={<ComercioDetail />} />
          <Route path="/vendedor/panel" element={<PanelVendedor />} />
          <Route path="/admin/moderacion" element={<PanelSuperAdmin />} />
          <Route path="/login" element={<Login />} />
        </Routes>

        <CarritoDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
        />
      </BrowserRouter>
    </CarritoProvider>
  );
}