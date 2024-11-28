// Import necessary libraries and hooks
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useRouter } from "next/router";

// Interfaces for reported posts and comments
interface Report {
  id: number;
  reason: string;
  createdAt: string;
  userId: number;
}

interface ReportedPost {
  id: number;
  title: string;
  hidden: boolean;
  reports: Report[];
}

interface ReportedComment {
  id: number;
  content: string;
  hidden: boolean;
  reports: Report[];
}

const AdminPage = () => {
  // Authentication and user data
  const { user, loggedIn } = useAuth();
  const [reportedPosts, setReportedPosts] = useState<ReportedPost[]>([]); // State for reported posts
  const [reportedComments, setReportedComments] = useState<ReportedComment[]>([]); // State for reported comments
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const router = useRouter();

  // Fetch reported content when the page loads
  useEffect(() => {
    // Redirect if not logged in or not an admin
    if (!loggedIn || user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    const fetchReportedContent = async () => {
      try {
        const response = await axios.get("/api/reports/reported-content", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        // Update state with reported posts and comments
        setReportedPosts(response.data.reportedPosts);
        setReportedComments(response.data.reportedComments);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch reported content");
      } finally {
        setLoading(false);
      }
    };

    fetchReportedContent();
  }, [loggedIn, user, router]);

  // Handle hiding content (post or comment)
  const handleHideContent = async (contentId: number, contentType: "post" | "comment") => {
    try {
      await axios.put(
        "/api/reports/hide-content",
        { contentId, contentType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      // Update the state to reflect the hidden content
      if (contentType === "post") {
        setReportedPosts((prev) =>
          prev.map((post) =>
            post.id === contentId ? { ...post, hidden: true } : post
          )
        );
      } else if (contentType === "comment") {
        setReportedComments((prev) =>
          prev.map((comment) =>
            comment.id === contentId ? { ...comment, hidden: true } : comment
          )
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to hide content");
    }
  };

  // Show unauthorized message if not admin
  if (!loggedIn || user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">Unauthorized</p>
      </div>
    );
  }

  // Show loading spinner while content is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  // Show error message if there was an issue fetching data
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-4xl font-bold text-center">Admin Dashboard</h1>

      {/* Display reported posts */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Reported Posts</h2>
        <div className="overflow-x-auto">
          <div className="flex space-x-6">
            {reportedPosts.length === 0 ? (
              <p className="text-gray-600">No reported posts.</p>
            ) : (
              reportedPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex-shrink-0 w-80 p-4 bg-white shadow-md rounded-lg border"
                >
                  <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
                  <p className="text-gray-600">{post.hidden ? "Hidden" : "Visible"}</p>
                  <ul className="mt-2 text-sm text-gray-700">
                    {post.reports.map((report) => (
                      <li key={report.id} className="mt-1">
                        <strong>Reason:</strong> {report.reason}{" "}
                        <span className="text-gray-500">(User ID: {report.userId})</span>
                      </li>
                    ))}
                  </ul>
                  {!post.hidden && (
                    <button
                      onClick={() => handleHideContent(post.id, "post")}
                      className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Hide Post
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Display reported comments */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Reported Comments</h2>
        <div className="overflow-x-auto">
          <div className="flex space-x-6">
            {reportedComments.length === 0 ? (
              <p className="text-gray-600">No reported comments.</p>
            ) : (
              reportedComments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex-shrink-0 w-80 p-4 bg-white shadow-md rounded-lg border"
                >
                  <p className="text-gray-800">{comment.content}</p>
                  <p className="text-gray-600">{comment.hidden ? "Hidden" : "Visible"}</p>
                  <ul className="mt-2 text-sm text-gray-700">
                    {comment.reports.map((report) => (
                      <li key={report.id} className="mt-1">
                        <strong>Reason:</strong> {report.reason}{" "}
                        <span className="text-gray-500">(User ID: {report.userId})</span>
                      </li>
                    ))}
                  </ul>
                  {!comment.hidden && (
                    <button
                      onClick={() => handleHideContent(comment.id, "comment")}
                      className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Hide Comment
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;














































































































