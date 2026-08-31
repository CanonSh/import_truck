import CategoryCard from '../components/CategoryCard';
import VehicleCard from '../components/VehicleCard';
import DriverBanner from '../components/DriverBanner';
import { Send, Truck, Car, Key, Wrench } from 'lucide-react';

const VEHICULOS = [
  { id: 1, titulo: 'Freightliner Cascadia 2018', motor: 'Detroit DD15', transmision: 'Automático', recorrido: '600,000 millas', precio: '42,500' },
  { id: 2, titulo: 'Mack Granite Volteo 2017', motor: 'Mack MP8', transmision: 'Manual 10 vel.', recorrido: '450,000 millas', precio: '58,000' },
  { id: 3, titulo: 'Isuzu NPR 2019', motor: '5.2L Diesel', transmision: 'Manual', recorrido: '220,000 km', precio: '32,900' },
  { id: 4, titulo: 'Kenworth T800 Volteo 2016', motor: 'Cummins ISX', transmision: 'Manual 18 vel.', recorrido: '520,000 millas', precio: '66,500' },
  { id: 5, titulo: 'Hino 500 Volteo 2020', motor: 'J08E', transmision: 'Manual', recorrido: '180,000 km', precio: '47,900' },
];

export default function Home() {
  return (
    <div className="py-6 space-y-10">
      {/* Banner */}
      <section className="relative rounded-2xl p-8 border border-[#b8860b]/30 bg-gradient-to-r from-[#0b1726] to-[#050b14] overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="max-w-xl z-10">
          <h1 className="text-4xl font-black text-[#e5a93b] tracking-wide mb-1">IMPORT TRUCK L&B</h1>
          <p className="text-lg font-bold text-white mb-2">Importación y venta de camiones y vehículos</p>
          <p className="text-slate-300 text-sm mb-6">Soluciones en transporte para tu negocio.</p>
          
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col items-center gap-1 text-xs text-slate-300"><Truck className="w-5 h-5 text-[#e5a93b]"/> VENTA</div>
            <div className="flex flex-col items-center gap-1 text-xs text-slate-300"><Car className="w-5 h-5 text-[#e5a93b]"/> CARROS</div>
            <div className="flex flex-col items-center gap-1 text-xs text-slate-300"><Key className="w-5 h-5 text-[#e5a93b]"/> ALQUILER</div>
            <div className="flex flex-col items-center gap-1 text-xs text-slate-300"><Wrench className="w-5 h-5 text-[#e5a93b]"/> SERVICIOS</div>
          </div>

          <button className="bg-[#e5a93b] hover:bg-[#f5b84c] text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2">
            Ver inventario completo <Send className="w-4 h-4 fill-slate-950"/>
          </button>
        </div>
        <div className="w-full md:w-1/2 h-56 bg-[#122238] rounded-xl flex items-center justify-center text-slate-500 text-xs mt-6 md:mt-0 border border-slate-800">
          [ Imagen Principal del Camión ]
        </div>
      </section>

      {/*Servicios Principales */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CategoryCard 
          titulo="VENTA DE CAMIONES" 
          subtitulo="Camiones de todas las marcas y modelos."
          items={["Unidades importadas", "Precios competitivos", "Financiamiento disponible"]}
          botonTexto="Ver camiones"
        />
        <CategoryCard 
          titulo="VENTA DE CARROS" 
          subtitulo="Vehículos para uso personal o trabajo."
          items={["Amplia variedad", "Excelentes condiciones", "Listos para entregar"]}
          botonTexto="Ver carros"
        />
        <CategoryCard 
          titulo="ALQUILER DE TRANSPORTE" 
          subtitulo="Soluciones de transporte de carga para tu empresa."
          items={["Camiones de volteo", "Transporte de carga pesada", "Servicio de camión basurero"]}
          botonTexto="Ver servicios"
        />
      </section>

      {/* Vehiculos Destacados */}
        <section>
            <h2 className="text-xl md:text-2xl font-black text-center text-white tracking-wider mb-6">
                VEHÍCULOS DESTACADOS
            </h2>
  
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {VEHICULOS.map(v => <VehicleCard key={v.id} {...v} />)}
            </div>
  
            <div className="text-center mt-6">
                <button className="w-full sm:w-auto bg-[#e5a93b] hover:bg-[#f5b84c] text-slate-950 font-bold px-8 py-2.5 rounded-lg text-xs transition-colors inline-flex items-center justify-center gap-2">
                    Ver más vehículos <Send className="w-3.5 h-3.5 fill-slate-950" />
                </button>
            </div>
        </section>

      {/* Banner Conductores */}
      <DriverBanner />
    </div>
  );
}