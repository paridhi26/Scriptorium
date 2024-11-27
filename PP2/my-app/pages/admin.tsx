import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useRouter } from "next/router";

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
  const { user, loggedIn } = useAuth(); // Access the auth context
  const [reportedPosts, setReportedPosts] = useState<ReportedPost[]>([]);
  const [reportedComments, setReportedComments] = useState<ReportedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  if (!loggedIn || user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">Unauthorized</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Reported Posts</h2>
        {reportedPosts.length === 0 ? (
          <p>No reported posts.</p>
        ) : (
          reportedPosts.map((post) => (
            <div key={post.id} className="p-4 border rounded mb-4">
              <h3 className="text-xl font-bold">{post.title}</h3>
              <p>{post.hidden ? "Hidden" : "Visible"}</p>
              <ul className="mt-2 text-sm">
                {post.reports.map((report) => (
                  <li key={report.id}>
                    <strong>Reason:</strong> {report.reason} (Reported by User ID:{" "}
                    {report.userId})
                  </li>
                ))}
              </ul>
              {!post.hidden && (
                <button
                  onClick={() => handleHideContent(post.id, "post")}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
                >
                  Hide Post
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Reported Comments</h2>
        {reportedComments.length === 0 ? (
          <p>No reported comments.</p>
        ) : (
          reportedComments.map((comment) => (
            <div key={comment.id} className="p-4 border rounded mb-4">
              <p className="text-gray-800">{comment.content}</p>
              <p>{comment.hidden ? "Hidden" : "Visible"}</p>
              <ul className="mt-2 text-sm">
                {comment.reports.map((report) => (
                  <li key={report.id}>
                    <strong>Reason:</strong> {report.reason} (Reported by User ID:{" "}
                    {report.userId})
                  </li>
                ))}
              </ul>
              {!comment.hidden && (
                <button
                  onClick={() => handleHideContent(comment.id, "comment")}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
                >
                  Hide Comment
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPage;
