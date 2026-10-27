import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function AdminLogin() {
  const { session, login } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  if (session?.user?.rol === "admin") return <Navigate to="/admin" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (cargando) return;

    setCargando(true);
    setError("");
    try {
      await login({ correo: correo.trim(), password });
      setPassword("");
      navigate("/admin", { replace: true });
    } catch (loginError) {
      setError(
        loginError.response?.data?.error ||
          loginError.message ||
          "No fue posible iniciar sesión. Intenta de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="mx-auto my-12 w-full max-w-md rounded-xl border border-slate-800 bg-[#0b1726]/90 p-6 sm:p-8">
      <div className="mb-6 border-b border-slate-800 pb-4">
        <p className="text-xs font-bold uppercase text-[#e5a93b]">
          Administración
        </p>
        <h1 className="mt-2 text-2xl font-black text-white">Iniciar sesión</h1>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="admin-correo"
            className="mb-1.5 block text-sm font-semibold text-slate-300"
          >
            Correo
          </label>
          <input
            id="admin-correo"
            name="correo"
            type="email"
            autoComplete="username"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            required
            maxLength={100}
            className="w-full rounded-lg border border-slate-700 bg-[#122238] p-3 text-sm text-white focus:border-[#e5a93b] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="admin-password"
            className="mb-1.5 block text-sm font-semibold text-slate-300"
          >
            Contraseña
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-700 bg-[#122238] p-3 text-sm text-white focus:border-[#e5a93b] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={cargando}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e5a93b] px-4 py-3 text-sm font-bold text-slate-950 hover:bg-[#f5b84c] disabled:opacity-60"
        >
          {cargando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {cargando ? "Validando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
}
