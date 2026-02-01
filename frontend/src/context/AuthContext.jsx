import { createContext, useEffect, useState } from "react";
import { getMe } from "../services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      getMe(token)
        .then((res) => setUser(res.data.data))
        .catch(() => logout());
    }
  }, []);

  const login = (token, role) => {
    localStorage.setItem("token", token);
    setUser({ role });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
