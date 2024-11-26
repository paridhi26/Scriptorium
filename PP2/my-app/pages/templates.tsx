import React, { useEffect, useState } from "react";
import Layout from '../components/Layout';

interface Template {
  id: number;
  title: string;
  description: string;
  code: string;
  languageId: number;
  tags: string[];
}

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Fetch all templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/visitor/allTemplates");
        const data = await response.json();
        setTemplates(data.templates);
        setFilteredTemplates(data.templates); // Initially show all templates
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  // Filter templates based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = templates.filter(
      (template) =>
        template.title.toLowerCase().includes(query) ||
        template.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        template.description.toLowerCase().includes(query)
    );
    setFilteredTemplates(filtered);
  }, [searchQuery, templates]);

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Code Templates</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search templates by title, tags, or content..."
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Template List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="p-4 border rounded shadow hover:bg-gray-100 cursor-pointer"
            onClick={() => setSelectedTemplate(template)}
          >
            <h2 className="text-xl font-semibold">{template.title}</h2>
            <p className="text-gray-600">{template.description}</p>
            <div className="mt-2">
              {template.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm mr-2"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Template Details and Editor */}
      {selectedTemplate && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">{selectedTemplate.title}</h2>
          <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>

          <textarea
            value={selectedTemplate.code}
            onChange={(e) =>
              setSelectedTemplate({
                ...selectedTemplate,
                code: e.target.value,
              })
            }
            rows={10}
            className="w-full border rounded p-2 mb-4"
          />

          <div className="flex space-x-4">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => alert("Code executed!") /* Integrate run logic here */}
            >
              Run Code
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={async () => {
                try {
                  const response = await fetch("/api/templates/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(selectedTemplate),
                  });

                  if (response.ok) {
                    alert("Template saved successfully!");
                  } else {
                    alert("Failed to save template.");
                  }
                } catch (error) {
                  console.error("Error saving template:", error);
                }
              }}
            >
              Save Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;