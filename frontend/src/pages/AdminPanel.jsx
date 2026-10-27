import { useEffect, useState } from "react";
import { Loader2, LogOut, RefreshCw } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import VehicleManager from "../components/VehicleManager";
import VacancyManager from "../components/VacancyManager";

const SECCIONES = {
  cotizaciones: {
    label: "Cotizaciones",
    endpoint: "/admin/cotizaciones",
    id: "id_cotizacion",
  },
  mensajes: {
    label: "Mensajes",
    endpoint: "/admin/mensajes",
    id: "id_mensaje",
  },
  solicitudes: {
    label: "Solicitudes",
    endpoint: "/admin/solicitudes",
    id: "id_solicitud",
  },
  vehiculos: {
    label: "Vehículos",
  },
  vacantes: {
    label: "Vacantes",
    endpoint: "/admin/vacantes",
    id: "id_vacante",
  },
};

const formatoFecha = (value) => {
  if (!value) return "";
  const fecha = new Date(value);
  return Number.isNaN(fecha.getTime())
    ? String(value)
    : fecha.toLocaleString("es-SV");
};

function Registro({ seccion, registro }) {
  if (seccion === "vacantes") {
    return (
      <article className="border-b border-slate-800 py-5">
        <div className="flex flex-wrap justify-between gap-2">
          <h2 className="font-bold text-white">{registro.titulo_puesto}</h2>
          <time className="text-xs text-slate-500">
            {formatoFecha(registro.fecha_publicacion)}
          </time>
        </div>
        <p className="mt-1 text-sm text-slate-300">
          Estado: {registro.estado_vacante}
        </p>
        <p className="mt-3 whitespace-pre-line text-sm text-slate-400">
          {registro.descripcion_puesto}
        </p>
      </article>
    );
  }

  if (seccion === "cotizaciones") {
    return (
      <article className="border-b border-slate-800 py-5">
        <div className="flex flex-wrap justify-between gap-2">
          <h2 className="font-bold text-white">{registro.nombre_cliente}</h2>
          <time className="text-xs text-slate-500">
            {formatoFecha(registro.fecha_solicitud)}
          </time>
        </div>
        <p className="mt-1 text-sm text-slate-300">
          {registro.correo_cliente} · {registro.telefono_cliente}
        </p>
        {(registro.marca || registro.modelo) && (
          <p className="mt-2 text-sm text-slate-300">
            Vehículo:{" "}
            {[registro.marca, registro.modelo].filter(Boolean).join(" ")}
          </p>
        )}
        {registro.nombre_servicio && (
          <p className="mt-1 text-sm text-slate-300">
            Servicio: {registro.nombre_servicio}
          </p>
        )}
        <p className="mt-3 whitespace-pre-line text-sm text-slate-400">
          {registro.requerimiento}
        </p>
      </article>
    );
  }

  if (seccion === "mensajes") {
    return (
      <article className="border-b border-slate-800 py-5">
        <div className="flex flex-wrap justify-between gap-2">
          <h2 className="font-bold text-white">{registro.asunto}</h2>
          <time className="text-xs text-slate-500">
            {formatoFecha(registro.fecha_envio)}
          </time>
        </div>
        <p className="mt-1 text-sm text-slate-300">
          {registro.nombre_remitente} · {registro.correo_remitente}
        </p>
        <p className="mt-3 whitespace-pre-line text-sm text-slate-400">
          {registro.mensaje}
        </p>
      </article>
    );
  }

  return (
    <article className="border-b border-slate-800 py-5">
      <div className="flex flex-wrap justify-between gap-2">
        <h2 className="font-bold text-white">{registro.nombre_candidato}</h2>
        <time className="text-xs text-slate-500">
          {formatoFecha(registro.fecha_postulacion)}
        </time>
      </div>
      <p className="mt-1 text-sm text-slate-300">
        {registro.titulo_puesto || "Vacante"} · {registro.correo_candidato} ·{" "}
        {registro.telefono_candidato}
      </p>
      <p className="mt-3 whitespace-pre-line text-sm text-slate-400">
        {registro.experiencia}
      </p>
    </article>
  );
}

export default function AdminPanel() {
  const { session, logout } = useAuth();
  const [seccion, setSeccion] = useState("cotizaciones");
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [reintento, setReintento] = useState(0);

  useEffect(() => {
    if (seccion === "vehiculos") return undefined;

    let activo = true;
    setCargando(true);
    setError("");

    api
      .get(SECCIONES[seccion].endpoint)
      .then(({ data }) => {
        if (!Array.isArray(data))
          throw new Error(
            "La respuesta del servidor no tiene el formato esperado.",
          );
        if (activo) setRegistros(data);
      })
      .catch((requestError) => {
        if (activo) {
          setError(
            requestError.response?.data?.error ||
              requestError.message ||
              "No fue posible cargar los registros.",
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [seccion, reintento]);

  return (
    <section className="py-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <p className="text-xs font-bold uppercase text-[#e5a93b]">
            Administración
          </p>
          <h1 className="mt-1 text-2xl font-black text-white">
            Panel de gestión
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sesión: {session.user.nombre}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </header>

      <nav
        aria-label="Secciones administrativas"
        className="mt-5 flex flex-wrap gap-2 border-b border-slate-800"
      >
        {Object.entries(SECCIONES).map(([key, value]) => (
          <button
            key={key}
            type="button"
            aria-pressed={seccion === key}
            onClick={() => setSeccion(key)}
            className={`border-b-2 px-4 py-3 text-sm font-semibold ${seccion === key ? "border-[#e5a93b] text-[#e5a93b]" : "border-transparent text-slate-400 hover:text-white"}`}
          >
            {value.label}
          </button>
        ))}
      </nav>

      <div className="mt-2">
        {seccion === "vehiculos" ? (
          <VehicleManager />
        ) : seccion === "vacantes" ? (
          <VacancyManager />
        ) : cargando ? (
          <p
            role="status"
            className="flex items-center justify-center gap-2 py-16 text-slate-300"
          >
            <Loader2 className="h-5 w-5 animate-spin" /> Cargando{" "}
            {SECCIONES[seccion].label.toLowerCase()}...
          </p>
        ) : error ? (
          <div role="alert" className="py-12 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => setReintento((actual) => actual + 1)}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#e5a93b]"
            >
              <RefreshCw className="h-4 w-4" /> Reintentar
            </button>
          </div>
        ) : registros.length === 0 ? (
          <p role="status" className="py-12 text-center text-sm text-slate-400">
            No hay {SECCIONES[seccion].label.toLowerCase()}.
          </p>
        ) : (
          registros.map((registro) => (
            <Registro
              key={registro[SECCIONES[seccion].id]}
              seccion={seccion}
              registro={registro}
            />
          ))
        )}
      </div>
    </section>
  );
}
