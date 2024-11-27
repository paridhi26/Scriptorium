import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: { tag: string }[];
  codeTemplates: { id: string }[];
  upvotes: number;
  downvotes: number;
  hidden: boolean; // Ensure hidden is included
  userId: string; // Ensure userId is included
}

const Blogs = () => {
  const { loggedIn, id: userId } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>("");

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
      setReportingPostId(null); // Reset the state after reporting
      setReportReason("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit report");
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

  const sortPostsAlphabetically = () => {
    const sorted = [...posts].sort((a, b) => a.title.localeCompare(b.title));
    setPosts(sorted);
  };

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
        <button
          onClick={sortPostsAlphabetically}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Sort Alphabetically
        </button>
      </div>

      <ul className="space-y-6 mb-12">
        {posts.map((post) => (
          <li key={post.id} className="p-6 border rounded-lg shadow-lg bg-white">
            <h2 className="text-xl font-semibold text-blue-600">{post.title}</h2>
            <p className="text-gray-600 mt-2">{post.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Tags: {post.tags?.map((tag) => tag.tag).join(", ") || "No tags"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Code Templates:{" "}
              {post.codeTemplates?.map((ct) => ct.id).join(", ") || "No templates"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Upvotes: {post.upvotes} | Downvotes: {post.downvotes}
            </p>

            {/* Hidden Indicator for User's Hidden Post */}
            {post.hidden && post.userId === userId && (
              <p className="text-red-600 font-semibold mt-4">
                This post has been hidden by an admin.
              </p>
            )}

            {/* Report Button */}
            {loggedIn && post.userId !== userId && !post.hidden && (
              <button
                onClick={() => setReportingPostId(post.id)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Report
              </button>
            )}
          </li>
        ))}
      </ul>

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
