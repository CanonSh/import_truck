import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

export default function DriverBanner() {
  const [vacantes, setVacantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [reintento, setReintento] = useState(0);

  useEffect(() => {
    let activo = true;

    const cargarVacantes = async () => {
      setCargando(true);
      setErrorCarga("");

      try {
        const respuesta = await api.get("/public/vacantes");
        if (activo)
          setVacantes(Array.isArray(respuesta.data) ? respuesta.data : []);
      } catch (error) {
        if (activo) {
          setErrorCarga(
            error.response?.data?.error ||
              "No fue posible cargar las vacantes. Intenta de nuevo.",
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarVacantes();
    return () => {
      activo = false;
    };
  }, [reintento]);

  return (
    <section className="bg-[#0b1726]/90 border border-[#b8860b]/50 rounded-2xl p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 my-8 shadow-2xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#e5a93b] leading-tight mb-1">
          VACANTES PARA CONDUCTORES
        </h2>
        <p className="text-base sm:text-lg font-bold text-white mb-3">
          ÚNETE A NUESTRO EQUIPO
        </p>
        <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
          Buscamos conductores responsables y comprometidos. Consulta las
          oportunidades disponibles.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-200">
          <div className="bg-[#122238] p-3 rounded-lg border border-slate-800 flex items-center gap-2">
            Trabajo temporal y fijo
          </div>
          <div className="bg-[#122238] p-3 rounded-lg border border-slate-800 flex items-center gap-2">
            Buen ambiente laboral
          </div>
          <div className="bg-[#122238] p-3 rounded-lg border border-slate-800 flex items-center gap-2">
            Pagos puntuales
          </div>
          <div className="bg-[#122238] p-3 rounded-lg border border-slate-800 flex items-center gap-2">
            Capacitación continua
          </div>
        </div>
      </div>

      <div className="bg-[#050b14]/80 p-4 sm:p-5 rounded-xl border border-slate-800 flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-slate-100 text-sm">VACANTES ACTIVAS</h3>
          <p className="text-xs text-slate-400 mt-1">
            Oportunidades disponibles actualmente.
          </p>
        </div>

        {cargando && (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-slate-300"
          >
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando vacantes...
          </p>
        )}

        {!cargando && errorCarga && (
          <div role="alert" className="space-y-3">
            <p className="text-sm text-red-400">{errorCarga}</p>
            <button
              type="button"
              onClick={() => setReintento((actual) => actual + 1)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#e5a93b] hover:text-[#f5b84c]"
            >
              <RefreshCw className="w-4 h-4" /> Reintentar
            </button>
          </div>
        )}

        {!cargando && !errorCarga && vacantes.length === 0 && (
          <p role="status" className="text-sm text-slate-400">
            No hay vacantes activas en este momento.
          </p>
        )}

        {!cargando &&
          !errorCarga &&
          vacantes.map((vacante) => (
            <article
              key={vacante.id_vacante}
              className="border-t border-slate-800 pt-4"
            >
              <div className="flex items-start gap-3">
                <BriefcaseBusiness className="w-5 h-5 text-[#e5a93b] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {vacante.titulo_puesto}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 whitespace-pre-line">
                    {vacante.descripcion_puesto}
                  </p>
                  {vacante.fecha_publicacion && (
                    <p className="text-xs text-slate-500 mt-2">
                      Publicada:{" "}
                      {new Date(vacante.fecha_publicacion).toLocaleDateString(
                        "es-SV",
                      )}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}

        <div className="border-t border-slate-800 pt-4 flex items-start gap-2 text-xs text-slate-400">
          <CheckCircle className="w-4 h-4 shrink-0 text-[#e5a93b]" />
          <p>La recepción de postulaciones en línea aún no está disponible.</p>
        </div>
      </div>
    </section>
  );
}
