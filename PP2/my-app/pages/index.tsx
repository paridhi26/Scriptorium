import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Link from "next/link";
import { CodeIcon, BookOpenIcon, SearchIcon } from '@heroicons/react/outline';

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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
  };

  return (
    <Layout>
      <div className="bg-gray-100 py-20">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-5xl font-extrabold mb-4 text-gray-800">
            Welcome to Scriptorium
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
            Write, execute, and share code in multiple programming languages. Join our community of developers today!
          </p>
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex justify-center">
              <input
                type="text"
                placeholder="Search templates, blog posts, or code snippets..."
                className="w-full max-w-md px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 border-2 border-blue-500 border-r-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-r-lg transition duration-300 text-white">
                <SearchIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/editor" className="bg-blue-500 text-white hover:bg-blue-600 font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center">
              <CodeIcon className="h-5 w-5 mr-2" />
              Launch Online Editor
            </Link>
            <Link href="/login" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Sign Up Today
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <CodeIcon className="h-8 w-8 mr-2 text-blue-500" />
            Top Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.length > 0 ? (
              templates.map((template) => (
                <div key={template.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                  <h3 className="font-semibold text-xl text-gray-800 mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <Link href={`/templates/${template.id}`} className="text-blue-500 hover:text-blue-600 font-semibold">
                    Use Template →
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-3 text-center">Loading templates...</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <BookOpenIcon className="h-8 w-8 mr-2 text-green-500" />
            Top Blog Posts
          </h2>
          <div className="space-y-8">
            {blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <div key={post.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                  <h3 className="font-semibold text-xl text-gray-800 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.content.slice(0, 150)}...</p>
                  <Link href={`/blog/${post.id}`} className="text-green-500 hover:text-green-600 font-semibold">
                    Read More →
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center">Loading blog posts...</p>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;