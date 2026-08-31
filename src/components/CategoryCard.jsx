import { Send } from 'lucide-react';

export default function CategoryCard({ titulo, subtitulo, items, botonTexto }) {
  return (
    <div className="bg-[#0b1726]/90 border border-[#b8860b]/50 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
      <div>
        <h3 className="font-black text-center text-base text-[#e5a93b] tracking-wide uppercase">{titulo}</h3>
        <p className="text-center text-xs text-slate-300 mb-4">{subtitulo}</p>
        
        <div className="bg-[#122238] h-32 rounded-lg mb-4 flex items-center justify-center text-slate-500 text-xs border border-slate-800">
          [ Muestra de Vehículos ]
        </div>

        <ul className="text-xs text-slate-300 space-y-1.5 mb-5 px-1">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="text-[#e5a93b]">✔</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <button className="w-full bg-[#e5a93b] hover:bg-[#f5b84c] text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2">
        {botonTexto} <Send className="w-3.5 h-3.5 fill-slate-950" />
      </button>
    </div>
  );
}