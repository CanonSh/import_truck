import { useState } from 'react';
import { Send } from 'lucide-react';

export default function DriverBanner() {
  const [form, setForm] = useState({ nombre: '', telefono: '', correo: '', ciudad: '', tipo: 'Ambos' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <section className="bg-[#0b1726]/90 border-2 border-red-600/90 rounded-2xl p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 my-8 shadow-2xl">
      {/* Columna izquierda */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#e5a93b] leading-tight mb-1">
          VACANTES PARA CONDUCTORES
        </h2>
        <p className="text-base sm:text-lg font-bold text-white mb-3">ÚNETE A NUESTRO EQUIPO</p>
        <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
          Buscamos conductores responsables y comprometidos. Ofrecemos trabajo temporal y fijo con excelentes beneficios y un ambiente de trabajo seguro.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-200">
          <div className="bg-[#122238] p-3 rounded-lg border border-slate-800 flex items-center gap-2">🚚 Trabajo temporal y fijo</div>
          <div className="bg-[#122238] p-3 rounded-lg border border-slate-800 flex items-center gap-2">🤝 Buen ambiente laboral</div>
          <div className="bg-[#122238] p-3 rounded-lg border border-slate-800 flex items-center gap-2">💰 Pagos puntuales</div>
          <div className="bg-[#122238] p-3 rounded-lg border border-slate-800 flex items-center gap-2">📈 Capacitación continua</div>
        </div>
      </div>

      {/* Columna derecha formulario */}
      <form onSubmit={(e) => e.preventDefault()} className="bg-[#050b14]/80 p-4 sm:p-5 rounded-xl border border-slate-800 flex flex-col gap-3">
        <h3 className="font-bold text-slate-100 text-sm">ENVÍA TU CURRÍCULUM</h3>
        <p className="text-xs text-slate-400 -mt-2 mb-1">Completa el formulario y nos pondremos en contacto.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" name="nombre" placeholder="Nombre completo" className="bg-[#0b1726] border border-slate-700 text-xs p-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b]" onChange={handleChange} />
          <input type="text" name="telefono" placeholder="Teléfono / WhatsApp" className="bg-[#0b1726] border border-slate-700 text-xs p-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b]" onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="email" name="correo" placeholder="Correo electrónico" className="bg-[#0b1726] border border-slate-700 text-xs p-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b]" onChange={handleChange} />
          <input type="text" name="ciudad" placeholder="Ciudad" className="bg-[#0b1726] border border-slate-700 text-xs p-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b]" onChange={handleChange} />
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-300 py-1">
          <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="tipo" value="Trabajo fijo" onChange={handleChange} /> Fijo</label>
          <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="tipo" value="Trabajo temporal" onChange={handleChange} /> Temporal</label>
          <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="tipo" value="Ambos" defaultChecked onChange={handleChange} /> Ambos</label>
        </div>

        <button className="w-full bg-[#e5a93b] hover:bg-[#f5b84c] text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 mt-1">
          Enviar mi currículum <Send className="w-3.5 h-3.5 fill-slate-950" />
        </button>
      </form>
    </section>
  );
}