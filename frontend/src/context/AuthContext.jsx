import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null); // null = checking, false = anon, obj = logged in
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("ct_token");
    if (!token) {
      setAdmin(false);
      setReady(true);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setAdmin(r.data))
      .catch(() => {
        localStorage.removeItem("ct_token");
        setAdmin(false);
      })
      .finally(() => setReady(true));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("ct_token", data.token);
    setAdmin({ id: data.id, email: data.email, name: data.name });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("ct_token");
    setAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ admin, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
