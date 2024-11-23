// pages/index.tsx
import React from "react";
import Layout from "../components/Layout";

const Home: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-center text-gray-800">
      Welcome to Scriptorium
      </h1>
      <p className="mt-4 text-lg text-gray-600 text-center">
      Write, execute, and share code in multiple programming languages. Join our community of developers today!
      </p>
    </Layout>
  );
};

export default Home;