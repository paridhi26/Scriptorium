import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { php } from '@codemirror/lang-php';

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
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Authentication check
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

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

  // ------------------------------------ Handle Save Template Feature ---------------------------------------
  const handleSaveClick = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!loggedIn) {
      alert('Login first to use this feature.');
      return;
    }
  
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('Login session expired. Please log in again.');
      return;
    }
  
    const tagArray = tags.split(',').map(tag => tag.trim()); // Convert comma-separated tags to an array
  
    const payload = {
      title,
      description,
      code,
      languageId: supportedLanguages.find((lang) => lang.value === language)?.value ?? 1, // Assign the correct languageId
      tags: tagArray,
    };
  
    try {
      const response = await fetch('/api/users/saveCodeTemp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`, // Add token here
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || 'Error saving template.');
      }
  
      alert('Template saved successfully!');
      setShowPopup(false); // Close the popup after successful save
    } catch (error: any) {
      alert(error.message || 'An error occurred while saving the template.');
    }
  };

  const currentLanguageExtension = supportedLanguages.find(
    (lang) => lang.value === language
  )?.extension;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-8">Scriptorium: Online Code Editor</h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <div className="flex space-x-2 mt-2 sm:mt-0">
              <button
                onClick={handleExecuteCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                Execute Code
              </button>
              <button
                onClick={handleSaveClick}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
              >
                Save as Template
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                className="w-full p-4 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={`Optional input for your ${language} program...`}
              />
            </div>
            <div className="bg-gray-100 rounded-md p-4">
              <h3 className="font-semibold text-xl mb-2">Output:</h3>
              <div className="h-[400px] bg-white border border-gray-300 rounded-md p-4 overflow-auto">
                {error && <p className="text-red-600 mb-2">{error}</p>}
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Save Template</h3>
            <form onSubmit={handleSaveTemplate}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
