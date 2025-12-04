'use client';

import React, { useState } from 'react';
import { APIEndpointDoc, apiDocsClient, APITestResult } from '@/lib/apiDocsClient';

interface APITestConsoleProps {
  endpoint: APIEndpointDoc | null;
}

export default function APITestConsole({ endpoint }: APITestConsoleProps) {
  const [params, setParams] = useState<string>('{}');
  const [body, setBody] = useState<string>('{}');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<APITestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!endpoint) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#64748B',
      }}>
        Select an endpoint to test
      </div>
    );
  }

  const handleTest = async () => {
    setTesting(true);
    setError(null);
    setTestResult(null);

    try {
      let parsedParams = {};
      let parsedBody = null;

      try {
        parsedParams = JSON.parse(params);
      } catch (e) {
        throw new Error('Invalid JSON in parameters');
      }

      if (body.trim()) {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          throw new Error('Invalid JSON in request body');
        }
      }

      const result = await apiDocsClient.testEndpoint(endpoint.endpoint_id, parsedParams, parsedBody);
      
      if (result.result) {
        setTestResult(result.result);
      } else {
        setError('Test failed: ' + JSON.stringify(result.validation));
      }
    } catch (e: any) {
      setError(e.message || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleGenerateTemplate = () => {
    const templateParams: any = {};
    if (endpoint.params) {
      endpoint.params.forEach(param => {
        templateParams[param.name] = 'value';
      });
    }
    if (endpoint.query_params) {
      endpoint.query_params.forEach(param => {
        templateParams[param.name] = 'value';
      });
    }
    setParams(JSON.stringify(templateParams, null, 2));

    if (endpoint.body_schema) {
      const templateBody: any = {};
      Object.keys(endpoint.body_schema).forEach(key => {
        templateBody[key] = 'value';
      });
      setBody(JSON.stringify(templateBody, null, 2));
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <div>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '16px',
        }}>
          Test Console
        </h3>

        <button
          onClick={handleGenerateTemplate}
          style={{
            padding: '8px 16px',
            background: 'rgba(167, 139, 250, 0.2)',
            border: '1px solid #A78BFA',
            borderRadius: '6px',
            color: '#A78BFA',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          Generate Template
        </button>
      </div>

      {/* Parameters Input */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#F1F5F9',
          marginBottom: '8px',
        }}>
          Parameters (JSON)
        </label>
        <textarea
          value={params}
          onChange={(e) => setParams(e.target.value)}
          rows={6}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#F1F5F9',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Body Input */}
      {endpoint.body_schema && (
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#F1F5F9',
            marginBottom: '8px',
          }}>
            Request Body (JSON)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#F1F5F9',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              resize: 'vertical',
            }}
          />
        </div>
      )}

      {/* Test Button */}
      <button
        onClick={handleTest}
        disabled={testing}
        style={{
          padding: '12px 24px',
          background: testing ? '#475569' : '#22E0FF',
          border: 'none',
          borderRadius: '8px',
          color: '#0F172A',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: testing ? 'not-allowed' : 'pointer',
          boxShadow: testing ? 'none' : '0 0 20px rgba(34, 224, 255, 0.4)',
        }}
      >
        {testing ? 'Testing...' : 'Send Request'}
      </button>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '16px',
          background: 'rgba(255, 59, 59, 0.1)',
          border: '1px solid rgba(255, 59, 59, 0.3)',
          borderRadius: '8px',
          color: '#FF3B3B',
          fontSize: '0.875rem',
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '12px',
          }}>
            Test Result
          </h4>

          {/* Status */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{
              padding: '8px 16px',
              background: testResult.success ? 'rgba(55, 255, 176, 0.2)' : 'rgba(255, 59, 59, 0.2)',
              border: `1px solid ${testResult.success ? 'rgba(55, 255, 176, 0.4)' : 'rgba(255, 59, 59, 0.4)'}`,
              borderRadius: '6px',
              color: testResult.success ? '#37FFB0' : '#FF3B3B',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}>
              Status: {testResult.status_code}
            </div>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(34, 224, 255, 0.2)',
              border: '1px solid rgba(34, 224, 255, 0.4)',
              borderRadius: '6px',
              color: '#22E0FF',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}>
              {testResult.response_time_ms.toFixed(2)}ms
            </div>
          </div>

          {/* Warnings */}
          {testResult.warnings && testResult.warnings.length > 0 && (
            <div style={{
              padding: '12px',
              background: 'rgba(255, 184, 77, 0.1)',
              border: '1px solid rgba(255, 184, 77, 0.3)',
              borderRadius: '6px',
              marginBottom: '16px',
            }}>
              <strong style={{ color: '#FFB84D' }}>Warnings:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#FFB84D' }}>
                {testResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Response Body */}
          <div>
            <h5 style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#F1F5F9',
              marginBottom: '8px',
            }}>
              Response Body
            </h5>
            <div style={{
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              color: '#94A3B8',
              overflowX: 'auto',
              maxHeight: '400px',
              overflowY: 'auto',
            }}>
              <pre style={{ margin: 0 }}>
                {typeof testResult.response_body === 'object'
                  ? JSON.stringify(testResult.response_body, null, 2)
                  : testResult.response_body}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
