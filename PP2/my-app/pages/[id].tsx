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

interface BlogPost {
  id: string;
  title: string;
  description: string;
  hidden: boolean;
}

const UserDashboard = () => {
  const [userData, setUserData] = useState<UserDashboard | null>(null);
  const [userPosts, setUserPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserDashboard>>({});
  const router = useRouter();
  const { id } = router.query;

  // Fetch user data and blog posts
  useEffect(() => {
    const fetchData = async () => {
      if (!id || typeof id !== "string") return;

      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setError("You must be logged in to view this page.");
        router.push("/auth/login");
        return;
      }

      try {
        // Fetch user data
        const userResponse = await axios.get<UserDashboard>(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUserData(userResponse.data);
        setFormData(userResponse.data);

        // Fetch user's blog posts
        const postsResponse = await axios.get<BlogPost[]>(`/api/posts/getMy`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUserPosts(postsResponse.data);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      setEditMode(false);
    } catch (err: any) {
      console.error("Error updating user data:", err);
      setError(err.response?.data?.message || "Failed to update user data");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  if (!userData) {
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
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 shadow-md rounded-lg">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
          Welcome, {userData.firstName} {userData.lastName}!
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Manage your profile details below to keep your information up-to-date.
        </p>
      </div>
      {!editMode ? (
        <>
          <div className="flex justify-center items-center mb-8">
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={`${userData.firstName}'s Avatar`}
                className="rounded-full w-32 h-32 border-4 border-blue-600"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                No Avatar
              </div>
            )}
          </div>
          <div className="text-gray-700 space-y-4 mb-6">
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            {userData.phone && (
              <p>
                <strong>Phone:</strong> {userData.phone}
              </p>
            )}
          </div>
          <div className="text-center">
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleInputChange}
              className="block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleInputChange}
              className="block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              className="block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              className="block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Avatar</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full p-2 border rounded"
            />
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Your Blog Posts</h2>
        {userPosts.length > 0 ? (
          <ul className="space-y-4">
            {userPosts.map((post) => (
              <li
                key={post.id}
                className={`p-4 border rounded-lg shadow-sm ${
                  post.hidden ? "bg-red-100" : "bg-white"
                }`}
              >
                <h3 className="text-xl font-bold">{post.title}</h3>
                <p className="text-gray-700">{post.description}</p>
                {post.hidden && (
                  <p className="text-red-500 font-semibold mt-2">
                    This post is hidden.
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">You have no blog posts yet.</p>
        )}
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default UserDashboard;
