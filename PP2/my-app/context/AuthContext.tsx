import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  phone: string | null;
  role: string;
}

interface AuthContextProps {
  loggedIn: boolean;
  user: User | null;
  id: string | null;
  login: (token: string, id: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  loggedIn: false,
  user: null,
  id: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");
      const storedId = localStorage.getItem("userId");

      if (token && storedUser && storedId) {
        setLoggedIn(true);
        setUser(JSON.parse(storedUser));
        setId(storedId);
      }
    } catch (err) {
      console.error("Error initializing auth state:", err);
      logout(); // Ensure a clean state if initialization fails
    }
  }, []);

  const login = (token: string, id: string, user: User) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userId", id);
    localStorage.setItem("user", JSON.stringify(user));
    setLoggedIn(true);
    setUser(user);
    setId(id);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    setLoggedIn(false);
    setUser(null);
    setId(null);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, user, id, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
