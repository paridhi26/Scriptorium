// pages/_app.tsx
import React from "react";
import "../styles/globals.css"; // Import global CSS (if any)
import { AppProps } from "next/app"; // Type for app props
import { AuthProvider } from "../context/AuthContext";
import Layout from '../components/Layout';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
