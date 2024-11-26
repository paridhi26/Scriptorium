import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";

// Define types for the fetched data
interface Template {
  id: string;
  name: string;
  description: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
}

const Home: React.FC = () => {
  // States for storing the fetched data
  const [templates, setTemplates] = useState<Template[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Fetch templates data from the endpoint
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/visitors/allTemplates");
        const data = await response.json();
        setTemplates(data.codeTemplates); // Adjust this based on the actual API response structure
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  // Fetch blog posts (replace with your actual blog posts API)
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch("/api/visitors/blogPostsSortedPage"); // Replace with the actual API endpoint for blog posts
        const data = await response.json();
        setBlogPosts(data.blogPosts); // Adjust this based on the actual API response structure
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      }
    };

    fetchBlogPosts();
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Welcome to Scriptorium
      </h1>
      <p className="mt-4 text-lg text-gray-600 text-center">
        Write, execute, and share code in multiple programming languages. Join our community of developers today!
      </p>

      {/* Top Templates Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800">Top Templates</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length > 0 ? (
            templates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg shadow-md">
                <h3 className="font-semibold text-lg text-gray-800">{template.name}</h3>
                <p className="text-gray-600">{template.description}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Loading templates...</p>
          )}
        </div>
      </section>

      {/* Top Blog Posts Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800">Top Blog Posts</h2>
        <div className="mt-4 space-y-4">
          {blogPosts.length > 0 ? (
            blogPosts.map((post) => (
              <div key={post.id} className="p-4 border rounded-lg shadow-md">
                <h3 className="font-semibold text-lg text-gray-800">{post.title}</h3>
                <p className="text-gray-600">{post.content.slice(0, 150)}...</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Loading blog posts...</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Home;