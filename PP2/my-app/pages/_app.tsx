// pages/_app.tsx
import React from "react";
import "../styles/globals.css"; // Import global CSS (if any)
import { AppProps } from "next/app"; // Type for app props

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp;
