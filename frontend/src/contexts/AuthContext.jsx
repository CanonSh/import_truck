import { useState } from "react";
import api from "../services/api";
import { AuthContext } from "../hooks/useAuth";
import {
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
} from "../services/authSession";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readAuthSession);

  const login = async ({ correo, password }) => {
    const { data } = await api.post("/auth/login", { correo, password });
    if (!data.token || !data.usuario) {
      throw new Error("La respuesta de autenticación no es válida.");
    }
    if (data.usuario.rol !== "admin") {
      throw new Error("La cuenta no tiene permisos de administrador.");
    }

    const authenticatedSession = {
      token: data.token,
      user: { nombre: data.usuario.nombre, rol: data.usuario.rol },
    };
    saveAuthSession(authenticatedSession);
    setSession(authenticatedSession);
  };

  const logout = () => {
    clearAuthSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
