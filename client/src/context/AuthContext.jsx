import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Agar token hi nahi hai, toh seedha loading false karein
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Token hai toh user fetch karein (Interceptor khud Bearer token header me bhej dega)
    api.get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          // Token expire ho gaya ya invalid hai
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setAuthError(
            error.response?.data?.message || "Unable to connect to the account service."
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function signIn(credentials, mode) {
    const { data } = await api.post(`/auth/${mode}`, credentials);

    // 1. Token ko localStorage me save karein
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    // 2. State update karein
    setUser(data.user);
    setAuthError("");
    return data;
  }

  async function signOut() {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      // Token aur user state dono clear karein
      localStorage.removeItem("token");
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, authError, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);