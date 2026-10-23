import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CarritoProvider } from './context/CarritoProvider';
import Home from './pages/Home';
import Comercios from './pages/Comercios';
import ComercioDetail from './pages/ComercioDetail';
import Navbar from './components/navbar';

export default function App() {
  return (
    <CarritoProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/comercios" element={<Comercios />} />
          <Route path="/comercios/:id" element={<ComercioDetail />} />
        </Routes>
      </BrowserRouter>
    </CarritoProvider>
  );
}