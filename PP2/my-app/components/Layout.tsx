import React, { ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { loggedIn, id, user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
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
                  {loggedIn ? (
                    <Link href={`/${id}`} className="hover:underline">
                      My Dashboard
                    </Link>
                  ) : (
                    <Link href="/login" className="hover:underline">
                      Login
                    </Link>
                  )}
                </li>
                {loggedIn && user?.role === "ADMIN" && (
                  <li>
                    <Link href="/admin" className="hover:underline">
                      Admin
                    </Link>
                  </li>
                )}
                {loggedIn && (
                  <li>
                    <button onClick={logout} className="hover:underline">
                      Logout
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="text-center">
          <p>&copy; 2024 Scriptorium. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
