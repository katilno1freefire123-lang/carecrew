import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const info  = localStorage.getItem("adminInfo");
    if (token && info) setAdmin(JSON.parse(info));
    setLoading(false);
  }, []);

  const login = (token, adminInfo) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminInfo", JSON.stringify(adminInfo));
    setAdmin(adminInfo);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
