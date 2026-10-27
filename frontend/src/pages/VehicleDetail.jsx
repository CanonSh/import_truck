import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, RefreshCw } from "lucide-react";
import VehicleImage from "../components/VehicleImage";
import { getVehicleById, getVehicleTitle } from "../services/vehicles";

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehiculo, setVehiculo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [reintento, setReintento] = useState(0);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError("");

    getVehicleById(id)
      .then((data) => {
        if (activo) setVehiculo(data);
      })
      .catch((requestError) => {
        if (activo) {
          setError(
            requestError.response?.data?.error ||
              requestError.message ||
              "No fue posible cargar el vehículo.",
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [id, reintento]);

  if (cargando) {
    return (
      <p
        role="status"
        className="flex items-center justify-center gap-2 py-20 text-[#e5a93b]"
      >
        <Loader2 className="h-5 w-5 animate-spin" /> Cargando vehículo...
      </p>
    );
  }

  if (error) {
    return (
      <div role="alert" className="py-16 text-center">
        <p className="text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => setReintento((actual) => actual + 1)}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#e5a93b]"
        >
          <RefreshCw className="h-4 w-4" /> Reintentar
        </button>
      </div>
    );
  }

  if (!vehiculo) return null;

  const precio = Number(vehiculo.precio);
  const precioDisponible =
    vehiculo.precio !== null &&
    vehiculo.precio !== undefined &&
    vehiculo.precio !== "" &&
    Number.isFinite(precio);
  const nombre = getVehicleTitle(vehiculo);

  return (
    <article className="py-8">
      <Link
        to="/vehiculos"
        className="mb-5 inline-flex text-sm font-semibold text-[#e5a93b] hover:text-[#f5b84c]"
      >
        Volver al inventario
      </Link>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <VehicleImage
          imagePath={vehiculo.imagen_url}
          alt={nombre || "Vehículo"}
          className="min-h-72 rounded-xl border border-slate-800 lg:min-h-[480px]"
        />
        <div className="space-y-5">
          <div className="border-b border-slate-800 pb-4">
            {vehiculo.tipo_vehiculo && (
              <p className="mb-2 text-sm text-slate-400">
                {vehiculo.tipo_vehiculo}
              </p>
            )}
            <h1 className="text-3xl font-black text-white">
              {nombre || "Vehículo"}
            </h1>
          </div>
          {precioDisponible && (
            <p className="text-2xl font-black text-[#e5a93b]">
              ${precio.toLocaleString("en-US")}
            </p>
          )}
          {vehiculo.estado && (
            <p className="text-sm text-slate-300">Estado: {vehiculo.estado}</p>
          )}
          {vehiculo.caracteristicas && (
            <section>
              <h2 className="mb-2 text-sm font-bold text-white">
                Características
              </h2>
              <p className="whitespace-pre-line text-sm text-slate-300">
                {vehiculo.caracteristicas}
              </p>
            </section>
          )}
          <Link
            to={`/contacto/${encodeURIComponent("Compra de vehículo")}`}
            className="inline-flex items-center justify-center rounded-lg bg-[#e5a93b] px-5 py-3 text-sm font-bold text-slate-950 hover:bg-[#f5b84c]"
          >
            Solicitar cotización
          </Link>
        </div>
      </div>
    </article>
  );
}
