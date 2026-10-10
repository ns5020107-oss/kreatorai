import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { getToken, setToken, clearToken } from "../lib/auth";

const AuthCtx = createContext(null);

// { user, token, login, register, logout, loading, backendUp }
// backendUp is true only when the API answers /api/health with db:true.
// When false, the app keeps working offline on localStorage and shows a
// small non-blocking notice (see Layout).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(true);
  const [backendUp, setBackendUp] = useState(false);

  useEffect(() => {
    let alive = true;
    api("/api/health").then(
      (h) => {
        if (alive) setBackendUp(!!(h && h.ok && h.db));
      },
      () => {
        if (alive) setBackendUp(false);
      }
    );
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const t = getToken();
    if (!t) {
      setLoading(false);
      return undefined;
    }
    api("/api/auth/me", { token: t }).then(
      (d) => {
        if (alive) {
          setUser(d.user);
          setTokenState(t);
        }
      },
      () => {
        if (alive) {
          clearToken();
          setTokenState(null);
          setUser(null);
        }
      }
    ).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await api("/api/auth/login", { method: "POST", body: { email, password } });
    setToken(d.token);
    setTokenState(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const d = await api("/api/auth/register", { method: "POST", body: { name, email, password } });
    setToken(d.token);
    setTokenState(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, register, logout, loading, backendUp }),
    [user, token, login, register, logout, loading, backendUp]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
