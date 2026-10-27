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
  const [tipoSeleccionado, setTipoSeleccionado] = useState("Todos");
  const [anioSeleccionado, setAnioSeleccionado] = useState("Todos");
  const [precioMinimo, setPrecioMinimo] = useState("");
  const [precioMaximo, setPrecioMaximo] = useState("");

  const marcas = [
    ...new Set(vehiculos.map((vehiculo) => vehiculo.marca).filter(Boolean)),
  ].sort();
  const tipos = [
    ...new Set(
      vehiculos.map((vehiculo) => vehiculo.tipo_vehiculo).filter(Boolean),
    ),
  ].sort();
  const anios = [
    ...new Set(
      vehiculos
        .map((vehiculo) => Number(vehiculo.anio))
        .filter(Number.isInteger),
    ),
  ].sort((a, b) => b - a);

  const vehiculosFiltrados = vehiculos.filter((v) => {
    const textoVehiculo = [v.marca, v.modelo]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    const coincideTexto = textoVehiculo.includes(busqueda.toLocaleLowerCase());
    const coincideMarca =
      marcaSeleccionada === "Todas" || v.marca === marcaSeleccionada;
    const coincideTipo =
      tipoSeleccionado === "Todos" || v.tipo_vehiculo === tipoSeleccionado;
    const anio = Number(v.anio);
    const coincideAnio =
      anioSeleccionado === "Todos" || anio === Number(anioSeleccionado);
    const precio = Number(v.precio);
    const precioDisponible = Number.isFinite(precio);
    const coincidePrecioMinimo =
      precioMinimo === "" ||
      (precioDisponible && precio >= Number(precioMinimo));
    const coincidePrecioMaximo =
      precioMaximo === "" ||
      (precioDisponible && precio <= Number(precioMaximo));

    return (
      coincideTexto &&
      coincideMarca &&
      coincideTipo &&
      coincideAnio &&
      coincidePrecioMinimo &&
      coincidePrecioMaximo
    );
  });

  const limpiarFiltros = () => {
    setBusqueda("");
    setMarcaSeleccionada("Todas");
    setTipoSeleccionado("Todos");
    setAnioSeleccionado("Todos");
    setPrecioMinimo("");
    setPrecioMaximo("");
  };

  return (
    <div className="py-8 space-y-6">
      {/* encabezado */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-[#e5a93b]">
          {titulo}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">{subtitulo}</p>
      </div>

      <div className="bg-[#0b1726]/90 p-4 rounded-xl border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 shadow-lg">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Buscar por marca o modelo"
            placeholder="Buscar por marca o modelo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-xs pl-9 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b] placeholder:text-slate-500"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="h-4 w-4 shrink-0 text-[#e5a93b]" />
          <select
            aria-label="Filtrar por tipo"
            value={tipoSeleccionado}
            onChange={(event) => setTipoSeleccionado(event.target.value)}
            className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b]"
          >
            <option value="Todos">Todos los tipos</option>
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </label>

        <select
          aria-label="Filtrar por marca"
          value={marcaSeleccionada}
          onChange={(event) => setMarcaSeleccionada(event.target.value)}
          className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b]"
        >
          <option value="Todas">Todas las marcas</option>
          {marcas.map((marca) => (
            <option key={marca} value={marca}>
              {marca}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por año"
          value={anioSeleccionado}
          onChange={(event) => setAnioSeleccionado(event.target.value)}
          className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b]"
        >
          <option value="Todos">Todos los años</option>
          {anios.map((anio) => (
            <option key={anio} value={String(anio)}>
              {anio}
            </option>
          ))}
        </select>

        <label className="space-y-1 text-xs text-slate-400">
          Precio mínimo
          <input
            aria-label="Precio mínimo"
            type="number"
            step="0.01"
            value={precioMinimo}
            onChange={(event) => setPrecioMinimo(event.target.value)}
            className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b]"
          />
        </label>

        <label className="space-y-1 text-xs text-slate-400">
          Precio máximo
          <input
            aria-label="Precio máximo"
            type="number"
            step="0.01"
            value={precioMaximo}
            onChange={(event) => setPrecioMaximo(event.target.value)}
            className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#e5a93b]"
          />
        </label>

        <button
          type="button"
          onClick={limpiarFiltros}
          className="self-end rounded-lg border border-slate-700 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 sm:col-span-2 lg:col-span-3 lg:justify-self-end"
        >
          Limpiar filtros
        </button>
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
