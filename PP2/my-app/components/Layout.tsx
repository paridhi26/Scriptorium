// components/Layout.tsx
import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (authToken) {
      setLoggedIn(true);

      // Fetch or decode user ID (example assumes fetching it)
      const fetchUser = async () => {
        try {
          const response = await fetch("/api/auth/user", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          const data = await response.json();
          setUserId(data.userId); // Adjust based on your API response
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setLoggedIn(false);
        }
      };

      fetchUser();
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left side (Title + Navigation Links) */}
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
                  <Link
                    href={loggedIn && userId ? `/${userId}` : "/login"}
                    className="hover:underline"
                  >
                    My Dashboard
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto p-6">{children}</main>

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
