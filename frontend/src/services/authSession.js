export const AUTH_SESSION_KEY = "import-truck-admin-session";

export const readAuthSession = () => {
  if (typeof window === "undefined") return null;

  try {
    const session = JSON.parse(window.sessionStorage.getItem(AUTH_SESSION_KEY));
    return session?.token && session?.user ? session : null;
  } catch {
    return null;
  }
};

export const saveAuthSession = (session) => {
  window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

export const clearAuthSession = () => {
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
};
