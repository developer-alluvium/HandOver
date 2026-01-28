import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await authAPI.me();
        if (response.data) {
          setIsAuthenticated(true);
          setUserData(response.data.userData);
          setShippers(response.data.shippers || []);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData, shippersData) => {
    setIsAuthenticated(true);
    setUserData(userData);
    setShippers(shippersData || []);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsAuthenticated(false);
      setUserData(null);
      setShippers([]);
    }
  };

  const checkAuth = () => {
    return isAuthenticated;
  };

  const value = {
    isAuthenticated, // boolean state
    checkAuth, // function to check auth
    userData,
    shippers,
    login,
    logout,
    loading, // export loading state
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
