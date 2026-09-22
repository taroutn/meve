import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UIShell from './components/UIShell';
import Home from './pages/Home';
import Comercios from './pages/Comercios';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* El UI Shell envuelve a las rutas fijando el Navbar */}
        <Route path="/" element={<UIShell />}>
          <Route index element={<Home />} />
          <Route path="comercios" element={<Comercios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}