import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  tags?: { tag: string }[];
}

const BlogDetail = () => {
  const router = useRouter();
  const { id } = router.query; // Fetch dynamic route parameter
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        const response = await axios.get(`/api/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setBlog(response.data);
      } catch (err: any) {
        console.error("Error fetching blog post:", err);
        setError(err.response?.data?.error || "Failed to fetch the blog post.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!blog) return <p>Blog post not found.</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <p className="mb-4">{blog.content}</p>
      {blog.tags && (
        <div className="mb-4">
          <strong>Tags:</strong>{" "}
          {blog.tags.map((tag) => (
            <span key={tag.tag} className="bg-gray-200 px-2 py-1 rounded-md mr-2">
              {tag.tag}
            </span>
          ))}
        </div>
      )}
      <p className="text-gray-500">
        Upvotes: {blog.upvotes} | Downvotes: {blog.downvotes}
      </p>
    </div>
  );
};

export default BlogDetail;
