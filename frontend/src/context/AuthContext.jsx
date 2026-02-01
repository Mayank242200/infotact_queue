import { createContext, useState } from "react";
import API from "../api/api";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")) || null
  );

  // LOGIN function updated to return the logged-in user
  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      const loggedInUser = res.data;

      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      return loggedInUser; // <-- Important: return user for redirect logic
    } catch (err) {
      console.error("Login failed:", err.response?.data?.message || err.message);
      return null;
    }
  };

  const register = async (form) => {
    try {
      const res = await API.post("/auth/register", form);
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data; // return registered user
    } catch (err) {
      console.error("Registration failed:", err.response?.data?.message || err.message);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
