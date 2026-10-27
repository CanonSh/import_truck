import { useState } from "react";
import VehicleCard from "./VehicleCard";
import { Search, Filter, Loader2, RefreshCw } from "lucide-react";

export default function VehicleCatalog({
  titulo,
  subtitulo,
  vehiculos,
  cargando,
  error,
  onRetry,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("Todas");
  const [anioSeleccionado, setAnioSeleccionado] = useState("Todos");

  const marcas = [
    ...new Set(vehiculos.map((vehiculo) => vehiculo.marca).filter(Boolean)),
  ].sort();
  const vehiculosFiltrados = vehiculos.filter((v) => {
    const textoVehiculo = [
      v.marca,
      v.modelo,
      v.tipo_vehiculo,
      v.caracteristicas,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    const coincideTexto = textoVehiculo.includes(busqueda.toLocaleLowerCase());
    const coincideMarca =
      marcaSeleccionada === "Todas" || v.marca === marcaSeleccionada;
    const anio = Number(v.anio);
    const coincideAnio =
      anioSeleccionado === "Todos" ||
      (anioSeleccionado === "2020+" && anio >= 2020) ||
      (anioSeleccionado === "2015-2019" && anio >= 2015 && anio <= 2019);

    return coincideTexto && coincideMarca && coincideAnio;
  });

  return (
    <div className="py-8 space-y-6">
      {/* encabezado */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-[#e5a93b]">
          {titulo}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">{subtitulo}</p>
      </div>

      {/* barra de busqueda y filtros responsive */}
      <div className="bg-[#0b1726]/90 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row gap-3 items-center justify-between shadow-lg">
        {/* input de busqueda */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por modelo o motor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-xs pl-9 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b] placeholder:text-slate-500"
          />
        </div>

        {/* filtros dropdown */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-[#e5a93b]" />
            <span>Filtrar:</span>
          </div>

          <select
            value={marcaSeleccionada}
            onChange={(e) => setMarcaSeleccionada(e.target.value)}
            className="w-full sm:w-auto bg-[#122238] border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b]"
          >
            <option value="Todas">Todas las marcas</option>
            {marcas.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(e.target.value)}
            className="w-full sm:w-auto bg-[#122238] border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b]"
          >
            <option value="Todos">Año (Todos)</option>
            <option value="2020+">2020 en adelante</option>
            <option value="2015-2019">2015 a 2019</option>
          </select>
        </div>
      </div>

      {/* grid de tarjetas (1 col en cel, 2 en sm, 3 en md, 4/5 en lg) */}
      {cargando ? (
        <p
          role="status"
          className="flex items-center justify-center gap-2 py-16 text-[#e5a93b]"
        >
          <Loader2 className="h-5 w-5 animate-spin" /> Cargando catálogo...
        </p>
      ) : error ? (
        <div role="alert" className="space-y-3 py-12 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#e5a93b] hover:text-[#f5b84c]"
          >
            <RefreshCw className="h-4 w-4" /> Reintentar
          </button>
        </div>
      ) : vehiculosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full h-auto">
          {vehiculosFiltrados.map((v) => (
            <VehicleCard key={v.id_vehiculo} vehiculo={v} />
          ))}
        </div>
      ) : (
        <p
          role="status"
          className="text-center py-12 bg-[#0b1726]/40 rounded-xl border border-dashed border-slate-800 text-slate-400 text-sm"
        >
          {vehiculos.length === 0
            ? "No hay vehículos en este catálogo."
            : "No se encontraron vehículos que coincidan con la búsqueda."}
        </p>
      )}
    </div>
  );
}
