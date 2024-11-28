// Import necessary libraries and components
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CodeIcon, BookOpenIcon } from "@heroicons/react/outline";

// Define the template interface
interface Template {
  id: string;
  title: string;
  description: string;
  upvotes: number;
  downvotes: number;
}

// Define the blog post interface
interface BlogPost {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
}

const Home: React.FC = () => {
  // State for storing templates and blog posts
  const [templates, setTemplates] = useState<Template[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Fetch templates and blog posts when the component mounts
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

  // Handle upvoting a template
  const handleUpvoteTemplate = async (id: string) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === id
          ? { ...template, upvotes: template.upvotes + 1 }
          : template
      )
    );
    try {
      const response = await fetch(`/api/visitors/tempUpvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to upvote template");
      }
    } catch (error) {
      console.error("Error upvoting template:", error);
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === id
            ? { ...template, upvotes: template.upvotes - 1 }
            : template
        )
      );
    }
  };

  // Handle downvoting a template
  const handleDownvoteTemplate = async (id: string) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === id
          ? { ...template, downvotes: template.downvotes + 1 }
          : template
      )
    );
    try {
      const response = await fetch(`/api/visitors/tempDownvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to downvote template");
      }
    } catch (error) {
      console.error("Error downvoting template:", error);
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === id
            ? { ...template, downvotes: template.downvotes - 1 }
            : template
        )
      );
    }
  };

  // Handle upvoting a blog post
  const handleUpvoteBlog = async (id: string) => {
    setBlogPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, upvotes: post.upvotes + 1 }
          : post
      )
    );
    try {
      const response = await fetch(`/api/visitors/blogUpvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to upvote blog post");
      }
    } catch (error) {
      console.error("Error upvoting blog post:", error);
      setBlogPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? { ...post, upvotes: post.upvotes - 1 }
            : post
        )
      );
    }
  };

  // Handle downvoting a blog post
  const handleDownvoteBlog = async (id: string) => {
    setBlogPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, downvotes: post.downvotes + 1 }
          : post
      )
    );
    try {
      const response = await fetch(`/api/visitors/blogDownvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to downvote blog post");
      }
    } catch (error) {
      console.error("Error downvoting blog post:", error);
      setBlogPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? { ...post, downvotes: post.downvotes - 1 }
            : post
        )
      );
    }
  };

  // Sort templates by upvotes
  const sortTemplatesByUpvotes = () => {
    const sorted = [...templates].sort((a, b) => b.upvotes - a.upvotes);
    setTemplates(sorted);
  };

  // Sort templates by downvotes
  const sortTemplatesByDownvotes = () => {
    const sorted = [...templates].sort((a, b) => b.downvotes - a.downvotes);
    setTemplates(sorted);
  };

  // Sort blog posts by upvotes
  const sortBlogPostsByUpvotes = () => {
    const sorted = [...blogPosts].sort((a, b) => b.upvotes - a.upvotes);
    setBlogPosts(sorted);
  };

  // Sort blog posts by downvotes
  const sortBlogPostsByDownvotes = () => {
    const sorted = [...blogPosts].sort((a, b) => b.downvotes - a.downvotes);
    setBlogPosts(sorted);
  };

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gray-100 py-20">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-5xl font-extrabold mb-4 text-gray-800">
            Welcome to Scriptorium
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
            Write, execute, and share code in multiple programming languages.
            Join our community of developers today!
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/editor">
              <button className="bg-blue-500 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-600">
                Launch Online Editor
              </button>
            </Link>
            <Link href="/signup">
              <button className="bg-green-500 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-green-600">
                Sign Up Today
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Templates Section */}
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
                  {template.title}
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

        {/* Blog Posts Section */}
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












































































































