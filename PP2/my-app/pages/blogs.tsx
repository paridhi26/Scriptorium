// Import necessary libraries and context
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

// Define the Post interface
interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: { tag: string }[];
  codeTemplates: { id: string }[];
  upvotes: number;
  downvotes: number;
  hidden: boolean;
  userId: string;
}

const Blogs = () => {
  // Use authentication context
  const { loggedIn, id: userId } = useAuth();

  // State for posts, pagination, loading, errors, search, and creating posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>("");
  const [creatingPost, setCreatingPost] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: "",
    description: "",
    content: "",
    tags: "",
  });

  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get<Post[]>("/api/posts");
        setPosts(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle search functionality
  const handleSearch = async () => {
    setLoading(true);
    try {
      if (!searchQuery.trim()) {
        // Fetch all posts if no search query
        const response = await axios.get<Post[]>("/api/posts");
        setPosts(response.data);
      } else {
        // Fetch posts matching the search query
        const response = await axios.get<Post[]>("/api/visitors/searchBlogPost", {
          params: { query: searchQuery },
        });
        setPosts(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to search posts");
    } finally {
      setLoading(false);
    }
  };

  // Handle reporting a post
  const handleReport = async () => {
    if (!reportingPostId || !reportReason.trim()) {
      setError("Please provide a reason for reporting.");
      return;
    }

    try {
      await axios.post(
        "/api/reports",
        {
          contentId: parseInt(reportingPostId, 10),
          contentType: "post",
          reason: reportReason,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      alert("Report submitted successfully!");
      setReportingPostId(null);
      setReportReason("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit report");
    }
  };

  // Handle creating a new post
  const handleCreatePost = async () => {
    if (!newPostData.title || !newPostData.description || !newPostData.content) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      const tagsArray = newPostData.tags.split(",").map((tag) => tag.trim());
      const response = await axios.post(
        "/api/posts",
        {
          title: newPostData.title,
          description: newPostData.description,
          content: newPostData.content,
          tags: tagsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setPosts((prev) => [response.data, ...prev]);
      setCreatingPost(false);
      setNewPostData({ title: "", description: "", content: "", tags: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create post");
    }
  };

  // Sorting functions
  const sortPostsByUpvotes = () => {
    const sorted = [...posts].sort((a, b) => b.upvotes - a.upvotes);
    setPosts(sorted);
  };

  const sortPostsByDownvotes = () => {
    const sorted = [...posts].sort((a, b) => b.downvotes - a.downvotes);
    setPosts(sorted);
  };

  const sortPostsAlphabetically = () => {
    const sorted = [...posts].sort((a, b) => a.title.localeCompare(b.title));
    setPosts(sorted);
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Loading and error handling
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Blog Posts</h1>

      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, tags, description, or content..."
          className="px-4 py-2 border rounded-md w-2/3 mr-4"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Sorting Buttons */}
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
        <button
          onClick={sortPostsAlphabetically}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Sort Alphabetically
        </button>
      </div>

      {/* Display Posts */}
      <div className="overflow-x-auto whitespace-nowrap py-4">
        <div className="flex space-x-6">
          {currentPosts.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id} passHref>
              <div className="inline-block min-w-[300px] max-w-[300px] p-6 border rounded-lg bg-white">
                <h2 className="text-xl font-semibold text-blue-600 truncate">{post.title}</h2>
                <p className="text-gray-600 mt-2 line-clamp-3 overflow-hidden">{post.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Tags: {post.tags.map((tag) => tag.tag).join(", ")}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Upvotes: {post.upvotes} | Downvotes: {post.downvotes}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: Math.ceil(posts.length / postsPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-300 hover:bg-gray-400 text-gray-700"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Create New Blog Post */}
      {loggedIn && (
        <div className="mt-12">
          <button
            onClick={() => setCreatingPost(true)}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create New Blog Post
          </button>
        </div>
      )}

      {/* New Post Modal */}
      {creatingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Create New Blog Post</h3>
            <input
              type="text"
              placeholder="Title"
              value={newPostData.title}
              onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-md mb-4"
            />
            <input
              type="text"
              placeholder="Description"
              value={newPostData.description}
              onChange={(e) => setNewPostData({ ...newPostData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-md mb-4"
            />
            <textarea
              placeholder="Content"
              value={newPostData.content}
              onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
              className="w-full px-4 py-2 border rounded-md mb-4"
              rows={5}
            />
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={newPostData.tags}
              onChange={(e) => setNewPostData({ ...newPostData, tags: e.target.value })}
              className="w-full px-4 py-2 border rounded-md mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setCreatingPost(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingPostId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Report Post</h3>
            <textarea
              placeholder="Reason for reporting this post"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-4 py-2 border rounded-md resize-none mb-4"
              rows={4}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setReportingPostId(null);
                  setReportReason("");
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;






































































































































































































































