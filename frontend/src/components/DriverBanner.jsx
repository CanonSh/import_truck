import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle,
  Loader2,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const FORMULARIO_INICIAL = {
  nombre_candidato: "",
  correo_candidato: "",
  telefono_candidato: "",
  experiencia: "",
};

export default function DriverBanner({ permitirPostular = false }) {
  const [vacantes, setVacantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [reintento, setReintento] = useState(0);
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);
  const [form, setForm] = useState(FORMULARIO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [errorPostulacion, setErrorPostulacion] = useState("");
  const [postulacionExitosa, setPostulacionExitosa] = useState(null);
  const envioEnCurso = useRef(false);

  const seleccionarVacante = (vacanteId) => {
    setVacanteSeleccionada(vacanteId);
    setForm(FORMULARIO_INICIAL);
    setErrorPostulacion("");
    setPostulacionExitosa(null);
  };

  const handleChange = (event) => {
    setForm((actual) => ({
      ...actual,
      [event.target.name]: event.target.value,
    }));
    setErrorPostulacion("");
  };

  const handleSubmit = async (event, vacanteId) => {
    event.preventDefault();
    if (envioEnCurso.current) return;

    envioEnCurso.current = true;
    setEnviando(true);
    setErrorPostulacion("");

    try {
      const response = await api.post("/public/postular", {
        id_vacante: vacanteId,
        nombre_candidato: form.nombre_candidato.trim(),
        correo_candidato: form.correo_candidato.trim(),
        telefono_candidato: form.telefono_candidato.trim(),
        experiencia: form.experiencia.trim(),
      });

      if (response.status !== 201) {
        throw new Error(
          "No se pudo confirmar la postulación. Intenta de nuevo.",
        );
      }

      setPostulacionExitosa(vacanteId);
      setForm(FORMULARIO_INICIAL);
    } catch (error) {
      const detalles = error.response?.data?.detalles
        ?.map((detalle) => detalle.mensaje)
        .join(" ");
      setErrorPostulacion(
        detalles ||
          error.response?.data?.error ||
          error.message ||
          "Error al enviar la postulación. Intenta de nuevo.",
      );
    } finally {
      envioEnCurso.current = false;
      setEnviando(false);
    }
  };

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
                  {permitirPostular &&
                    postulacionExitosa !== vacante.id_vacante && (
                      <button
                        type="button"
                        onClick={() => seleccionarVacante(vacante.id_vacante)}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#e5a93b] hover:text-[#f5b84c]"
                      >
                        <Send className="w-4 h-4" />
                        {vacanteSeleccionada === vacante.id_vacante
                          ? "Postulación seleccionada"
                          : "Postular a esta vacante"}
                      </button>
                    )}
                  {permitirPostular &&
                    vacanteSeleccionada === vacante.id_vacante &&
                    (postulacionExitosa === vacante.id_vacante ? (
                      <p
                        role="status"
                        className="mt-3 flex items-center gap-2 text-sm text-green-400"
                      >
                        <CheckCircle className="w-4 h-4" /> Postulación recibida
                        correctamente.
                      </p>
                    ) : (
                      <form
                        onSubmit={(event) =>
                          handleSubmit(event, vacante.id_vacante)
                        }
                        className="mt-4 space-y-3 border-t border-slate-800 pt-4"
                      >
                        <div>
                          <label
                            htmlFor={`nombre-${vacante.id_vacante}`}
                            className="mb-1 block text-xs font-semibold text-slate-300"
                          >
                            Nombre completo
                          </label>
                          <input
                            id={`nombre-${vacante.id_vacante}`}
                            name="nombre_candidato"
                            value={form.nombre_candidato}
                            onChange={handleChange}
                            maxLength={100}
                            required
                            className="w-full rounded-lg border border-slate-700 bg-[#0b1726] p-2.5 text-sm text-slate-200 focus:border-[#e5a93b] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`correo-${vacante.id_vacante}`}
                            className="mb-1 block text-xs font-semibold text-slate-300"
                          >
                            Correo electrónico
                          </label>
                          <input
                            id={`correo-${vacante.id_vacante}`}
                            name="correo_candidato"
                            type="email"
                            value={form.correo_candidato}
                            onChange={handleChange}
                            maxLength={100}
                            required
                            className="w-full rounded-lg border border-slate-700 bg-[#0b1726] p-2.5 text-sm text-slate-200 focus:border-[#e5a93b] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`telefono-${vacante.id_vacante}`}
                            className="mb-1 block text-xs font-semibold text-slate-300"
                          >
                            Teléfono
                          </label>
                          <input
                            id={`telefono-${vacante.id_vacante}`}
                            name="telefono_candidato"
                            type="tel"
                            value={form.telefono_candidato}
                            onChange={handleChange}
                            maxLength={15}
                            required
                            className="w-full rounded-lg border border-slate-700 bg-[#0b1726] p-2.5 text-sm text-slate-200 focus:border-[#e5a93b] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`experiencia-${vacante.id_vacante}`}
                            className="mb-1 block text-xs font-semibold text-slate-300"
                          >
                            Experiencia
                          </label>
                          <textarea
                            id={`experiencia-${vacante.id_vacante}`}
                            name="experiencia"
                            value={form.experiencia}
                            onChange={handleChange}
                            rows={3}
                            required
                            className="w-full resize-y rounded-lg border border-slate-700 bg-[#0b1726] p-2.5 text-sm text-slate-200 focus:border-[#e5a93b] focus:outline-none"
                          />
                        </div>
                        {errorPostulacion && (
                          <p role="alert" className="text-sm text-red-400">
                            {errorPostulacion}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={enviando}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#e5a93b] px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-[#f5b84c] disabled:opacity-60"
                          >
                            {enviando ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            {enviando ? "Enviando..." : "Enviar postulación"}
                          </button>
                          <button
                            type="button"
                            disabled={enviando}
                            onClick={() => seleccionarVacante(null)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-60"
                          >
                            <X className="h-4 w-4" /> Cancelar
                          </button>
                        </div>
                      </form>
                    ))}
                </div>
              </div>
            </article>
          ))}

        {!permitirPostular && (
          <div className="border-t border-slate-800 pt-4 text-xs text-slate-400">
            <Link
              to="/vacantes"
              className="font-semibold text-[#e5a93b] hover:text-[#f5b84c]"
            >
              Consulta las vacantes y postúlate en esta sección.
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
