'use client';

/**
 * Data Room Tree Component
 * 
 * Interactive folder tree navigation for data room.
 */

import React, { useState } from 'react';
import { DataRoomSummary } from './DataRoomClient';

interface DataRoomTreeProps {
  summary: DataRoomSummary | null;
  selectedSection: string | null;
  onSelectSection: (sectionName: string) => void;
  loading?: boolean;
}

export default function DataRoomTree({ summary, selectedSection, onSelectSection, loading }: DataRoomTreeProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'high':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'public':
        return '🔓';
      case 'confidential':
        return '🔒';
      case 'restricted':
        return '🔐';
      case 'nda_required':
        return '🚫';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">No data room loaded</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Data Room Sections
          </h3>
          <p className="text-xs text-gray-600">
            {summary.total_sections} sections available
          </p>
        </div>

        <div className="space-y-1">
          {summary.sections.map((section) => {
            const isExpanded = expandedSections.has(section.name);
            const isSelected = selectedSection === section.name;

            return (
              <div key={section.name} className="select-none">
                <div
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded cursor-pointer
                    transition-colors duration-150
                    ${isSelected 
                      ? 'bg-emerald-900/30 border border-emerald-700/50' 
                      : 'hover:bg-gray-800/50 border border-transparent'
                    }
                  `}
                  onClick={() => {
                    toggleSection(section.name);
                    onSelectSection(section.name);
                  }}
                >
                  <span className="text-xs">
                    {isExpanded ? '📂' : '📁'}
                  </span>
                  <span className="text-xs">{getRiskIcon(section.risk_level)}</span>
                  <span className="text-xs">{getClassificationIcon(section.classification)}</span>
                  <span className={`text-sm flex-1 ${isSelected ? 'text-emerald-400 font-semibold' : 'text-gray-300'}`}>
                    {section.order}. {section.name}
                  </span>
                  <span className="text-xs text-gray-600">
                    {section.file_count}
                  </span>
                </div>

                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {section.files.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800/30 cursor-default"
                      >
                        <span className="text-xs">{getClassificationIcon(file.classification)}</span>
                        <span className="text-xs text-gray-400 flex-1">{file.name}</span>
                        <span className="text-xs text-gray-600">{file.file_type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
