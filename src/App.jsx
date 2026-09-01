import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Camiones from './pages/Camiones';
import Carros from './pages/Carros';
import Alquiler from './pages/Alquiler';
import Vacantes from './pages/Vacantes';
import Contacto from './pages/Contacto';


export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
        <div>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/camiones" element={<Camiones />} />
              <Route path="/carros" element={<Carros />} />
              <Route path="/alquiler" element={<Alquiler />} />
              <Route path="/vacantes" element={<Vacantes />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/contacto/:servicio" element={<Contacto />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}