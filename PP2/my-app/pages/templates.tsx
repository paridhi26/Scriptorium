import React, { useEffect, useState } from 'react';
import { fetchTemplates } from '../lib/api';

interface Template {
  id: number;
  title: string;
  description: string;
  code: string;
}

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await fetchTemplates();
        setTemplates(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    loadTemplates();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Templates</h1>
      <ul>
        {templates.map(template => (
          <li key={template.id}>
            <h2>{template.title}</h2>
            <p>{template.description}</p>
            <pre>{template.code}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Templates;