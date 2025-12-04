'use client';

import React, { useState, useEffect } from 'react';
import StarfieldBackground from '@/components/StarfieldBackground';
import SalesLeadList from './SalesLeadList';
import SalesLeadDetails from './SalesLeadDetails';
import SalesPipelineSummaryComponent from './SalesPipelineSummary';
import SalesInvestorView from './SalesInvestorView';
import { salesClient, SalesLead, SalesPipelineSummary, LeadSource, LeadCategory } from '@/lib/salesClient';

export default function SalesPage() {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>();
  const [leadDetails, setLeadDetails] = useState<any>(null);
  const [summary, setSummary] = useState<SalesPipelineSummary | null>(null);
  const [investorData, setInvestorData] = useState<any>(null);
  const [activeView, setActiveView] = useState<'pipeline' | 'investor'>('pipeline');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    title: '',
    source: LeadSource.WEBSITE,
    category: LeadCategory.ENTERPRISE,
    use_case: '',
    requirements: '',
    estimated_value: '',
  });

  const fetchLeads = async () => {
    try {
      const data = await salesClient.listLeads();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await salesClient.getPipelineSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const fetchInvestorData = async () => {
    try {
      const data = await salesClient.getInvestorView();
      setInvestorData(data);
    } catch (error) {
      console.error('Failed to fetch investor data:', error);
    }
  };

  const fetchLeadDetails = async (leadId: string) => {
    try {
      const data = await salesClient.getLeadDetails(leadId);
      setLeadDetails(data);
    } catch (error) {
      console.error('Failed to fetch lead details:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLeads(), fetchSummary(), fetchInvestorData()]);
      setLoading(false);
    };
    loadData();

    const interval = setInterval(() => {
      fetchLeads();
      fetchSummary();
      fetchInvestorData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedLeadId) {
      fetchLeadDetails(selectedLeadId);
    }
  }, [selectedLeadId]);

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await salesClient.createLead({
        name: formData.name,
        organization: formData.organization,
        email: formData.email,
        phone: formData.phone || undefined,
        title: formData.title || undefined,
        source: formData.source,
        category: formData.category,
        use_case: formData.use_case,
        requirements: formData.requirements || undefined,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : undefined,
      });
      setShowCreateForm(false);
      setFormData({
        name: '',
        organization: '',
        email: '',
        phone: '',
        title: '',
        source: LeadSource.WEBSITE,
        category: LeadCategory.ENTERPRISE,
        use_case: '',
        requirements: '',
        estimated_value: '',
      });
      await fetchLeads();
      await fetchSummary();
    } catch (error) {
      console.error('Failed to create lead:', error);
      alert('Failed to create lead');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
          Loading Sales Pipeline...
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
              🚀 Enterprise Sales Pipeline
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: '#94A3B8',
            }}>
              Complete acquisition workflow & AI-driven insights
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}>
            <button
              onClick={() => setActiveView('pipeline')}
              style={{
                padding: '10px 20px',
                background: activeView === 'pipeline' ? '#22E0FF' : 'transparent',
                border: `2px solid #22E0FF`,
                borderRadius: '8px',
                color: activeView === 'pipeline' ? '#0F172A' : '#22E0FF',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              Pipeline View
            </button>
            <button
              onClick={() => setActiveView('investor')}
              style={{
                padding: '10px 20px',
                background: activeView === 'investor' ? '#A78BFA' : 'transparent',
                border: `2px solid #A78BFA`,
                borderRadius: '8px',
                color: activeView === 'investor' ? '#0F172A' : '#A78BFA',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              Investor View
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                padding: '10px 20px',
                background: '#37FFB0',
                border: 'none',
                borderRadius: '8px',
                color: '#0F172A',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(55, 255, 176, 0.4)',
              }}
            >
              + New Lead
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1800px',
        margin: '0 auto',
        padding: '24px',
      }}>
        {activeView === 'pipeline' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '350px 1fr 400px',
            gap: '24px',
          }}>
            {/* Left Panel - Lead List */}
            <div style={{
              padding: '24px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '2px solid #334155',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#F1F5F9',
                marginBottom: '16px',
              }}>
                Leads ({leads.length})
              </h2>
              <SalesLeadList
                leads={leads}
                selectedLeadId={selectedLeadId}
                onSelectLead={handleSelectLead}
              />
            </div>

            {/* Center Panel - Pipeline Summary */}
            <div style={{
              padding: '24px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '2px solid #334155',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#F1F5F9',
                marginBottom: '16px',
              }}>
                Pipeline Overview
              </h2>
              <SalesPipelineSummaryComponent summary={summary} />
            </div>

            {/* Right Panel - Lead Details */}
            <div style={{
              padding: '24px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '2px solid #334155',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#F1F5F9',
                marginBottom: '16px',
              }}>
                Lead Details
              </h2>
              <SalesLeadDetails
                leadDetails={leadDetails}
                onRefresh={() => selectedLeadId && fetchLeadDetails(selectedLeadId)}
              />
            </div>
          </div>
        ) : (
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            <SalesInvestorView investorData={investorData} />
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
        }} onClick={() => setShowCreateForm(false)}>
          <div style={{
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '48px',
            background: '#0F172A',
            border: '2px solid #22E0FF',
            borderRadius: '16px',
            boxShadow: '0 0 40px rgba(34, 224, 255, 0.4)',
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#22E0FF',
              marginBottom: '24px',
            }}>
              Create New Lead
            </h2>

            <form onSubmit={handleCreateLead} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#F1F5F9',
                  marginBottom: '8px',
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '2px solid #334155',
                    borderRadius: '8px',
                    color: '#F1F5F9',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#F1F5F9',
                  marginBottom: '8px',
                }}>
                  Organization *
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleFormChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '2px solid #334155',
                    borderRadius: '8px',
                    color: '#F1F5F9',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#F1F5F9',
                    marginBottom: '8px',
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '2px solid #334155',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#F1F5F9',
                    marginBottom: '8px',
                  }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '2px solid #334155',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                      fontSize: '1rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#F1F5F9',
                    marginBottom: '8px',
                  }}>
                    Source *
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '2px solid #334155',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                      fontSize: '1rem',
                    }}
                  >
                    {Object.values(LeadSource).map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#F1F5F9',
                    marginBottom: '8px',
                  }}>
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '2px solid #334155',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                      fontSize: '1rem',
                    }}
                  >
                    {Object.values(LeadCategory).map((category) => (
                      <option key={category} value={category}>{category.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#F1F5F9',
                  marginBottom: '8px',
                }}>
                  Use Case *
                </label>
                <textarea
                  name="use_case"
                  value={formData.use_case}
                  onChange={handleFormChange}
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '2px solid #334155',
                    borderRadius: '8px',
                    color: '#F1F5F9',
                    fontSize: '1rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: '#22E0FF',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Create Lead
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: 'transparent',
                    border: '2px solid #334155',
                    borderRadius: '8px',
                    color: '#94A3B8',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
