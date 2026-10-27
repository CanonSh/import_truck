import CategoryCard from "../components/CategoryCard";
import VehicleCard from "../components/VehicleCard";
import DriverBanner from "../components/DriverBanner";
import { Link } from "react-router-dom";
import {
  Send,
  Truck,
  Car,
  Key,
  Wrench,
  Loader2,
  RefreshCw,
} from "lucide-react";
import useVehicles from "../hooks/useVehicles";

export default function Home() {
  const { vehicles, loading, error, retry } = useVehicles();
  const destacados = vehicles.slice(0, 4);

  return (
    <div className="py-6 space-y-10">
      {/* Banner */}
      <section className="relative rounded-2xl p-8 border border-[#b8860b]/30 bg-gradient-to-r from-[#0b1726] to-[#050b14] overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="max-w-xl z-10">
          <h1 className="text-4xl font-black text-[#e5a93b] tracking-wide mb-1">
            IMPORT TRUCK L&B
          </h1>
          <p className="text-lg font-bold text-white mb-2">
            Importación y venta de camiones y vehículos
          </p>
          <p className="text-slate-300 text-sm mb-6">
            Soluciones en transporte para tu negocio.
          </p>

          <div className="flex gap-4 mb-6">
            <div className="flex flex-col items-center gap-1 text-xs text-slate-300">
              <Truck className="w-5 h-5 text-[#e5a93b]" /> VENTA
            </div>
            <div className="flex flex-col items-center gap-1 text-xs text-slate-300">
              <Car className="w-5 h-5 text-[#e5a93b]" /> CARROS
            </div>
            <div className="flex flex-col items-center gap-1 text-xs text-slate-300">
              <Key className="w-5 h-5 text-[#e5a93b]" /> ALQUILER
            </div>
            <div className="flex flex-col items-center gap-1 text-xs text-slate-300">
              <Wrench className="w-5 h-5 text-[#e5a93b]" /> SERVICIOS
            </div>
          </div>

          <Link
            to="/vehiculos"
            className="bg-[#e5a93b] hover:bg-[#f5b84c] text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            Ver inventario completo <Send className="w-4 h-4 fill-slate-950" />
          </Link>
        </div>
        <div className="w-full md:w-1/2 h-64 md:h-80 bg-[#122238] rounded-xl flex items-center justify-center overflow-hidden mt-6 md:mt-0 border border-slate-800">
          <img
            src="/images/camion-banner2.webp"
            alt="Camión de transporte"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/*Servicios Principales */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CategoryCard
          titulo="VENTA DE CAMIONES"
          subtitulo="Camiones de todas las marcas y modelos."
          items={[
            "Unidades importadas",
            "Precios competitivos",
            "Financiamiento disponible",
          ]}
          img={"/images/camiones.jpg"}
          botonTexto="Ver camiones"
          link="/camiones"
        />
        <CategoryCard
          titulo="VENTA DE CARROS"
          subtitulo="Vehículos para uso personal o trabajo."
          items={[
            "Amplia variedad",
            "Excelentes condiciones",
            "Listos para entregar",
          ]}
          img={"/images/cars.jpg"}
          botonTexto="Ver carros"
          link="/carros"
        />
        <CategoryCard
          titulo="ALQUILER DE TRANSPORTE"
          subtitulo="Soluciones de transporte de carga para tu empresa."
          items={[
            "Camiones de volteo",
            "Transporte de carga pesada",
            "Servicio de camión basurero",
          ]}
          img={"/images/renta.jpeg"}
          botonTexto="Ver servicios"
          link="/alquiler"
        />
      </section>

      {/* Vehiculos Destacados */}
      <section>
        <h2 className="text-xl md:text-2xl font-black text-center text-white tracking-wider mb-6">
          VEHÍCULOS DEL INVENTARIO
        </h2>

        {loading ? (
          <p
            role="status"
            className="flex items-center justify-center gap-2 py-12 text-[#e5a93b]"
          >
            <Loader2 className="h-5 w-5 animate-spin" /> Cargando vehículos...
          </p>
        ) : error ? (
          <div role="alert" className="py-10 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#e5a93b]"
            >
              <RefreshCw className="h-4 w-4" /> Reintentar
            </button>
          </div>
        ) : destacados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6">
            {destacados.map((vehiculo) => (
              <VehicleCard key={vehiculo.id_vehiculo} vehiculo={vehiculo} />
            ))}
          </div>
        ) : (
          <p role="status" className="py-10 text-center text-sm text-slate-400">
            No hay vehículos en el inventario.
          </p>
        )}

        <div className="text-center mt-6">
          <Link
            to="/vehiculos"
            className="w-full sm:w-auto bg-[#e5a93b] hover:bg-[#f5b84c] text-slate-950 font-bold px-8 py-2.5 rounded-lg text-xs transition-colors inline-flex items-center justify-center gap-2"
          >
            Ver inventario completo{" "}
            <Send className="w-3.5 h-3.5 fill-slate-950" />
          </Link>
        </div>
      </section>

      {/* Banner Conductores */}
      <DriverBanner />
    </div>
  );
}
