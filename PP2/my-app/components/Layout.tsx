// components/Layout.tsx
import React, { ReactNode } from "react";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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
              </ul>
            </nav>
          </div>

          {/* Right side (Search Bar + Profile Icon) */}
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 rounded-full text-black"
            />
            <div className="w-8 h-8 bg-gray-200 rounded-full flex justify-center items-center">
              <img
                src="/path-to-your-profile-icon.png" // replace with the actual path to your profile icon
                alt="Profile"
                className="w-6 h-6 rounded-full"
              />
            </div>
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