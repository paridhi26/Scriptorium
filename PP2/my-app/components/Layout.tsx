// components/Layout.tsx
import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setAuthToken(token);

    if (token) {
      setLoggedIn(true);
    }
  }, []);

  const handleAuth = async (isLogin: boolean) => {
    setError(null);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Authentication failed");
      }

      const { authToken } = await response.json();
      localStorage.setItem("authToken", authToken);

      // Mark the user as logged in and reload the page
      setLoggedIn(true);
      setAuthToken(authToken);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  };

  if (!loggedIn) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-md rounded p-6">
          <h1 className="text-2xl font-bold text-center mb-4">Login or Sign Up</h1>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAuth(true);
            }}
          >
            <div className="mb-4">
              <label htmlFor="email" className="block font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded p-2"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border rounded p-2"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
          </form>
          <button
            className="w-full bg-gray-600 text-white p-2 rounded mt-4 hover:bg-gray-700"
            onClick={() => handleAuth(false)}
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold">{`</>`} Scriptorium</h1>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/editor" className="hover:underline">
                    Editor
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="hover:underline">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/blogs" className="hover:underline">
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link href="/users/${userId}" className="hover:underline">
                    My Dashboard
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="text-center">
          <p>&copy; 2024 Scriptorium. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
