import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Comercios from './pages/Comercios';
import Navbar from './components/navbar';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Inicio muestra los Productos */}
        <Route path="/" element={<Home />} />
        {/* Comercios muestra los Comercios */}
        <Route path="/comercios" element={<Comercios />} />
      </Routes>
    </BrowserRouter>
  );
}