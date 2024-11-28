// Import necessary libraries and hooks
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

// Define interfaces for user dashboard, blog posts, and templates
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

interface Template {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

const UserDashboard = () => {
  // State for user data, posts, templates, loading, error, and edit mode
  const [userData, setUserData] = useState<UserDashboard | null>(null);
  const [userPosts, setUserPosts] = useState<BlogPost[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserDashboard>>({});
  const router = useRouter();
  const { id } = router.query; // Get user ID from router query

  // Fetch user data, blog posts, and templates on component mount
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

        // Fetch user's templates
        const templatesResponse = await axios.get<Template[]>(`/api/users/getMyTemp`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setTemplates(templatesResponse.data);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // Handle input field changes for user data form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input changes for avatar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, avatar: e.target.files[0] }));
    }
  };

  // Handle updating user data
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

  // Handle deleting a template
  const handleDeleteTemplate = async (templateId: string) => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("You must be logged in to delete a template.");
      return;
    }

    try {
      await axios.delete(`api/users/editTemp?id=${templateId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setTemplates(templates.filter((template) => template.id !== templateId));
    } catch (err: any) {
      console.error("Error deleting template:", err);
      setError(err.response?.data?.message || "Failed to delete template");
    }
  };

  // Handle editing a template
  const handleEditTemplate = (templateId: string) => {
    router.push(`api/users/editTemp?id=${templateId}`); // Redirect to edit page
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  // Show login prompt if no user data is found
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

      {/* Profile Details Section */}
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
              className="block w-full text-gray-700 p-2"
            />
          </div>
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Your Blog Posts Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Your Blog Posts</h2>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div key={post.id} className="mb-4 p-4 border rounded-md bg-white shadow-sm">
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <p>{post.description}</p>
              <div className="flex justify-end space-x-4">
                <button className="text-blue-600 hover:text-blue-700">Edit</button>
                <button className="text-red-600 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No blog posts found.</p>
        )}
      </div>

      {/* Your Templates Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Your Templates</h2>
        {templates.length > 0 ? (
          templates.map((template) => (
            <div key={template.id} className="mb-4 p-4 border rounded-md bg-white shadow-sm">
              <h3 className="text-xl font-semibold">{template.title}</h3>
              <p>{template.description}</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleEditTemplate(template.id)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No templates found.</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;











