import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RequireAdmin() {
  const { session } = useAuth();

  if (!session?.token) return <Navigate to="/admin/login" replace />;
  if (session.user?.rol !== "admin") {
    return (
      <section className="py-20 text-center" role="alert">
        <h1 className="text-2xl font-bold text-white">Acceso no autorizado</h1>
        <p className="mt-2 text-slate-400">
          Esta sección requiere permisos de administrador.
        </p>
      </section>
    );
  }

  return <Outlet />;
}
