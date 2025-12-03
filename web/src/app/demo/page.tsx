'use client';

import React, { useState, useEffect } from 'react';
import StarfieldBackground from '@/components/StarfieldBackground';
import DemoTerminalLayout from './DemoTerminalLayout';
import { demoClient, DemoAccessRequest } from '@/lib/demoClient';
import '@/styles/demo/demo.scss';

export default function DemoPage() {
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [formData, setFormData] = useState<DemoAccessRequest>({
    name: '',
    organization: '',
    email: '',
    phone: '',
    use_case: '',
    questions: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('ghostquant_demo_tour_seen');
    if (!hasSeenTour) {
      setTimeout(() => setShowTour(true), 2000);
    }
  }, []);

  const handleTourNext = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setShowTour(false);
      localStorage.setItem('ghostquant_demo_tour_seen', 'true');
    }
  };

  const handleTourSkip = () => {
    setShowTour(false);
    localStorage.setItem('ghostquant_demo_tour_seen', 'true');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await demoClient.requestAccess(formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  const tourSteps = [
    {
      title: 'Welcome to GhostQuant Demo',
      description: 'This is a live demonstration of the GhostQuant Terminal with synthetic intelligence data. Explore all features safely!',
    },
    {
      title: 'Global Risk Gauge',
      description: 'Monitor real-time global threat levels across all monitored entities and chains.',
    },
    {
      title: 'Intelligence Panels',
      description: 'Each panel shows live intelligence from different detection engines: Prediction, Fusion, Hydra, Constellation, and more.',
    },
    {
      title: 'Live Intelligence Feed',
      description: 'Watch synthetic intelligence events stream in real-time, color-coded by severity level.',
    },
    {
      title: 'Ready to Get Started?',
      description: 'Click "Request Full Enterprise Access" to connect with our team and unlock the real GhostQuant platform.',
    },
  ];

  return (
    <div className="demoTerminal">
      <StarfieldBackground />

      {/* Demo Header */}
      <div className="demoHeader">
        <div className="demoHeaderContent">
          <div className="demoTitle">🛡️ GhostQuant Live Demo Terminal</div>
          <div className="demoBadge">DEMO MODE - SYNTHETIC DATA</div>
        </div>
      </div>

      {/* Demo Container */}
      <div className="demoContainer">
        {/* Disclaimer */}
        <div className="demoDisclaimer">
          <div className="disclaimerText">
            <strong>DEMO MODE:</strong> This terminal uses synthetic intelligence data for demonstration purposes only. 
            All events, entities, and threats are simulated. No real blockchain data or threat detection is active.
          </div>
        </div>

        {/* Demo Terminal Layout */}
        <DemoTerminalLayout onRequestAccess={() => setShowConversionModal(true)} />
      </div>

      {/* Conversion Button */}
      <button
        className="demoConversionButton"
        onClick={() => setShowConversionModal(true)}
      >
        Request Full Enterprise Access
      </button>

      {/* Guided Tour */}
      {showTour && (
        <div className="tourTooltip" style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
          <div className="tourTooltipContent">
            <h4>{tourSteps[tourStep].title}</h4>
            <p>{tourSteps[tourStep].description}</p>
          </div>
          <div className="tourTooltipActions">
            <button className="tourButton" onClick={handleTourSkip}>
              Skip Tour
            </button>
            <button className="tourButton primary" onClick={handleTourNext}>
              {tourStep < tourSteps.length - 1 ? 'Next' : 'Get Started'}
            </button>
          </div>
        </div>
      )}

      {/* Conversion Modal */}
      {showConversionModal && (
        <div className="conversionModal" onClick={() => setShowConversionModal(false)}>
          <div className="conversionModalContent" onClick={(e) => e.stopPropagation()}>
            {!submitted ? (
              <>
                <div className="conversionModalHeader">
                  <h2 className="conversionModalTitle">Request Enterprise Access</h2>
                  <p className="conversionModalSubtitle">
                    Get full access to GhostQuant's real-time threat intelligence platform
                  </p>
                </div>

                <form className="conversionForm" onSubmit={handleFormSubmit}>
                  <div className="formGroup">
                    <label className="formLabel">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="formInput"
                      required
                    />
                  </div>

                  <div className="formGroup">
                    <label className="formLabel">Organization *</label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleFormChange}
                      className="formInput"
                      required
                    />
                  </div>

                  <div className="formGroup">
                    <label className="formLabel">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="formInput"
                      required
                    />
                  </div>

                  <div className="formGroup">
                    <label className="formLabel">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="formInput"
                    />
                  </div>

                  <div className="formGroup">
                    <label className="formLabel">Use Case *</label>
                    <select
                      name="use_case"
                      value={formData.use_case}
                      onChange={handleFormChange}
                      className="formSelect"
                      required
                    >
                      <option value="">Select a use case</option>
                      <option value="enterprise">Enterprise Threat Detection</option>
                      <option value="government">Government / Law Enforcement</option>
                      <option value="exchange">Cryptocurrency Exchange</option>
                      <option value="compliance">Compliance & Regulatory</option>
                      <option value="research">Research & Analysis</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="formGroup">
                    <label className="formLabel">Questions or Requirements</label>
                    <textarea
                      name="questions"
                      value={formData.questions}
                      onChange={handleFormChange}
                      className="formTextarea"
                      rows={4}
                    />
                  </div>

                  <div className="formActions">
                    <button
                      type="button"
                      className="formButton secondary"
                      onClick={() => setShowConversionModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="formButton primary">
                      Submit Request
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="conversionSuccess">
                <div className="successIcon">✅</div>
                <h3>Request Submitted Successfully!</h3>
                <p>
                  Thank you for your interest in GhostQuant. Our enterprise team will contact you within 24 hours 
                  to discuss your requirements and provide access to the full platform.
                </p>
                <button
                  className="formButton primary"
                  onClick={() => {
                    setShowConversionModal(false);
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      organization: '',
                      email: '',
                      phone: '',
                      use_case: '',
                      questions: '',
                    });
                  }}
                  style={{ marginTop: '24px' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
