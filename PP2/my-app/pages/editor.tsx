import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { php } from '@codemirror/lang-php';
import Layout from '../components/Layout';

// Supported languages
const supportedLanguages = [
  { value: 'javascript', label: 'JavaScript', extension: javascript },
  { value: 'python', label: 'Python', extension: python },
  { value: 'java', label: 'Java', extension: java },
  { value: 'cpp', label: 'C++', extension: cpp },
  { value: 'c', label: 'C', extension: cpp }, // Using C++ extension for C
  { value: 'rust', label: 'Rust', extension: rust },
  { value: 'php', label: 'PHP', extension: php },
  { value: 'ruby', label: 'Ruby', extension: null }, // No CodeMirror extension, fallback to plain text
  { value: 'go', label: 'Go', extension: null }, // No CodeMirror extension, fallback to plain text
  { value: 'perl', label: 'Perl', extension: null }, // No CodeMirror extension, fallback to plain text
];

const Editor: React.FC = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [error, setError] = useState('');
  const [input, setInput] = useState('');

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

      setOutput(data.stdout || 'No output');
    } catch (err: any) {
      setOutput('');
      setError(err.message || 'An error occurred while executing the code.');
    }
  };

  const handleSaveTemplate = () => {
    // if (session) {
    //   // Implement save logic here
    //   alert("Template saved successfully!");
    // } else {
    //   alert("Please log in to save templates.");
    // }
  };

  // Get the CodeMirror extension for the selected language
  const currentLanguageExtension = supportedLanguages.find(
    (lang) => lang.value === language
  )?.extension;

  return (
      <div className="w-full min-h-screen p-4">
        <h1 className="text-2xl font-semibold text-center mb-6">Scriptorium: Online Code Editor</h1>

        {/* Language Selector */}
        <div className="mb-4">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Code Editor and Output Section */}
        <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-300px)] min-h-[400px]">
          {/* Code Editor */}
          <div className="flex-1">
            <CodeMirror
              value={code}
              extensions={currentLanguageExtension ? [currentLanguageExtension()] : []}
              onChange={(value) => handleCodeChange(value)}
              className="h-full"
              theme="dark"
              placeholder={`Write your ${language} code here...`}
            />
          </div>

          {/* Input Section */}
          <div className="flex-1">
            <textarea
              value={input}
              onChange={handleInputChange}
              rows={5}
              className="w-full p-4 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-auto"
              placeholder={`Optional input for your ${language} program...`}
            />
          </div>

          {/* Output Section */}
          <div className="flex-1 h-full">
            <div className="h-full p-6 bg-gray-700 text-white rounded-md overflow-auto">
              <h3 className="font-semibold text-xl mb-2">Output:</h3>
              {error && <p className="text-red-400">{error}</p>}
              <pre className="whitespace-pre-wrap overflow-auto h-[calc(100%-2rem)]">{output}</pre>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleExecuteCode}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Execute Code
          </button>
          <button
            onClick={handleSaveTemplate}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Save as Template
          </button>
        </div>
      </div>
  );
};

export default Editor;
