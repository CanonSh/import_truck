import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="w-full bg-[#070f1e] border-b border-slate-800 sticky top-0 z-50">

      {/* Menu Principal */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-lg md:text-xl font-black text-[#e5a93b] tracking-wider">
          IMPORT TRUCK L&B
        </Link>

        {/* Boton Hamburguesa para Moviles */}
        <button 
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="lg:hidden text-slate-300 hover:text-white p-1 focus:outline-none"
        >
          {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Links de PC */}
        <nav className="hidden lg:flex gap-6 text-xs md:text-sm font-bold tracking-wide">
          <Link to="/" className="hover:text-[#e5a93b] transition-colors">INICIO</Link>
          <Link to="/camiones" className="hover:text-[#e5a93b] transition-colors">CAMIONES</Link>
          <Link to="/carros" className="hover:text-[#e5a93b] transition-colors">CARROS</Link>
          <Link to="/alquiler" className="hover:text-[#e5a93b] transition-colors">ALQUILER DE TRANSPORTE</Link>
          <Link to="/vacantes" className="hover:text-[#e5a93b] transition-colors">VACANTES</Link>
          <Link to="/contacto" className="hover:text-[#e5a93b] transition-colors">CONTACTO</Link>
        </nav>
      </div>

      {/* Menu desplegable para Movil */}
      {menuAbierto && (
        <nav className="lg:hidden bg-[#0a1628] border-b border-slate-800 px-4 py-4 flex flex-col gap-3 text-sm font-semibold">
          <Link to="/" onClick={() => setMenuAbierto(false)} className="hover:text-[#e5a93b] py-1 border-b border-slate-800/40">INICIO</Link>
          <Link to="/camiones" onClick={() => setMenuAbierto(false)} className="hover:text-[#e5a93b] py-1 border-b border-slate-800/40">CAMIONES</Link>
          <Link to="/carros" onClick={() => setMenuAbierto(false)} className="hover:text-[#e5a93b] py-1 border-b border-slate-800/40">CARROS</Link>
          <Link to="/alquiler" onClick={() => setMenuAbierto(false)} className="hover:text-[#e5a93b] py-1 border-b border-slate-800/40">ALQUILER DE TRANSPORTE</Link>
          <Link to="/vacantes" onClick={() => setMenuAbierto(false)} className="hover:text-[#e5a93b] py-1 border-b border-slate-800/40">VACANTES</Link>
          <Link to="/contacto" onClick={() => setMenuAbierto(false)} className="hover:text-[#e5a93b] py-1">CONTACTO</Link>
        </nav>
      )}
    </header>
  );
}