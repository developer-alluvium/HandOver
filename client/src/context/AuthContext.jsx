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
      // 1. Try Validating from Local Storage OR Cookie
      const storedUser = localStorage.getItem("userData");
      const storedShippers = localStorage.getItem("shippers");

      // Cookie Check Logic
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
      }
      const cookieAuth = getCookie('odex_auth');

      let hasLocalAuth = false;

      // Priority: 1. Cookie (Freshest), 2. LocalStorage
      if (cookieAuth) {
        try {
          // Decode URI component because cookie value might be encoded
          const decodedCookie = decodeURIComponent(cookieAuth);
          const parsedCookie = JSON.parse(decodedCookie);

          if (parsedCookie && parsedCookie.userData) {
            setUserData(parsedCookie.userData);
            setShippers(parsedCookie.shippers || []);
            setIsAuthenticated(true);
            hasLocalAuth = true;

            // Sync to LocalStorage
            localStorage.setItem("userData", JSON.stringify(parsedCookie.userData));
            localStorage.setItem("shippers", JSON.stringify(parsedCookie.shippers || []));

            console.log("[AUTH] Restored session from cookie");
            setLoading(false);
          }
        } catch (e) {
          console.error("Error parsing cookie auth data", e);
        }
      }

      // Fallback to LocalStorage if Cookie didn't work
      if (!hasLocalAuth && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const parsedShippers = storedShippers ? JSON.parse(storedShippers) : [];
          setUserData(parsedUser);
          setShippers(parsedShippers);
          setIsAuthenticated(true);
          hasLocalAuth = true;
          // Don't set loading false yet, we still want to try to reach server if possible, 
          // or we can set it false to show UI immediately. 
          // User wants to avoid login screen, so let's show UI.
          setLoading(false);
        } catch (e) {
          console.error("Error parsing local storage auth data", e);
          localStorage.removeItem("userData");
          localStorage.removeItem("shippers");
        }
      }

      try {
        // 2. Check server session (Source of Truth)
        const meResponse = await authAPI.me();
        if (meResponse.data) {
          setIsAuthenticated(true);
          setUserData(meResponse.data.userData);
          const freshShippers = meResponse.data.shippers || [];
          setShippers(freshShippers);

          // Refresh Local Storage
          localStorage.setItem("userData", JSON.stringify(meResponse.data.userData));
          localStorage.setItem("shippers", JSON.stringify(freshShippers));

          console.log("[AUTH] Session validated & updated");
          setLoading(false);
          return;
        }
      } catch (error) {
        // Not authenticated on server or error
        console.log("[AUTH] Server session check failed:", error.message);

        // If we have local auth, do we trust it? 
        // If it was a network error (not 401), we might trust it.
        // If it was 401, our cookie is dead.
        // User asked to "use localstorage", implying they want to rely on it.
        // We will Fallback to Auto Login only if we don't have local auth or if we want to repair session.
      }

      try {
        // 3. Auto-login (if enabled/needed)
        const autoLoginResponse = await authAPI.autoLogin();
        if (autoLoginResponse.data || autoLoginResponse.status === 200) {
          const meResponse = await authAPI.me();
          if (meResponse.data) {
            setIsAuthenticated(true);
            setUserData(meResponse.data.userData);
            setShippers(meResponse.data.shippers || []);
            // Refresh Local Storage
            localStorage.setItem("userData", JSON.stringify(meResponse.data.userData));
            localStorage.setItem("shippers", JSON.stringify(meResponse.data.shippers || []));

            console.log("[AUTH] Auto-login successful");
          }
        }
      } catch (error) {
        console.error("[AUTH] Auto-login failed:", error);
        // If we had local auth, we remain "authenticated" in UI 
        // but API calls might fail if cookie is missing.
        if (!hasLocalAuth) {
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData, shippersData) => {
    setIsAuthenticated(true);
    setUserData(userData);
    const safeShippers = shippersData || [];
    setShippers(safeShippers);

    // Save to Local Storage
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("shippers", JSON.stringify(safeShippers));
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
      // Clear Local Storage
      localStorage.removeItem("userData");
      localStorage.removeItem("shippers");
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
