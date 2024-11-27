import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CodeIcon, BookOpenIcon } from "@heroicons/react/outline";

interface Template {
  id: string;
  name: string;
  description: string;
  upvotes: number;
  downvotes: number;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
}

const Home: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/visitors/allTemplates");
        const data = await response.json();
        setTemplates(data.codeTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    const fetchBlogPosts = async () => {
      try {
        const response = await fetch("/api/visitors/blogPostsSortedPage");
        const data = await response.json();
        setBlogPosts(data.blogPosts);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      }
    };

    fetchTemplates();
    fetchBlogPosts();
  }, []);

  const handleUpvoteTemplate = async (id: string) => {
    try {
      await fetch(`/api/visitors/tempUpvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === id
            ? { ...template, upvotes: template.upvotes + 1 }
            : template
        )
      );
    } catch (error) {
      console.error("Error upvoting template:", error);
    }
  };

  const handleDownvoteTemplate = async (id: string) => {
    try {
      await fetch(`/api/visitors/tempDownvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === id
            ? { ...template, downvotes: template.downvotes + 1 }
            : template
        )
      );
    } catch (error) {
      console.error("Error downvoting template:", error);
    }
  };

  const handleUpvoteBlog = async (id: string) => {
    try {
      await fetch(`/api/visitors/blogUpvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setBlogPosts((prev) =>
        prev.map((post) =>
          post.id === id ? { ...post, upvotes: post.upvotes + 1 } : post
        )
      );
    } catch (error) {
      console.error("Error upvoting blog:", error);
    }
  };

  const handleDownvoteBlog = async (id: string) => {
    try {
      await fetch(`/api/visitors/blogDownvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setBlogPosts((prev) =>
        prev.map((post) =>
          post.id === id ? { ...post, downvotes: post.downvotes + 1 } : post
        )
      );
    } catch (error) {
      console.error("Error downvoting blog:", error);
    }
  };

  const sortTemplatesByUpvotes = () => {
    const sorted = [...templates].sort((a, b) => b.upvotes - a.upvotes);
    setTemplates(sorted);
  };

  const sortTemplatesByDownvotes = () => {
    const sorted = [...templates].sort((a, b) => b.downvotes - a.downvotes);
    setTemplates(sorted);
  };

  const sortBlogPostsByUpvotes = () => {
    const sorted = [...blogPosts].sort((a, b) => b.upvotes - a.upvotes);
    setBlogPosts(sorted);
  };

  const sortBlogPostsByDownvotes = () => {
    const sorted = [...blogPosts].sort((a, b) => b.downvotes - a.downvotes);
    setBlogPosts(sorted);
  };

  return (
    <>
      <div className="bg-gray-100 py-20">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-5xl font-extrabold mb-4 text-gray-800">
            Welcome to Scriptorium
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
            Write, execute, and share code in multiple programming languages.
            Join our community of developers today!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <section className="mb-16">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <CodeIcon className="h-8 w-8 mr-2 text-blue-500" />
              Top Templates
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={sortTemplatesByUpvotes}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Sort by Upvotes
              </button>
              <button
                onClick={sortTemplatesByDownvotes}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Sort by Downvotes
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {template.name}
                </h3>
                <p className="text-gray-600">{template.description}</p>
                <p className="text-gray-500">
                  Upvotes: {template.upvotes} | Downvotes: {template.downvotes}
                </p>
                <div className="flex space-x-4 mt-2">
                  <button
                    onClick={() => handleUpvoteTemplate(template.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Upvote
                  </button>
                  <button
                    onClick={() => handleDownvoteTemplate(template.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Downvote
                  </button>
                </div>
                <Link href={`/templates/${template.id}`} className="block mt-4 text-blue-500">
                  Use Template →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <BookOpenIcon className="h-8 w-8 mr-2 text-green-500" />
              Top Blog Posts
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={sortBlogPostsByUpvotes}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Sort by Upvotes
              </button>
              <button
                onClick={sortBlogPostsByDownvotes}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Sort by Downvotes
              </button>
            </div>
          </div>
          <div className="space-y-8">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {post.title}
                </h3>
                <p className="text-gray-600">{post.content.slice(0, 150)}...</p>
                <p className="text-gray-500">
                  Upvotes: {post.upvotes} | Downvotes: {post.downvotes}
                </p>
                <div className="flex space-x-4 mt-2">
                  <button
                    onClick={() => handleUpvoteBlog(post.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Upvote
                  </button>
                  <button
                    onClick={() => handleDownvoteBlog(post.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Downvote
                  </button>
                </div>
                <Link href={`/blog/${post.id}`} className="block mt-4 text-green-500">
                  Read More →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;





















































































