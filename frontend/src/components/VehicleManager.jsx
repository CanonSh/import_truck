import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import VehicleImage from "./VehicleImage";
import api from "../services/api";

const FORMULARIO_VACIO = {
  tipo_vehiculo: "",
  marca: "",
  modelo: "",
  anio: "",
  precio: "",
  caracteristicas: "",
  estado: "Disponible",
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

export default function VehicleManager() {
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [intento, setIntento] = useState(0);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState(null);
  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [imagen, setImagen] = useState(null);
  const [cargandoRegistro, setCargandoRegistro] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [errorAccion, setErrorAccion] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const accionEnCurso = useRef(false);
  const submitEnCurso = useRef(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setErrorCarga("");

    api
      .get("/vehiculos")
      .then(({ data }) => {
        if (!Array.isArray(data))
          throw new Error(
            "La respuesta del servidor no tiene el formato esperado.",
          );
        if (activo) setVehiculos(data);
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
    setVehiculoEditando(null);
    setForm(FORMULARIO_VACIO);
    setImagen(null);
    setErrorAccion("");
    setConfirmacion("");
    setFormularioAbierto(true);
  };

  const iniciarEdicion = async (id) => {
    if (accionEnCurso.current) return;
    accionEnCurso.current = true;
    setVehiculoEditando(id);
    setFormularioAbierto(true);
    setCargandoRegistro(true);
    setImagen(null);
    setErrorAccion("");
    setConfirmacion("");

    try {
      const { data } = await api.get(`/vehiculos/${encodeURIComponent(id)}`);
      setForm({
        tipo_vehiculo: data.tipo_vehiculo ?? "",
        marca: data.marca ?? "",
        modelo: data.modelo ?? "",
        anio: data.anio ?? "",
        precio: data.precio ?? "",
        caracteristicas: data.caracteristicas ?? "",
        estado: data.estado ?? "Disponible",
      });
    } catch (error) {
      setErrorAccion(mensajeDeError(error));
    } finally {
      accionEnCurso.current = false;
      setCargandoRegistro(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
    setErrorAccion("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitEnCurso.current) return;

    submitEnCurso.current = true;
    setGuardando(true);
    setErrorAccion("");
    setConfirmacion("");

    const payload = new FormData();
    for (const field of [
      "tipo_vehiculo",
      "marca",
      "modelo",
      "anio",
      "precio",
      "caracteristicas",
      "estado",
    ]) {
      payload.append(field, String(form[field]).trim());
    }
    if (imagen) payload.append("imagen", imagen);

    try {
      const response = vehiculoEditando
        ? await api.put(
            `/vehiculos/${encodeURIComponent(vehiculoEditando)}`,
            payload,
          )
        : await api.post("/vehiculos", payload);
      const expectedStatus = vehiculoEditando ? 200 : 201;
      if (response.status !== expectedStatus)
        throw new Error("El servidor no confirmó el guardado.");

      setConfirmacion(
        vehiculoEditando ? "Vehículo actualizado." : "Vehículo creado.",
      );
      setFormularioAbierto(false);
      setImagen(null);
      setIntento((actual) => actual + 1);
    } catch (error) {
      setErrorAccion(mensajeDeError(error));
    } finally {
      submitEnCurso.current = false;
      setGuardando(false);
    }
  };

  const eliminarVehiculo = async (vehiculo) => {
    if (
      accionEnCurso.current ||
      !window.confirm(
        `¿Eliminar ${vehiculo.marca} ${vehiculo.modelo}? Esta acción no se puede deshacer.`,
      )
    )
      return;

    accionEnCurso.current = true;
    setEliminando(vehiculo.id_vehiculo);
    setErrorAccion("");
    setConfirmacion("");
    try {
      const response = await api.delete(
        `/vehiculos/${encodeURIComponent(vehiculo.id_vehiculo)}`,
      );
      if (response.status !== 200)
        throw new Error("El servidor no confirmó la eliminación.");
      setConfirmacion("Vehículo eliminado.");
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
          <h2 className="text-xl font-bold text-white">
            Inventario de vehículos
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Crear, editar y eliminar unidades.
          </p>
        </div>
        <button
          type="button"
          onClick={iniciarCreacion}
          className="inline-flex items-center gap-2 rounded-lg bg-[#e5a93b] px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-[#f5b84c]"
        >
          <Plus className="h-4 w-4" /> Agregar vehículo
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
              {vehiculoEditando ? "Editar vehículo" : "Agregar vehículo"}
            </h3>
            <button
              type="button"
              disabled={guardando || cargandoRegistro}
              onClick={() => setFormularioAbierto(false)}
              aria-label="Cerrar formulario"
              className="text-slate-400 hover:text-white disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {cargandoRegistro ? (
            <p
              role="status"
              className="flex items-center gap-2 py-6 text-sm text-slate-300"
            >
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando datos del
              vehículo...
            </p>
          ) : (
            <>
              {errorAccion && (
                <p role="alert" className="text-sm text-red-400">
                  {errorAccion}
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="space-y-1 text-xs font-semibold text-slate-300">
                  Tipo de vehículo
                  <input
                    name="tipo_vehiculo"
                    value={form.tipo_vehiculo}
                    onChange={handleChange}
                    maxLength={100}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-[#122238] p-2.5 text-sm text-white"
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-slate-300">
                  Marca
                  <input
                    name="marca"
                    value={form.marca}
                    onChange={handleChange}
                    maxLength={100}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-[#122238] p-2.5 text-sm text-white"
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-slate-300">
                  Modelo
                  <input
                    name="modelo"
                    value={form.modelo}
                    onChange={handleChange}
                    maxLength={100}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-[#122238] p-2.5 text-sm text-white"
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-slate-300">
                  Año
                  <input
                    name="anio"
                    type="number"
                    step="1"
                    value={form.anio}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-[#122238] p-2.5 text-sm text-white"
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-slate-300">
                  Precio
                  <input
                    name="precio"
                    type="number"
                    step="0.01"
                    value={form.precio}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-[#122238] p-2.5 text-sm text-white"
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-slate-300">
                  Estado
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-700 bg-[#122238] p-2.5 text-sm text-white"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Reservado">Reservado</option>
                  </select>
                </label>
                <label className="space-y-1 text-xs font-semibold text-slate-300 sm:col-span-2 lg:col-span-3">
                  Características
                  <textarea
                    name="caracteristicas"
                    value={form.caracteristicas}
                    onChange={handleChange}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-slate-700 bg-[#122238] p-2.5 text-sm text-white"
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-slate-300 sm:col-span-2 lg:col-span-3">
                  Imagen (opcional)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setImagen(event.target.files?.[0] ?? null)
                    }
                    className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-slate-100"
                  />
                  {vehiculoEditando && (
                    <span className="block font-normal text-slate-500">
                      Si no eliges otra imagen, se conserva la actual.
                    </span>
                  )}
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
                    <ImagePlus className="h-4 w-4" />
                  )}
                  {guardando ? "Guardando..." : "Guardar vehículo"}
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
            </>
          )}
        </form>
      )}

      {cargando ? (
        <p
          role="status"
          className="flex items-center gap-2 py-10 text-slate-300"
        >
          <Loader2 className="h-5 w-5 animate-spin" /> Cargando vehículos...
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
      ) : vehiculos.length === 0 ? (
        <p role="status" className="py-8 text-center text-sm text-slate-400">
          No hay vehículos registrados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#122238] text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Vehículo</th>
                <th className="px-4 py-3">Año</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((vehiculo) => (
                <tr
                  key={vehiculo.id_vehiculo}
                  className="border-t border-slate-800 text-slate-300"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <VehicleImage
                        imagePath={vehiculo.imagen_url}
                        alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                        className="h-12 w-16 shrink-0 rounded-md"
                      />
                      <div>
                        <p className="font-semibold text-white">
                          {vehiculo.marca} {vehiculo.modelo}
                        </p>
                        <p className="text-xs text-slate-500">
                          {vehiculo.tipo_vehiculo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{vehiculo.anio}</td>
                  <td className="px-4 py-3">
                    {Number(vehiculo.precio).toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-3">{vehiculo.estado}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={Boolean(eliminando) || cargandoRegistro}
                        onClick={() => iniciarEdicion(vehiculo.id_vehiculo)}
                        aria-label={`Editar ${vehiculo.marca} ${vehiculo.modelo}`}
                        className="rounded-md border border-slate-700 p-2 hover:text-[#e5a93b] disabled:opacity-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(eliminando) || cargandoRegistro}
                        onClick={() => eliminarVehiculo(vehiculo)}
                        aria-label={`Eliminar ${vehiculo.marca} ${vehiculo.modelo}`}
                        className="rounded-md border border-slate-700 p-2 hover:text-red-400 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
