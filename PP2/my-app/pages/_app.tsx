// pages/_app.tsx
import React from "react";
import "../styles/globals.css"; // Import global CSS (if any)
import { AppProps } from "next/app"; // Type for app props
import Layout from '../components/Layout';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {

  return <Layout><Component {...pageProps} /></Layout>;
};

export default MyApp;
