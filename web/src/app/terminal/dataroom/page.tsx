'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
;

/**
 * GhostQuant Investor Data Room
 * 
 * 3-panel data room interface:
 * - Left: Folder tree navigation
 * - Middle: Content viewer
 * - Right: Metadata and actions
 */

import React, { useState, useEffect } from 'react';
import DataRoomClient, { DataRoomSummary, DataRoomSection } from './DataRoomClient';
import DataRoomViewer from './DataRoomViewer';
import DataRoomTree from './DataRoomTree';

export default function DataRoomPage() {
  const [client] = useState(() => new DataRoomClient());
  const [summary, setSummary] = useState<DataRoomSummary | null>(null);
  const [selectedSection, setSelectedSection] = useState<DataRoomSection | null>(null);
  const [selectedSectionName, setSelectedSectionName] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState<string>('investor');
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await client.getSummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data room');
      console.error('Failed to load summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSection = async (sectionName: string) => {
    try {
      setSectionLoading(true);
      setSelectedSectionName(sectionName);
      const section = await client.getSection(sectionName);
      setSelectedSection(section);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load section');
      console.error('Failed to load section:', err);
    } finally {
      setSectionLoading(false);
    }
  };

  const handleDownloadHTML = async () => {
    try {
      const html = await client.getHTML();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ghostquant_dataroom.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download HTML:', err);
    }
  };

  const handleDownloadMarkdown = async () => {
    try {
      const markdown = await client.getMarkdown();
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ghostquant_dataroom.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download Markdown:', err);
    }
  };

  const handleDownloadJSON = async () => {
    try {
      const json = await client.getJSON();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ghostquant_dataroom.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download JSON:', err);
    }
  };

  const handleDownloadZIP = async () => {
    try {
      const blob = await client.downloadZIP();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ghostquant_dataroom.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download ZIP:', err);
    }
  };

  const handleChangeAccessLevel = async (level: string) => {
    try {
      setAccessLevel(level);
      await client.setAccessLevel(level);
      await loadSummary();
      setSelectedSection(null);
      setSelectedSectionName(null);
    } catch (err) {
      console.error('Failed to change access level:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <TerminalBackButton className="mb-4" />
          <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-400">GhostQuant Investor Data Room</h1>
              <p className="text-sm text-gray-500 mt-1">Automated investor-grade due diligence documentation</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Access Level:</span>
                <select
                  value={accessLevel}
                  onChange={(e) => handleChangeAccessLevel(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="public">Public</option>
                  <option value="investor">Investor</option>
                  <option value="nda">NDA</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* 3-Panel Layout */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Panel: Folder Tree */}
        <div className="w-80 border-r border-gray-800 bg-gray-900/30">
          <DataRoomTree
            summary={summary}
            selectedSection={selectedSectionName}
            onSelectSection={handleSelectSection}
            loading={loading}
          />
        </div>

        {/* Middle Panel: Content Viewer */}
        <div className="flex-1 bg-black">
          <DataRoomViewer
            section={selectedSection}
            loading={sectionLoading}
          />
        </div>

        {/* Right Panel: Metadata & Actions */}
        <div className="w-80 border-l border-gray-800 bg-gray-900/30 overflow-y-auto">
          <div className="p-4">
            {/* Section Metadata */}
            {selectedSection && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Section Metadata
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Order:</span>
                    <span className="text-gray-300 ml-2">{selectedSection.order}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Classification:</span>
                    <span className="text-gray-300 ml-2">{selectedSection.classification}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Risk Level:</span>
                    <span className="text-gray-300 ml-2">{selectedSection.risk_level}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Files:</span>
                    <span className="text-gray-300 ml-2">{selectedSection.folder.files.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Export Actions */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Export Data Room
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleDownloadHTML}
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-4 py-2 text-sm text-gray-300 transition-colors duration-150"
                >
                  📄 Download HTML
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-4 py-2 text-sm text-gray-300 transition-colors duration-150"
                >
                  📝 Download Markdown
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-4 py-2 text-sm text-gray-300 transition-colors duration-150"
                >
                  📊 Download JSON
                </button>
                <button
                  onClick={handleDownloadZIP}
                  className="w-full bg-emerald-900 hover:bg-emerald-800 border border-emerald-700 rounded px-4 py-2 text-sm text-emerald-300 transition-colors duration-150 font-semibold"
                >
                  📦 Download ZIP Bundle
                </button>
              </div>
            </div>

            {/* Data Room Info */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Data Room Info
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Total Sections:</span>
                  <span className="text-gray-300 ml-2">{summary?.total_sections || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Current Access:</span>
                  <span className="text-gray-300 ml-2">{accessLevel}</span>
                </div>
              </div>
            </div>

            {/* Access Control Info */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Access Levels
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">🔓</span>
                  <div>
                    <div className="text-gray-300 font-semibold">Public</div>
                    <div className="text-gray-500">Marketing materials</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400">🔒</span>
                  <div>
                    <div className="text-gray-300 font-semibold">Investor</div>
                    <div className="text-gray-500">Due diligence materials</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">🔐</span>
                  <div>
                    <div className="text-gray-300 font-semibold">NDA</div>
                    <div className="text-gray-500">Sensitive business info</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400">🚫</span>
                  <div>
                    <div className="text-gray-300 font-semibold">Restricted</div>
                    <div className="text-gray-500">Internal only</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Higher Access */}
            <div className="mt-6">
              <button className="w-full bg-cyan-900 hover:bg-cyan-800 border border-cyan-700 rounded px-4 py-2 text-sm text-cyan-300 transition-colors duration-150">
                🔑 Request Higher Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
