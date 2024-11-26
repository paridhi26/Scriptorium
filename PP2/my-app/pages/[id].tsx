import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface UserDashboard {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

const UserDashboard = () => {
  const [userData, setUserData] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const router = useRouter();
  const { id } = router.query; // Extract dynamic route parameter

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!id || typeof id !== "string") return;

      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setError("You must be logged in to view this page.");
        router.push("/auth/login"); // Redirect to login if not authenticated
        return;
      }

      try {
        const response = await axios.get<UserDashboard>(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUserData(response.data);
        setLoggedIn(true);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, router]);

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6">
        <h2 className="text-2xl font-bold mb-6">You are not logged in</h2>
        <button
          onClick={() => router.push("/auth/login")}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Login
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Welcome, {userData?.firstName} {userData?.lastName}
      </h1>
      <p className="text-gray-700 mb-4">Email: {userData?.email}</p>
      {userData?.phone && (
        <p className="text-gray-700 mb-4">Phone: {userData.phone}</p>
      )}
      {userData?.avatar && (
        <div className="mb-4">
          <p className="text-gray-700">Avatar:</p>
          <img
            src={userData.avatar}
            alt={`${userData.firstName}'s Avatar`}
            className="rounded-full w-32 h-32"
          />
        </div>
      )}
      <p className="text-gray-500">This is your dashboard.</p>
    </div>
  );
};

export default UserDashboard;
