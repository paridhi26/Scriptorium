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
  const [editMode, setEditMode] = useState(false); // Track edit mode
  const [formData, setFormData] = useState<Partial<UserDashboard>>({});
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
        setFormData(response.data); // Initialize form with current user data
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, avatar: e.target.files[0] }));
    }
  };

  const handleUpdate = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("You must be logged in to update your information.");
      return;
    }

    try {
      const updateData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateData.append(key, value as string | Blob);
        }
      });

      const response = await axios.put(`/api/users/${id}`, updateData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setUserData(response.data);
      setEditMode(false); // Exit edit mode
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user data");
    }
  };

  if (!userData) {
    if (error) {
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
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Welcome, {userData.firstName} {userData.lastName}
      </h1>
      {!editMode ? (
        <>
          <p className="text-gray-700 mb-4">Email: {userData.email}</p>
          {userData.phone && <p className="text-gray-700 mb-4">Phone: {userData.phone}</p>}
          {userData.avatar && (
            <div className="mb-4">
              <p className="text-gray-700">Avatar:</p>
              <img
                src={userData.avatar}
                alt={`${userData.firstName}'s Avatar`}
                className="rounded-full w-32 h-32"
              />
            </div>
          )}
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleInputChange}
            placeholder="First Name"
            className="block w-full p-2 border rounded"
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleInputChange}
            placeholder="Last Name"
            className="block w-full p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleInputChange}
            placeholder="Email"
            className="block w-full p-2 border rounded"
          />
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            placeholder="Phone"
            className="block w-full p-2 border rounded"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full p-2 border rounded"
          />
          <div className="flex space-x-4">
            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default UserDashboard;
