// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { php } from '@codemirror/lang-php';

// Supported programming languages and their extensions
const supportedLanguages = [
  { value: 'javascript', label: 'JavaScript', extension: javascript },
  { value: 'python', label: 'Python', extension: python },
  { value: 'java', label: 'Java', extension: java },
  { value: 'cpp', label: 'C++', extension: cpp },
  { value: 'c', label: 'C', extension: cpp },
  { value: 'rust', label: 'Rust', extension: rust },
  { value: 'php', label: 'PHP', extension: php },
  { value: 'ruby', label: 'Ruby', extension: null },
  { value: 'go', label: 'Go', extension: null },
  { value: 'perl', label: 'Perl', extension: null },
];

const Editor: React.FC = () => {
  // State for managing code, output, language, errors, and user inputs
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string>('');

  // Check authentication status on component mount
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    setLoggedIn(!!authToken);
  }, []);

  // Handle changes in the code editor
  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  // Handle language selection change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  // Handle changes in the optional input field
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Execute the code and fetch the output from the server
  const handleExecuteCode = async () => {
    setError('');
    setOutput('Running...');

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language, code, input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.stderr || data.message || 'Execution failed');
      }

      const combinedOutput = `${data.stdout || 'No output'}\n${data.stderr || ''}`;
      setOutput(combinedOutput.trim());
    } catch (err: any) {
      setOutput('');
      setError(err.message || 'An error occurred while executing the code.');
    }
  };

  // Handle saving the code as a template
  const handleSaveClick = () => {
    if (!loggedIn) {
      alert('Login first to use this feature.');
      return;
    }

    setShowPopup(true);
  };

  // Submit the save template request to the server
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('Login session expired. Please log in again.');
      return;
    }

    const tagArray = tags.split(',').map((tag) => tag.trim());

    // Map the selected language to its corresponding database ID
    const languageIdMapping: Record<string, number> = {
      javascript: 1,
      python: 2,
      java: 3,
      cpp: 4,
      c: 5,
      rust: 6,
      php: 7,
      ruby: 8,
      go: 9,
      perl: 10,
    };

    const languageId = languageIdMapping[language];

    if (!languageId) {
      alert(`Unsupported language: ${language}`);
      return;
    }

    const payload = {
      title,
      description,
      code,
      languageId,
      tags: tagArray.length > 0 ? tagArray : null,
    };

    try {
      const response = await fetch('/api/users/saveCodeTemp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error saving template.');
      }

      alert('Template saved successfully!');
      setShowPopup(false);
    } catch (error: any) {
      alert(error.message || 'An error occurred while saving the template.');
    }
  };

  // Get the language extension for the selected programming language
  const currentLanguageExtension = supportedLanguages.find(
    (lang) => lang.value === language
  )?.extension;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-8">Scriptorium: Online Code Editor</h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between mb-4">
            {/* Language selection dropdown */}
            <select
              value={language}
              onChange={handleLanguageChange}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>

            {/* Execute and Save buttons */}
            <div className="flex space-x-2 mt-2 sm:mt-0">
              <button
                onClick={handleExecuteCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Execute Code
              </button>
              <button
                onClick={handleSaveClick}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Save as Template
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code editor and input */}
            <div className="space-y-4">
              <div className="border rounded-md overflow-hidden">
                <CodeMirror
                  value={code}
                  extensions={currentLanguageExtension ? [currentLanguageExtension()] : []}
                  onChange={(value) => handleCodeChange(value)}
                  className="h-[400px]"
                  theme="dark"
                  placeholder={`Write your ${language} code here...`}
                />
              </div>
              <textarea
                value={input}
                onChange={handleInputChange}
                rows={5}
                className="w-full p-4 bg-gray-100 text-black rounded-md border focus:outline-none"
                placeholder={`Optional input for your ${language} program...`}
              />
            </div>

            {/* Output display */}
            <div className="bg-gray-100 rounded-md p-4">
              <h3 className="font-semibold text-xl mb-2">Output:</h3>
              <div className="h-[400px] bg-white border rounded-md p-4 overflow-auto">
                {error && <p className="text-red-600 mb-2">{error}</p>}
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Template Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Save Template</h3>
            <form onSubmit={handleSaveTemplate}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                  rows={4}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium">Tags (comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Template
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;






