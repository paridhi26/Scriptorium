import { useState, useEffect } from "react";
import axios from "axios";

interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: { tag: string }[]; // Tags are objects with a `tag` field
  codeTemplates: { id: string }[]; // Code templates are objects with an `id` field
  upvotes: number;
  downvotes: number;
}

interface NewPost {
  title: string;
  description: string;
  content: string;
  tags: string;
  codeTemplateIds: string;
}

const Blogs = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [newPost, setNewPost] = useState<NewPost>({
    title: "",
    description: "",
    content: "",
    tags: "",
    codeTemplateIds: "",
  });
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    if (loggedIn) {
      const fetchPosts = async () => {
        try {
          const response = await axios.get<Post[]>("/api/posts", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          });
          setPosts(response.data);
        } catch (err: any) {
          setError(err.response?.data?.message || "Failed to fetch posts");
        } finally {
          setLoading(false);
        }
      };

      fetchPosts();
    }
  }, [loggedIn]);

  const handleLogin = async () => {
    try {
      const response = await axios.post<{ token: string }>("/api/auth/login", { email, password });
      const token = response.data.token;

      localStorage.setItem("authToken", token);
      setLoggedIn(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to login");
    }
  };

  const handleCreatePost = async () => {
    try {
      const tagsArray = newPost.tags.split(",").map((tag) => tag.trim());
      const codeTemplateIdsArray = newPost.codeTemplateIds
        .split(",")
        .map((id) => id.trim());

      const response = await axios.post<Post>(
        "/api/posts",
        {
          ...newPost,
          tags: tagsArray,
          codeTemplateIds: codeTemplateIdsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setPosts([response.data, ...posts]);
      setNewPost({ title: "", description: "", content: "", tags: "", codeTemplateIds: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create post");
    }
  };

  const sortPostsByUpvotes = () => {
    const sorted = [...posts].sort((a, b) => b.upvotes - a.upvotes);
    setPosts(sorted);
  };

  const sortPostsByDownvotes = () => {
    const sorted = [...posts].sort((a, b) => b.downvotes - a.downvotes);
    setPosts(sorted);
  };

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 px-4 py-2 border rounded-md w-72"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 px-4 py-2 border rounded-md w-72"
        />
        <button
          onClick={handleLogin}
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
      <h1 className="text-3xl font-bold mb-6 text-center">Blog Posts</h1>

      <div className="mb-4 flex justify-end space-x-4">
        <button
          onClick={sortPostsByUpvotes}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Sort by Upvotes
        </button>
        <button
          onClick={sortPostsByDownvotes}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Sort by Downvotes
        </button>
      </div>

      <ul className="space-y-6 mb-12">
        {posts.map((post) => (
          <li key={post.id} className="p-6 border rounded-lg shadow-lg bg-white">
            <h2 className="text-xl font-semibold text-blue-600">{post.title}</h2>
            <p className="text-gray-600 mt-2">{post.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Tags: {post.tags.map((tag) => tag.tag).join(", ") || "No tags"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Code Templates:{" "}
              {post.codeTemplates.map((ct) => ct.id).join(", ") || "No templates"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Upvotes: {post.upvotes} | Downvotes: {post.downvotes}
            </p>
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-semibold mb-4">Create New Post</h2>
      <div className="p-6 bg-gray-100 border rounded-lg shadow-md">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Description"
            value={newPost.description}
            onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-md"
          />
          <textarea
            placeholder="Content"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            className="w-full px-4 py-2 border rounded-md resize-none"
            rows={5}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={newPost.tags}
            onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Code Template IDs (comma separated)"
            value={newPost.codeTemplateIds}
            onChange={(e) => setNewPost({ ...newPost, codeTemplateIds: e.target.value })}
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            onClick={handleCreatePost}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Create Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blogs;