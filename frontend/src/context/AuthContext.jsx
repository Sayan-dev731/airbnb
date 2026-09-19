import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/auth.api";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("airbnb_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("airbnb_token") || null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // 'login' | 'register'
  const { addToast } = useToast();

  // Validate session on initial load
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getCurrentUser();
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem("airbnb_user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn("Session check failed:", err.message);
        // Clean up invalid session
        setUser(null);
        setToken(null);
        localStorage.removeItem("airbnb_user");
        localStorage.removeItem("airbnb_token");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials);
      const { user: loggedInUser, accessToken } = res.data;
      
      setUser(loggedInUser);
      setToken(accessToken);
      localStorage.setItem("airbnb_user", JSON.stringify(loggedInUser));
      localStorage.setItem("airbnb_token", accessToken);
      
      setIsAuthModalOpen(false);
      addToast(`Welcome back, ${loggedInUser.name.split(" ")[0]}!`, "success");
      return loggedInUser;
    } catch (err) {
      addToast(err.message || "Failed to log in", "error");
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const res = await authAPI.register(formData);
      const { user: newUser, accessToken } = res.data;
      
      setUser(newUser);
      setToken(accessToken);
      localStorage.setItem("airbnb_user", JSON.stringify(newUser));
      localStorage.setItem("airbnb_token", accessToken);
      
      setIsAuthModalOpen(false);
      addToast("Account created successfully! Welcome to Airbnb.", "success");
      return newUser;
    } catch (err) {
      addToast(err.message || "Failed to create account", "error");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn("Logout error:", err.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("airbnb_user");
      localStorage.removeItem("airbnb_token");
      addToast("You have been signed out.", "info");
    }
  };

  const becomeHost = async () => {
    try {
      const res = await authAPI.becomeHost();
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("airbnb_user", JSON.stringify(res.data.user));
        addToast("Host mode activated! You can now publish listings.", "success");
      }
    } catch (err) {
      addToast(err.message || "Failed to activate host role", "error");
    }
  };

  const openLogin = () => {
    setAuthModalMode("login");
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthModalMode("register");
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        login,
        register,
        logout,
        becomeHost,
        openLogin,
        openRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
