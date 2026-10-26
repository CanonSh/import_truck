import { useRef, useState } from "react";
import {
  Truck,
  Trash2,
  ShieldCheck,
  Clock,
  Loader2,
  Send,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";

const SERVICIOS_ALQUILER = [
  {
    titulo: "Camiones de Volteo",
    descripcion:
      "Alquiler para transporte de ripio, tierra, selecto y materiales de construcción.",
    icono: Truck,
  },
  {
    titulo: "Transporte de Carga Pesada",
    descripcion:
      "Movilización de maquinaria y carga sobredimensionada a nivel nacional.",
    icono: ShieldCheck,
  },
  {
    titulo: "Servicio de Camión Basurero",
    descripcion:
      "Gestión de desechos industriales y comerciales con contratos por viaje o mensual.",
    icono: Trash2,
  },
];

const FORMULARIO_INICIAL = {
  nombre_cliente: "",
  correo_cliente: "",
  telefono_cliente: "",
  requerimiento: "",
};

export default function Alquiler() {
  const [form, setForm] = useState(FORMULARIO_INICIAL);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(
    SERVICIOS_ALQUILER[0].titulo,
  );
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const envioEnCurso = useRef(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    setEnviado(false);
    setErrorEnvio("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (envioEnCurso.current) return;

    if (
      !form.nombre_cliente.trim() ||
      !form.correo_cliente.trim() ||
      !form.telefono_cliente.trim() ||
      !form.requerimiento.trim()
    ) {
      setErrorEnvio("Completa todos los campos para solicitar la cotización.");
      return;
    }

    envioEnCurso.current = true;
    setEnviando(true);
    setEnviado(false);
    setErrorEnvio("");

    try {
      const response = await api.post("/public/cotizaciones", {
        nombre_cliente: form.nombre_cliente.trim(),
        correo_cliente: form.correo_cliente.trim(),
        telefono_cliente: form.telefono_cliente.trim(),
        requerimiento: `Servicio solicitado: ${servicioSeleccionado}\n\n${form.requerimiento.trim()}`,
      });

      if (response.status !== 201) {
        throw new Error("No se pudo confirmar la solicitud. Intenta de nuevo.");
      }

      setEnviado(true);
      setForm(FORMULARIO_INICIAL);
    } catch (error) {
      const detalles = error.response?.data?.detalles
        ?.map((detalle) => detalle.mensaje)
        .join(" ");
      setErrorEnvio(
        detalles ||
          error.response?.data?.error ||
          error.message ||
          "Error al enviar la solicitud. Intenta de nuevo.",
      );
    } finally {
      envioEnCurso.current = false;
      setEnviando(false);
    }
  };

  return (
    <div className="py-8 space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-black text-[#e5a93b]">
          ALQUILER DE TRANSPORTE DE CARGA
        </h1>
        <p className="text-slate-400 text-sm">
          Soluciones logísticas ajustadas a las necesidades de tu empresa o
          proyecto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SERVICIOS_ALQUILER.map((s, idx) => {
          const Icon = s.icono;
          return (
            <div
              key={idx}
              className="bg-[#0b1726]/90 border border-[#b8860b]/40 rounded-xl p-6 flex flex-col justify-between"
            >
              <div>
                <Icon className="w-10 h-10 text-[#e5a93b] mb-4" />
                <h3 className="font-bold text-lg text-white mb-2">
                  {s.titulo}
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-6">
                  {s.descripcion}
                </p>
              </div>
              <a
                href="#cotizacion"
                onClick={() => setServicioSeleccionado(s.titulo)}
                className="w-full bg-[#e5a93b] hover:bg-[#f5b84c] text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors text-center"
              >
                Cotizar servicio
              </a>
            </div>
          );
        })}
      </div>

      <div className="bg-[#122238] p-6 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-[#e5a93b]" />
          <div>
            <h4 className="font-bold text-white text-sm">
              ¿Necesitas un servicio por contrato especial?
            </h4>
            <p className="text-xs text-slate-400">
              Atendemos proyectos de construcción y logística continua.
            </p>
          </div>
        </div>
        <a
          href="#cotizacion"
          className="bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs hover:bg-amber-400 shrink-0"
        >
          Contactar con un asesor
        </a>
      </div>

      <section
        id="cotizacion"
        className="bg-[#0b1726]/90 border border-[#b8860b]/40 rounded-xl p-6 sm:p-8"
      >
        <div className="border-b border-slate-800 pb-4 mb-6">
          <h2 className="text-2xl font-black text-[#e5a93b]">
            SOLICITAR COTIZACIÓN
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Cuéntanos qué servicio necesitas y nos pondremos en contacto.
          </p>
        </div>

        {enviado && (
          <p
            role="status"
            className="mb-5 flex items-center gap-2 text-sm text-green-400"
          >
            <CheckCircle className="w-5 h-5" /> Solicitud enviada correctamente.
          </p>
        )}

        {errorEnvio && (
          <p role="alert" className="mb-5 text-sm text-red-400">
            {errorEnvio}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nombre_cliente"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Nombre completo
              </label>
              <input
                id="nombre_cliente"
                name="nombre_cliente"
                type="text"
                maxLength={100}
                value={form.nombre_cliente}
                onChange={handleChange}
                required
                className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-sm p-3 rounded-lg focus:outline-none focus:border-[#e5a93b]"
              />
            </div>
            <div>
              <label
                htmlFor="correo_cliente"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Correo electrónico
              </label>
              <input
                id="correo_cliente"
                name="correo_cliente"
                type="email"
                maxLength={100}
                value={form.correo_cliente}
                onChange={handleChange}
                required
                className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-sm p-3 rounded-lg focus:outline-none focus:border-[#e5a93b]"
              />
            </div>
            <div>
              <label
                htmlFor="telefono_cliente"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Teléfono
              </label>
              <input
                id="telefono_cliente"
                name="telefono_cliente"
                type="tel"
                maxLength={15}
                value={form.telefono_cliente}
                onChange={handleChange}
                required
                className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-sm p-3 rounded-lg focus:outline-none focus:border-[#e5a93b]"
              />
            </div>
            <div>
              <label
                htmlFor="servicioSeleccionado"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Servicio de interés
              </label>
              <select
                id="servicioSeleccionado"
                value={servicioSeleccionado}
                onChange={(event) =>
                  setServicioSeleccionado(event.target.value)
                }
                className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-sm p-3 rounded-lg focus:outline-none focus:border-[#e5a93b]"
              >
                {SERVICIOS_ALQUILER.map((servicio) => (
                  <option key={servicio.titulo} value={servicio.titulo}>
                    {servicio.titulo}
                  </option>
                ))}
                <option value="Contrato especial">Contrato especial</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="requerimiento"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Detalles de la solicitud
            </label>
            <textarea
              id="requerimiento"
              name="requerimiento"
              rows="4"
              value={form.requerimiento}
              onChange={handleChange}
              required
              className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-sm p-3 rounded-lg focus:outline-none focus:border-[#e5a93b] resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="bg-[#e5a93b] hover:bg-[#f5b84c] disabled:opacity-60 text-slate-950 font-bold px-6 py-3 rounded-lg text-sm transition-colors inline-flex items-center justify-center gap-2"
          >
            {enviando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {enviando ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      </section>
    </div>
  );
}
