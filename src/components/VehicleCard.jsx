import { Fuel, Settings, Gauge, Send } from 'lucide-react';

export default function VehicleCard({ titulo, motor, transmision, recorrido, precio, img }) {
  return (
    <div className="bg-[#0b1726]/90 border border-[#b8860b]/40 rounded-xl overflow-hidden flex flex-col justify-between p-3.5 shadow-lg hover:border-[#e5a93b] transition-all h-auto w-auto">
      <div className="bg-[#122238]  rounded-lg mb-3 flex items-center justify-center text-slate-500 text-xs font-medium border border-slate-800 h-80  w-auto">
        <img src={img} alt={titulo} className="w-full h-full object-cover" />
      </div>

      <div>
        <h3 className="font-bold text-sm text-white mb-2 leading-tight min-h-[40px] flex items-center">{titulo}</h3>
        
        <ul className="text-[11px] text-slate-300 space-y-1.5 mb-4">
          <li className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5 text-[#e5a93b]" /> Motor: {motor}</li>
          <li className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-[#e5a93b]" /> {transmision}</li>
          <li className="flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5 text-[#e5a93b]" /> {recorrido}</li>
        </ul>
      </div>

      <div>
        <p className="text-[#e5a93b] font-black text-xl mb-3 text-right">${precio}</p>
        <button className="w-full bg-[#e5a93b] hover:bg-[#f5b84c] text-slate-950 font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-2">
          Ver detalles <Send className="w-3 h-3 fill-slate-950" />
        </button>
      </div>
    </div>
  );
}