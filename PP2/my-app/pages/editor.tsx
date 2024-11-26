import React, { useState } from 'react';
// import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';

const Editor: React.FC = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  // const { data: session } = useSession();

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleExecuteCode = () => {
    // Simulate running the code (for now)
    setOutput(`Executed ${language} code:\n${code}`);
  };

  const handleSaveTemplate = () => {
    // if (session) {
    //   // Implement save logic here
    //   alert("Template saved successfully!");
    // } else {
    //   alert("Please log in to save templates.");
    // }
  };

  return (
    <Layout>
      <div className="w-full min-h-screen p-4">
        <h1 className="text-2xl font-semibold text-center mb-6">Scriptorium: Online Code Editor</h1>

        {/* Language Selector */}
        <div className="mb-4">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        {/* Code Editor and Output Section */}
        <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)] min-h-[400px]">
          {/* Code Editor */}
          <div className="flex-1">
            <textarea
              value={code}
              onChange={handleCodeChange}
              rows={20}
              className="w-full h-full p-4 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-auto"
              placeholder={`Write your ${language} code here...`}
            />
          </div>

          {/* Output Section */}
          <div className="flex-1 h-full">
            <div className="h-full p-6 bg-gray-700 text-white rounded-md overflow-auto">
              <h3 className="font-semibold text-xl mb-2">Output:</h3>
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
    </Layout>
  );
};

export default Editor;
