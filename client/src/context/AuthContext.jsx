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
    const initializeAuth = async () => {
      try {
        // First check if already authenticated
        const meResponse = await authAPI.me();
        if (meResponse.data) {
          setIsAuthenticated(true);
          setUserData(meResponse.data.userData);
          setShippers(meResponse.data.shippers || []);
          console.log("[AUTH] Already authenticated");
          setLoading(false);
          return;
        }
      } catch (error) {
        // Not authenticated, try auto-login
        console.log("[AUTH] Not authenticated, attempting auto-login...");
      }

      try {
        // Auto-login using backend env credentials
        const autoLoginResponse = await authAPI.autoLogin();
        if (autoLoginResponse.data || autoLoginResponse.status === 200) {
          // Fetch user data after auto-login
          const meResponse = await authAPI.me();
          if (meResponse.data) {
            setIsAuthenticated(true);
            setUserData(meResponse.data.userData);
            setShippers(meResponse.data.shippers || []);
            console.log("[AUTH] Auto-login successful");
          }
        }
      } catch (error) {
        console.error("[AUTH] Auto-login failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
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
