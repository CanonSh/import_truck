import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import api from "../services/api";

const fechaLocal = () => {
  const hoy = new Date();
  const local = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const FORMULARIO_VACIO = {
  titulo_puesto: "",
  descripcion_puesto: "",
  estado_vacante: "Activa",
  fecha_publicacion: fechaLocal(),
};

const mensajeDeError = (error) => {
  const detalles = error.response?.data?.detalles
    ?.map((detalle) => detalle.mensaje)
    .join(" ");
  return (
    detalles ||
    error.response?.data?.error ||
    error.message ||
    "No se pudo completar la operación."
  );
};

const fechaFormulario = (value) => String(value ?? "").slice(0, 10);

export default function VacancyManager() {
  const [vacantes, setVacantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [intento, setIntento] = useState(0);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [vacanteEditando, setVacanteEditando] = useState(null);
  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [errorAccion, setErrorAccion] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const accionEnCurso = useRef(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setErrorCarga("");

    api
      .get("/admin/vacantes")
      .then(({ data }) => {
        if (!Array.isArray(data)) {
          throw new Error(
            "La respuesta del servidor no tiene el formato esperado.",
          );
        }
        if (activo) setVacantes(data);
      })
      .catch((error) => {
        if (activo) setErrorCarga(mensajeDeError(error));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [intento]);

  const iniciarCreacion = () => {
    setVacanteEditando(null);
    setForm({ ...FORMULARIO_VACIO, fecha_publicacion: fechaLocal() });
    setErrorAccion("");
    setConfirmacion("");
    setFormularioAbierto(true);
  };

  const iniciarEdicion = (vacante) => {
    if (accionEnCurso.current) return;
    setVacanteEditando(vacante.id_vacante);
    setForm({
      titulo_puesto: vacante.titulo_puesto ?? "",
      descripcion_puesto: vacante.descripcion_puesto ?? "",
      estado_vacante: vacante.estado_vacante ?? "Activa",
      fecha_publicacion: fechaFormulario(vacante.fecha_publicacion),
    });
    setErrorAccion("");
    setConfirmacion("");
    setFormularioAbierto(true);
  };

  const handleChange = (event) => {
    setForm((actual) => ({
      ...actual,
      [event.target.name]: event.target.value,
    }));
    setErrorAccion("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (accionEnCurso.current) return;

    accionEnCurso.current = true;
    setGuardando(true);
    setErrorAccion("");
    setConfirmacion("");

    const payload = {
      titulo_puesto: form.titulo_puesto.trim(),
      descripcion_puesto: form.descripcion_puesto.trim(),
      estado_vacante: form.estado_vacante,
      fecha_publicacion: form.fecha_publicacion,
    };

    try {
      const response = vacanteEditando
        ? await api.put(
            `/admin/vacantes/${encodeURIComponent(vacanteEditando)}`,
            payload,
          )
        : await api.post("/admin/vacantes", payload);
      const statusEsperado = vacanteEditando ? 200 : 201;
      if (response.status !== statusEsperado) {
        throw new Error("El servidor no confirmó el guardado de la vacante.");
      }

      setConfirmacion(
        vacanteEditando ? "Vacante actualizada." : "Vacante creada.",
      );
      setFormularioAbierto(false);
      setIntento((actual) => actual + 1);
    } catch (error) {
      setErrorAccion(mensajeDeError(error));
    } finally {
      accionEnCurso.current = false;
      setGuardando(false);
    }
  };

  const eliminarVacante = async (vacante) => {
    if (
      accionEnCurso.current ||
      !window.confirm(
        `¿Eliminar la vacante “${vacante.titulo_puesto}”? Las solicitudes existentes conservarán sus datos.`,
      )
    ) {
      return;
    }

    accionEnCurso.current = true;
    setEliminando(vacante.id_vacante);
    setErrorAccion("");
    setConfirmacion("");
    try {
      const response = await api.delete(
        `/admin/vacantes/${encodeURIComponent(vacante.id_vacante)}`,
      );
      if (response.status !== 200) {
        throw new Error(
          "El servidor no confirmó la eliminación de la vacante.",
        );
      }
      setConfirmacion("Vacante eliminada.");
      setIntento((actual) => actual + 1);
    } catch (error) {
      setErrorAccion(mensajeDeError(error));
    } finally {
      accionEnCurso.current = false;
      setEliminando(null);
    }
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Vacantes laborales</h2>
          <p className="mt-1 text-sm text-slate-400">
            Administrar las oportunidades publicadas.
          </p>
        </div>
        <button
          type="button"
          onClick={iniciarCreacion}
          className="inline-flex items-center gap-2 rounded-lg bg-[#e5a93b] px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-[#f5b84c]"
        >
          <Plus className="h-4 w-4" /> Agregar vacante
        </button>
      </header>

      {confirmacion && (
        <p role="status" className="text-sm text-green-400">
          {confirmacion}
        </p>
      )}
      {errorAccion && !formularioAbierto && (
        <p role="alert" className="text-sm text-red-400">
          {errorAccion}
        </p>
      )}

      {formularioAbierto && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-800 bg-[#0b1726]/90 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-white">
              {vacanteEditando ? "Editar vacante" : "Agregar vacante"}
            </h3>
            <button
              type="button"
              disabled={guardando}
              onClick={() => setFormularioAbierto(false)}
              aria-label="Cerrar formulario"
              className="text-slate-400 hover:text-white disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {errorAccion && (
            <p role="alert" className="text-sm text-red-400">
              {errorAccion}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold text-slate-300">
              Título del puesto
              <input
                name="titulo_puesto"
                value={form.titulo_puesto}
                onChange={handleChange}
                maxLength={100}
                required
                className="w-full rounded-lg border border-slate-700 bg-[#122238] p-2.5 text-sm text-white"
              />
            </label>
            <label className="space-y-1 text-xs font-semibold text-slate-300">
              Fecha de publicación
              <input
                name="fecha_publicacion"
                type="date"
                value={form.fecha_publicacion}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-700 bg-[#122238] p-2.5 text-sm text-white"
              />
            </label>
            <label className="space-y-1 text-xs font-semibold text-slate-300">
              Estado
              <select
                name="estado_vacante"
                value={form.estado_vacante}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-700 bg-[#122238] p-2.5 text-sm text-white"
              >
                <option value="Activa">Activa</option>
                <option value="Cerrada">Cerrada</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold text-slate-300 sm:col-span-2">
              Descripción del puesto
              <textarea
                name="descripcion_puesto"
                value={form.descripcion_puesto}
                onChange={handleChange}
                rows={4}
                required
                className="w-full resize-y rounded-lg border border-slate-700 bg-[#122238] p-2.5 text-sm text-white"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center gap-2 rounded-lg bg-[#e5a93b] px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-[#f5b84c] disabled:opacity-60"
            >
              {guardando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
              {guardando ? "Guardando..." : "Guardar vacante"}
            </button>
            <button
              type="button"
              disabled={guardando}
              onClick={() => setFormularioAbierto(false)}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <p
          role="status"
          className="flex items-center gap-2 py-10 text-slate-300"
        >
          <Loader2 className="h-5 w-5 animate-spin" /> Cargando vacantes...
        </p>
      ) : errorCarga ? (
        <div role="alert" className="py-8 text-center">
          <p className="text-sm text-red-400">{errorCarga}</p>
          <button
            type="button"
            onClick={() => setIntento((actual) => actual + 1)}
            className="mt-3 inline-flex items-center gap-2 text-sm text-[#e5a93b]"
          >
            <RefreshCw className="h-4 w-4" /> Reintentar
          </button>
        </div>
      ) : vacantes.length === 0 ? (
        <p role="status" className="py-8 text-center text-sm text-slate-400">
          No hay vacantes registradas.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#122238] text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Puesto</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vacantes.map((vacante) => (
                <tr
                  key={vacante.id_vacante}
                  className="border-t border-slate-800 text-slate-300"
                >
                  <td className="max-w-md px-4 py-3">
                    <p className="font-semibold text-white">
                      {vacante.titulo_puesto}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {vacante.descripcion_puesto}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {fechaFormulario(vacante.fecha_publicacion)}
                  </td>
                  <td className="px-4 py-3">{vacante.estado_vacante}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={Boolean(eliminando)}
                        onClick={() => iniciarEdicion(vacante)}
                        aria-label={`Editar ${vacante.titulo_puesto}`}
                        className="rounded-md border border-slate-700 p-2 hover:text-[#e5a93b] disabled:opacity-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(eliminando)}
                        onClick={() => eliminarVacante(vacante)}
                        aria-label={`Eliminar ${vacante.titulo_puesto}`}
                        className="rounded-md border border-slate-700 p-2 hover:text-red-400 disabled:opacity-50"
                      >
                        {eliminando === vacante.id_vacante ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
