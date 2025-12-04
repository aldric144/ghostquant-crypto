'use client';

import React, { useState } from 'react';
import { APIEndpointDoc } from '@/lib/apiDocsClient';

interface APICodeExamplesProps {
  endpoint: APIEndpointDoc | null;
}

export default function APICodeExamples({ endpoint }: APICodeExamplesProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python_requests');

  if (!endpoint) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#64748B',
      }}>
        Select an endpoint to view code examples
      </div>
    );
  }

  const languages = [
    { id: 'python_requests', name: 'Python (requests)' },
    { id: 'python_async', name: 'Python (async)' },
    { id: 'javascript_fetch', name: 'JavaScript (fetch)' },
    { id: 'javascript_node', name: 'Node.js' },
    { id: 'curl', name: 'cURL' },
    { id: 'go', name: 'Go' },
    { id: 'java', name: 'Java' },
  ];

  const handleCopy = () => {
    if (endpoint.code_examples && endpoint.code_examples[selectedLanguage]) {
      navigator.clipboard.writeText(endpoint.code_examples[selectedLanguage]);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#F1F5F9',
      }}>
        Code Examples
      </h3>

      {/* Language Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        borderBottom: '2px solid #334155',
        paddingBottom: '8px',
      }}>
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setSelectedLanguage(lang.id)}
            style={{
              padding: '8px 16px',
              background: selectedLanguage === lang.id ? '#22E0FF' : 'transparent',
              border: selectedLanguage === lang.id ? 'none' : '1px solid #334155',
              borderRadius: '6px',
              color: selectedLanguage === lang.id ? '#0F172A' : '#94A3B8',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (selectedLanguage !== lang.id) {
                e.currentTarget.style.borderColor = '#475569';
                e.currentTarget.style.color = '#F1F5F9';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedLanguage !== lang.id) {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.color = '#94A3B8';
              }
            }}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {/* Code Display */}
      {endpoint.code_examples && endpoint.code_examples[selectedLanguage] ? (
        <div style={{ position: 'relative' }}>
          <button
            onClick={handleCopy}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '8px 16px',
              background: 'rgba(55, 255, 176, 0.2)',
              border: '1px solid #37FFB0',
              borderRadius: '6px',
              color: '#37FFB0',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            Copy
          </button>
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #334155',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            color: '#94A3B8',
            overflowX: 'auto',
            maxHeight: '600px',
            overflowY: 'auto',
          }}>
            <pre style={{ margin: 0 }}>
              {endpoint.code_examples[selectedLanguage]}
            </pre>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '24px',
          background: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid #334155',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#64748B',
        }}>
          Code example not available for this language
        </div>
      )}

      {/* Additional Info */}
      <div style={{
        padding: '16px',
        background: 'rgba(34, 224, 255, 0.1)',
        border: '1px solid rgba(34, 224, 255, 0.3)',
        borderRadius: '8px',
      }}>
        <h4 style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: '#22E0FF',
          marginBottom: '8px',
        }}>
          Quick Start
        </h4>
        <p style={{
          fontSize: '0.75rem',
          color: '#94A3B8',
          lineHeight: '1.6',
          margin: 0,
        }}>
          Copy the code example above and replace placeholder values with your actual data. 
          Make sure to handle authentication if required and check the response for errors.
        </p>
      </div>
    </div>
  );
}
