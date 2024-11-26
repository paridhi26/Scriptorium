import React, { useEffect, useState } from 'react';
import { CodeIcon, SearchIcon } from '@heroicons/react/outline';

interface Template {
  id: string;
  name: string;
  description: string;
}

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/visitors/allTemplates?page=1&pageSize=10');
        const data = await response.json();
        setTemplates(data.codeTemplates);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic here when needed
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="bg-gray-100 py-20">
      <div className="container mx-auto text-center px-4">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-800">Templates</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
          Browse and use code templates shared by our community.
        </p>
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full max-w-md px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 border-2 border-blue-500 border-r-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-r-lg transition duration-300 text-white"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Templates List */}
        {loading ? (
          <p>Loading templates...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.length > 0 ? (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
                >
                  <h3 className="font-semibold text-xl text-gray-800 mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <a
                    href={`/templates/${template.id}`}
                    className="text-blue-500 hover:text-blue-600 font-semibold"
                  >
                    Use Template →
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-3 text-center">No templates found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;