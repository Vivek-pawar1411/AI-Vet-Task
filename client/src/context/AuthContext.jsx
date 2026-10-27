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
        if (error.response?.status !== 401) setAuthError(error.response?.data?.message || "Unable to connect to the account service.");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function signIn(credentials, mode) {
    const { data } = await api.post(`/auth/${mode}`, credentials);
    setUser(data.user);
  }

  async function signOut() {
    await api.post("/auth/logout");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, authError, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
