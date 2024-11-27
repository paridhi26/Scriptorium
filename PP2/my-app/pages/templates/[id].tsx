import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Template {
  id: string;
  title: string;
  description: string;
  code: string;
  tags: { id: number; tag: string }[];
  createdAt: string;
  updatedAt: string;
  blogPosts: BlogPost[];
}

interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  tags: { id: number; tag: string }[];
}

const TemplateDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [upvotes, setUpvotes] = useState<number>(0);
  const [downvotes, setDownvotes] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    const fetchTemplate = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/visitors/mentionedCodeTemplates?id=${id}`);
        const data = await response.json();
        setTemplate(data);
        setUpvotes(data.upvotes || 0);
        setDownvotes(data.downvotes || 0);
      } catch (err) {
        setError('Failed to load template.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const handleRunCode = async () => {
    try {
      const response = await fetch('/api/executeTemp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: id, input }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute the code.');
      }

      const data = await response.json();
      setOutput(data.output || 'No output.');
    } catch (err) {
      setOutput('Error executing code.');
    }
  };

  const handleFork = () => {
    console.log('Forking template:', id);
    // Add logic to fork the template, e.g., redirecting to a new creation page with pre-filled data.
  };

  const handleUpvote = async () => {
    setUpvotes((prev) => prev + 1);
    // Implement backend integration for upvoting if needed
  };

  const handleDownvote = async () => {
    setDownvotes((prev) => prev + 1);
    // Implement backend integration for downvoting if needed
  };

  if (loading) return <p>Loading template...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto px-4 py-10">
      {template ? (
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{template.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{template.description}</p>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {template.tags.map((tag) => (
              <span
                key={tag.id}
                className="bg-blue-100 text-blue-500 px-3 py-1 rounded-full text-sm"
              >
                {tag.tag}
              </span>
            ))}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
              <code>{template.code}</code>
            </pre>
            <div className="mt-4">
              <label htmlFor="codeInput" className="block text-gray-700 font-medium mb-2">
                Command Line Input:
              </label>
              <input
                type="text"
                id="codeInput"
                placeholder="Enter input for the code"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleRunCode}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white transition duration-300"
              >
                Run Code
              </button>
              <button
                onClick={handleFork}
                className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg text-white transition duration-300"
              >
                Fork Template
              </button>
            </div>
            <div className="bg-gray-200 p-4 rounded-lg mt-4">
              <strong>Output:</strong>
              <pre>{output || 'No output yet.'}</pre>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleUpvote}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Upvote ({upvotes})
            </button>
            <button
              onClick={handleDownvote}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Downvote ({downvotes})
            </button>
          </div>

          {/* Related Blog Posts Section */}
          {template.blogPosts.length > 0 && (
            <div className="mt-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Related Blog Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {template.blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.description}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      By {post.user.firstName} {post.user.lastName}
                    </p>
                    <a
                      href={`/blog/${post.id}`}
                      className="text-blue-500 hover:text-blue-600 font-semibold"
                    >
                      Read More →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Template not found.</p>
      )}
    </div>
  );
};

export default TemplateDetails;