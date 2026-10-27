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

      // Priority: 1. Cookie, 2. LocalStorage
      if (cookieAuth) {
        try {
          const decodedCookie = decodeURIComponent(cookieAuth);
          const parsedCookie = JSON.parse(decodedCookie);
          const cookieUser = parsedCookie?.userData || parsedCookie?.user;

          if (cookieUser) {
            setUserData(cookieUser);
            setShippers(parsedCookie.shippers || []);
            setIsAuthenticated(true);
            hasLocalAuth = true;

            localStorage.setItem("userData", JSON.stringify(cookieUser));
            localStorage.setItem("shippers", JSON.stringify(parsedCookie.shippers || []));
            setLoading(false);
          }
        } catch (e) {
          console.error("Error parsing cookie auth data", e);
        }
      }

      // Fallback to LocalStorage
      if (!hasLocalAuth && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const parsedShippers = storedShippers ? JSON.parse(storedShippers) : [];
          setUserData(parsedUser);
          setShippers(parsedShippers);
          setIsAuthenticated(true);
          hasLocalAuth = true;
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
        const meData = meResponse.data?.data || meResponse.data;
        const resolvedUser = meData?.userData || meData?.user;

        if (resolvedUser) {
          setIsAuthenticated(true);
          setUserData(resolvedUser);
          const freshShippers = meData.shippers || [];
          setShippers(freshShippers);

          localStorage.setItem("userData", JSON.stringify(resolvedUser));
          localStorage.setItem("shippers", JSON.stringify(freshShippers));

          setLoading(false);
          return;
        }
      } catch (error) {
        // me() failed - will attempt auto-login
      }

      try {
        // 3. Auto-login if session is not active
        const autoLoginResponse = await authAPI.autoLogin();
        if (autoLoginResponse.data) {
          const autoData = autoLoginResponse.data.data || autoLoginResponse.data;
          const autoUser = autoData?.userData || autoData?.user || autoLoginResponse.data.user || autoLoginResponse.data.userData;

          if (autoLoginResponse.data.token) {
            localStorage.setItem("authToken", autoLoginResponse.data.token);
          }

          if (autoUser) {
            setIsAuthenticated(true);
            setUserData(autoUser);
            const freshShippers = autoData?.shippers || autoLoginResponse.data.shippers || [];
            setShippers(freshShippers);

            localStorage.setItem("userData", JSON.stringify(autoUser));
            localStorage.setItem("shippers", JSON.stringify(freshShippers));
            setLoading(false);
            return;
          }

          // Try verifying session one more time with newly set token/cookie
          const retryMe = await authAPI.me();
          const retryData = retryMe.data?.data || retryMe.data;
          const retryUser = retryData?.userData || retryData?.user;
          if (retryUser) {
            setIsAuthenticated(true);
            setUserData(retryUser);
            setShippers(retryData.shippers || []);
            localStorage.setItem("userData", JSON.stringify(retryUser));
            localStorage.setItem("shippers", JSON.stringify(retryData.shippers || []));
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("[AUTH] Auto-login failed:", error.message || error);
        if (!hasLocalAuth) {
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userPayload, shippersData, token) => {
    const user = userPayload?.user || userPayload?.userData || userPayload;
    const shippersList = shippersData || userPayload?.shippers || [];

    setIsAuthenticated(true);
    setUserData(user);
    setShippers(shippersList);

    if (token) {
      localStorage.setItem("authToken", token);
    }
    localStorage.setItem("userData", JSON.stringify(user));
    localStorage.setItem("shippers", JSON.stringify(shippersList));
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
      localStorage.removeItem("authToken");
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
