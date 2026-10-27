import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import VehicleImage from "./VehicleImage";
import { getVehicleTitle } from "../services/vehicles";

export default function VehicleCard({ vehiculo }) {
  const precio = Number(vehiculo.precio);
  const precioDisponible =
    vehiculo.precio !== null &&
    vehiculo.precio !== undefined &&
    vehiculo.precio !== "" &&
    Number.isFinite(precio);
  const titulo = getVehicleTitle(vehiculo);

  return (
    <article className="bg-[#0b1726]/90 border border-[#b8860b]/40 rounded-xl overflow-hidden flex flex-col justify-between p-3.5 shadow-lg hover:border-[#e5a93b] transition-all">
      <VehicleImage
        imagePath={vehiculo.imagen_url}
        alt={titulo || "Vehículo"}
        className="h-64 rounded-lg mb-3 border border-slate-800"
      />

      <div>
        <h3 className="font-bold text-sm text-white mb-2 leading-tight min-h-[40px] flex items-center">
          {titulo || "Vehículo"}
        </h3>
        {vehiculo.tipo_vehiculo && (
          <p className="text-xs text-slate-400 mb-2">
            {vehiculo.tipo_vehiculo}
          </p>
        )}
        {vehiculo.caracteristicas && (
          <p className="text-xs text-slate-300 mb-3 line-clamp-3">
            {vehiculo.caracteristicas}
          </p>
        )}
        {vehiculo.estado && (
          <p className="text-xs text-slate-400 mb-3">
            Estado: {vehiculo.estado}
          </p>
        )}
      </div>

      <div>
        {precioDisponible && (
          <p className="text-[#e5a93b] font-black text-xl mb-3 text-right">
            ${precio.toLocaleString("en-US")}
          </p>
        )}
        <Link
          to={`/vehiculos/${encodeURIComponent(vehiculo.id_vehiculo)}`}
          className="w-full bg-[#e5a93b] hover:bg-[#f5b84c] text-slate-950 font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
        >
          Ver detalles <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
