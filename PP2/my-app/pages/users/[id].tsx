// pages/[id].tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const UserDashboard = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, User {id}</h1>
      <p>Your personalized dashboard goes here.</p>
    </div>
  );
};

export default UserDashboard;