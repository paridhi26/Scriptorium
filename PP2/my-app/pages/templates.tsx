import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

type Template = {
  id: number;
  title: string;
  description: string;
  tags: { id: number; tag: string }[];
  upvotes: number;
  downvotes: number;
};

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10; // Number of templates per page

  const fetchTemplates = async (page: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/visitors/allTemplates', {
        params: { page, pageSize },
      });

      const { codeTemplates, totalPages } = response.data;
      setTemplates(codeTemplates);
      setTotalPages(totalPages);
    } catch (err) {
      setError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(currentPage);
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) return <p>Loading templates...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 className="text-3xl font-bold mb-6 text-center">Code Templates</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {templates.map((template) => (
          <Link key={template.id} href={`/templates/${template.id}`}>
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = 'scale(1.02)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'scale(1)')
              }
            >
              <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>{template.title}</h2>
              <p style={{ marginBottom: '10px', color: '#555' }}>{template.description}</p>
              <div style={{ marginBottom: '10px' }}>
                <strong>Tags: </strong>
                {template.tags.map((tag) => (
                  <span
                    key={tag.id}
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      borderRadius: '5px',
                      padding: '2px 8px',
                      marginRight: '5px',
                      fontSize: '0.9em',
                    }}
                  >
                    {tag.tag}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#28a745',
                    fontWeight: 'bold',
                  }}
                >
                  👍 {template.upvotes}
                </span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#dc3545',
                    fontWeight: 'bold',
                  }}
                >
                  👎 {template.downvotes}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Previous
        </button>
        <span style={{ margin: '0 10px', fontWeight: 'bold' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          style={{
            padding: '10px 20px',
            marginLeft: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TemplatesPage;