import React, { useState } from 'react';
import Layout from '../components/Layout'; // Import your Layout component

const Editor: React.FC = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleExecuteCode = () => {
    // Simulate running the code (for now)
    setOutput(`Executed code:\n${code}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-center mb-6">Online Code Editor</h1>
        
        {/* Code Editor Section */}
        <div className="flex flex-col gap-1">
          {/* Code Editor */}
          <div className="w-full">
            <textarea
              value={code}
              onChange={handleCodeChange}
              rows={20}
              className="w-full p-4 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none resize-none"
              placeholder="Write your code here..."
            />
          </div>

          {/* Execute Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleExecuteCode}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Execute Code
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="mt-6">
          <div className="p-6 bg-gray-700 text-white rounded-md">
            <h3 className="font-semibold text-xl">Output:</h3>
            <pre className="whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Editor;