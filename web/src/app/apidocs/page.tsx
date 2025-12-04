'use client';

import React, { useState, useEffect } from 'react';
import StarfieldBackground from '@/components/StarfieldBackground';
import APIEndpointList from './APIEndpointList';
import APIEndpointDetails from './APIEndpointDetails';
import APITestConsole from './APITestConsole';
import APICodeExamples from './APICodeExamples';
import { apiDocsClient, APIEndpointDoc, APISection, APIDocsSummary } from '@/lib/apiDocsClient';

export default function APIDocsPage() {
  const [sections, setSections] = useState<APISection[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpointDoc[]>([]);
  const [filteredEndpoints, setFilteredEndpoints] = useState<APIEndpointDoc[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpointDoc | null>(null);
  const [summary, setSummary] = useState<APIDocsSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'test' | 'examples'>('details');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [summaryData, endpointsData] = await Promise.all([
          apiDocsClient.getSummary(),
          apiDocsClient.getEndpoints(),
        ]);
        
        setSummary(summaryData);
        setSections(summaryData.sections);
        setEndpoints(endpointsData.endpoints);
        setFilteredEndpoints(endpointsData.endpoints);
      } catch (error) {
        console.error('Failed to load API docs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = endpoints;

    if (selectedSection) {
      filtered = filtered.filter(e => e.section === selectedSection);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.path.toLowerCase().includes(query) ||
        e.summary.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query)
      );
    }

    setFilteredEndpoints(filtered);
  }, [selectedSection, searchQuery, endpoints]);

  useEffect(() => {
    if (selectedEndpointId) {
      const loadEndpoint = async () => {
        try {
          const endpoint = await apiDocsClient.getEndpoint(selectedEndpointId);
          setSelectedEndpoint(endpoint);
        } catch (error) {
          console.error('Failed to load endpoint:', error);
        }
      };
      loadEndpoint();
    } else {
      setSelectedEndpoint(null);
    }
  }, [selectedEndpointId]);

  const handleSelectSection = (sectionId: string) => {
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    } else {
      setSelectedSection(sectionId);
    }
  };

  const handleSelectEndpoint = (endpointId: string) => {
    setSelectedEndpointId(endpointId);
    setActiveTab('details');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <StarfieldBackground />
        <div style={{
          fontSize: '1.5rem',
          color: '#22E0FF',
          fontWeight: 700,
        }}>
          Loading API Documentation...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F172A',
      color: '#F1F5F9',
      position: 'relative',
    }}>
      <StarfieldBackground />

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '16px 24px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '2px solid #22E0FF',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(34, 224, 255, 0.3)',
      }}>
        <div style={{
          maxWidth: '1800px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#22E0FF',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '4px',
            }}>
              📚 GhostQuant API Documentation
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: '#94A3B8',
            }}>
              Complete enterprise-grade API reference with interactive testing
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}>
            {summary && (
              <>
                <div style={{
                  padding: '8px 16px',
                  background: 'rgba(34, 224, 255, 0.2)',
                  border: '1px solid #22E0FF',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#22E0FF',
                }}>
                  {summary.total_endpoints} Endpoints
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: 'rgba(167, 139, 250, 0.2)',
                  border: '1px solid #A78BFA',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#A78BFA',
                }}>
                  {summary.total_sections} Sections
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div style={{
        maxWidth: '1800px',
        margin: '0 auto',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '280px 400px 1fr',
        gap: '24px',
        minHeight: 'calc(100vh - 120px)',
      }}>
        {/* Left Column - Navigation */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Search */}
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '2px solid #334155',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}>
            <input
              type="text"
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#F1F5F9',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Sections */}
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '2px solid #334155',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            maxHeight: 'calc(100vh - 280px)',
            overflowY: 'auto',
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}>
              API Sections
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              {sections.map((section) => (
                <button
                  key={section.section_id}
                  onClick={() => handleSelectSection(section.section_id)}
                  style={{
                    padding: '10px 12px',
                    background: selectedSection === section.section_id
                      ? 'rgba(34, 224, 255, 0.2)'
                      : 'transparent',
                    border: `1px solid ${selectedSection === section.section_id ? '#22E0FF' : 'transparent'}`,
                    borderRadius: '6px',
                    color: selectedSection === section.section_id ? '#22E0FF' : '#94A3B8',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSection !== section.section_id) {
                      e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)';
                      e.currentTarget.style.color = '#F1F5F9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSection !== section.section_id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#94A3B8';
                    }
                  }}
                >
                  <span>{section.icon}</span>
                  <span>{section.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column - Endpoint List */}
        <div style={{
          padding: '24px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '2px solid #334155',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          maxHeight: 'calc(100vh - 160px)',
          overflowY: 'auto',
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '16px',
          }}>
            {selectedSection
              ? sections.find(s => s.section_id === selectedSection)?.name
              : 'All Endpoints'} ({filteredEndpoints.length})
          </h2>
          <APIEndpointList
            endpoints={filteredEndpoints}
            selectedEndpointId={selectedEndpointId || undefined}
            onSelectEndpoint={handleSelectEndpoint}
          />
        </div>

        {/* Right Column - Details/Test/Examples */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Tabs */}
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '2px solid #334155',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
            }}>
              <button
                onClick={() => setActiveTab('details')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: activeTab === 'details' ? '#22E0FF' : 'transparent',
                  border: `1px solid ${activeTab === 'details' ? '#22E0FF' : '#334155'}`,
                  borderRadius: '6px',
                  color: activeTab === 'details' ? '#0F172A' : '#94A3B8',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('test')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: activeTab === 'test' ? '#37FFB0' : 'transparent',
                  border: `1px solid ${activeTab === 'test' ? '#37FFB0' : '#334155'}`,
                  borderRadius: '6px',
                  color: activeTab === 'test' ? '#0F172A' : '#94A3B8',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Test
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: activeTab === 'examples' ? '#A78BFA' : 'transparent',
                  border: `1px solid ${activeTab === 'examples' ? '#A78BFA' : '#334155'}`,
                  borderRadius: '6px',
                  color: activeTab === 'examples' ? '#0F172A' : '#94A3B8',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Examples
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{
            padding: '24px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '2px solid #334155',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            maxHeight: 'calc(100vh - 260px)',
            overflowY: 'auto',
          }}>
            {activeTab === 'details' && <APIEndpointDetails endpoint={selectedEndpoint} />}
            {activeTab === 'test' && <APITestConsole endpoint={selectedEndpoint} />}
            {activeTab === 'examples' && <APICodeExamples endpoint={selectedEndpoint} />}
          </div>
        </div>
      </div>
    </div>
  );
}
