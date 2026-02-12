import { createContext, useEffect, useState, useCallback } from "react";
import { getMe } from "../services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  // ✅ token change hote hi me fetch hoga
  useEffect(() => {
    if (!token) return;

    getMe(token)
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem("user", JSON.stringify(res.data.data)); // ✅ navbar instantly
      })
      .catch(() => logout());
  }, [token, logout]);

  // ✅ login -> token set -> effect fetches full user
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
