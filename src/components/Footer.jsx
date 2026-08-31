import { Truck, Tag, UserCheck, Wrench, Phone, Mail, MapPin } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaTiktok } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="w-full bg-[#070f1e] border-t border-slate-800 text-slate-300 text-xs mt-12">
      {/*beneficios */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-b border-slate-800/60">
        <div className="flex items-start gap-3">
          <Truck className="w-7 h-7 text-[#e5a93b] shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm">Importación directa</h4>
            <p className="text-slate-400">Unidades de calidad garantizada.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Tag className="w-7 h-7 text-[#e5a93b] shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm">Precios competitivos</h4>
            <p className="text-slate-400">Las mejores ofertas del mercado.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <UserCheck className="w-7 h-7 text-[#e5a93b] shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm">Asesoría personalizada</h4>
            <p className="text-slate-400">Te orientamos en la mejor opción.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Wrench className="w-7 h-7 text-[#e5a93b] shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm">Soporte y mantenimiento</h4>
            <p className="text-slate-400">Servicio postventa disponible.</p>
          </div>
        </div>
      </div>

      {/*informacion */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-slate-800/60">
        <div>
          <h4 className="font-bold text-white mb-3 uppercase tracking-wider">Contáctanos</h4>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#e5a93b]" /> +503 7214-5892</li>
            <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#e5a93b]" /> +503 2501-7733</li>
            <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#e5a93b]" /> info@importtrucklb.com</li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#e5a93b] shrink-0 mt-0.5" />
              <span>Carretera a Santa Ana, Km 26, La Libertad, El Salvador</span>
            </li>
          </ul>
        </div>

        <div className="text-center flex flex-col items-center">
          <h3 className="font-black text-[#e5a93b] text-base mb-1">Import Truck L&B</h3>
          <p className="text-slate-400 max-w-xs mb-3">Tu aliado en transporte y carga pesada.</p>
        </div>

        <div className="md:text-right">
          <h4 className="font-bold text-white mb-3 uppercase tracking-wider">Síguenos</h4>
          <div className="flex md:justify-end gap-3">
            <a href="#" className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <FaFacebookF className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <FaInstagram className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <FaWhatsapp className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <FaTiktok className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* copyright y derechos */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-slate-500">
        <p>© 2025 Import Truck L&B. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}