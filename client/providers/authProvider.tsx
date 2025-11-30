import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const saved = localStorage.getItem("user");

    if (!saved) {
      setUser(null);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setUser(parsed);
    } catch (err) {
      console.warn("User corrupto en localStorage:", saved);
      setUser(null);
      localStorage.removeItem("user");
    }
  }, []);

  const loadData = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loadData, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
