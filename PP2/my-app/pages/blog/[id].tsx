import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
}

const BlogDetail = () => {
  const router = useRouter();
  const { id } = router.query; // Fetch dynamic route parameter
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        const response = await axios.get(`/api/blog/${id}`);
        setBlog(response.data);
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!blog) return <p>Blog post not found.</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <p className="mb-4">{blog.content}</p>
      <p className="text-gray-500">
        Upvotes: {blog.upvotes} | Downvotes: {blog.downvotes}
      </p>
    </div>
  );
};

export default BlogDetail;







