import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    api.get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch((error) => {
        if (error.response?.status !== 401) {
          setAuthError(error.response?.data?.message || "Unable to connect to the account service.");
        }
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function signIn(credentials, mode) {
    await api.post(`/auth/${mode}`, credentials);
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    setAuthError("");
    return data;
  }

  async function signOut() {
    try {
      await api.post("/auth/logout");
    } finally {
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
