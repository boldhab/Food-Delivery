import { createContext, useContext, useEffect, useMemo, useState } from "react";
import driverAuthService from "../services/driverAuthService";

const DriverAuthContext = createContext(null);

export const DriverAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("driverUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("driverToken"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("driverToken", token);
    } else {
      localStorage.removeItem("driverToken");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("driverUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("driverUser");
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await driverAuthService.login(email, password);
      if (data?.role !== "driver") {
        throw new Error("This account is not a driver account");
      }
      setUser(data);
      setToken(data.token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout
    }),
    [user, token, loading]
  );

  return <DriverAuthContext.Provider value={value}>{children}</DriverAuthContext.Provider>;
};

export const useDriverAuth = () => {
  const context = useContext(DriverAuthContext);
  if (!context) throw new Error("useDriverAuth must be used within DriverAuthProvider");
  return context;
};
