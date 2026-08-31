import { Truck, Trash2, ShieldCheck, Clock } from 'lucide-react';

const SERVICIOS_ALQUILER = [
  {
    titulo: 'Camiones de Volteo',
    descripcion: 'Alquiler para transporte de ripio, tierra, selecto y materiales de construcción.',
    icono: Truck,
  },
  {
    titulo: 'Transporte de Carga Pesada',
    descripcion: 'Movilización de maquinaria y carga sobredimensionada a nivel nacional.',
    icono: ShieldCheck,
  },
  {
    titulo: 'Servicio de Camión Basurero',
    descripcion: 'Gestión de desechos industriales y comerciales con contratos por viaje o mensual.',
    icono: Trash2,
  },
];

export default function Alquiler() {
  return (
    <div className="py-8 space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-black text-[#e5a93b]">ALQUILER DE TRANSPORTE DE CARGA</h1>
        <p className="text-slate-400 text-sm">Soluciones logísticas ajustadas a las necesidades de tu empresa o proyecto.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SERVICIOS_ALQUILER.map((s, idx) => {
          const Icon = s.icono;
          return (
            <div key={idx} className="bg-[#0b1726]/90 border border-[#b8860b]/40 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <Icon className="w-10 h-10 text-[#e5a93b] mb-4" />
                <h3 className="font-bold text-lg text-white mb-2">{s.titulo}</h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-6">{s.descripcion}</p>
              </div>
              <button className="w-full bg-[#e5a93b] hover:bg-[#f5b84c] text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors">
                Cotizar servicio
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-[#122238] p-6 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-[#e5a93b]" />
          <div>
            <h4 className="font-bold text-white text-sm">¿Necesitas un servicio por contrato especial?</h4>
            <p className="text-xs text-slate-400">Atendemos proyectos de construcción y logística continua.</p>
          </div>
        </div>
        <button className="bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs hover:bg-amber-400 shrink-0">
          Contactar con un asesor
        </button>
      </div>
    </div>
  );
}