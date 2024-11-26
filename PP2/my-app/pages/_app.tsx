// pages/_app.tsx
import React from "react";
import "../styles/globals.css"; // Import global CSS (if any)
import { AppProps } from "next/app"; // Type for app props
import { AuthProvider } from "../context/AuthContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
