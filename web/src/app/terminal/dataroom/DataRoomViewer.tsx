'use client';

/**
 * Data Room Viewer Component
 * 
 * Renders data room content with HTML and Markdown support.
 */

import React from 'react';
import { DataRoomSection } from './DataRoomClient';

interface DataRoomViewerProps {
  section: DataRoomSection | null;
  loading?: boolean;
}

export default function DataRoomViewer({ section, loading }: DataRoomViewerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-400">Loading data room content...</p>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Section Selected</h3>
          <p className="text-gray-500">Select a section from the left panel to view its contents</p>
        </div>
      </div>
    );
  }

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-emerald-900/50 text-emerald-400 border-emerald-700';
      case 'medium':
        return 'bg-amber-900/50 text-amber-400 border-amber-700';
      case 'high':
        return 'bg-red-900/50 text-red-400 border-red-700';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  const getClassificationBadgeColor = (classification: string) => {
    switch (classification) {
      case 'public':
        return 'bg-blue-900/50 text-blue-400 border-blue-700';
      case 'confidential':
        return 'bg-cyan-900/50 text-cyan-400 border-cyan-700';
      case 'restricted':
        return 'bg-purple-900/50 text-purple-400 border-purple-700';
      case 'nda_required':
        return 'bg-red-900/50 text-red-400 border-red-700';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  const renderMarkdownContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentParagraph: string[] = [];
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={elements.length} className="text-gray-300 mb-4 leading-relaxed">
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={elements.length} className="bg-black/50 border border-gray-800 rounded p-4 mb-4 overflow-x-auto">
              <code className="text-sm text-gray-300">{codeBlockLines.join('\n')}</code>
            </pre>
          );
          codeBlockLines = [];
          inCodeBlock = false;
        } else {
          flushParagraph();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      if (line.startsWith('# ')) {
        flushParagraph();
        elements.push(
          <h1 key={elements.length} className="text-3xl font-bold text-cyan-400 mb-4 mt-6">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        flushParagraph();
        elements.push(
          <h2 key={elements.length} className="text-2xl font-semibold text-cyan-400 mb-3 mt-5">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushParagraph();
        elements.push(
          <h3 key={elements.length} className="text-xl font-semibold text-cyan-400 mb-2 mt-4">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        flushParagraph();
        elements.push(
          <p key={elements.length} className="font-bold text-emerald-400 mb-2">
            {line.substring(2, line.length - 2)}
          </p>
        );
      } else if (line.trim() === '') {
        flushParagraph();
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        flushParagraph();
        elements.push(
          <li key={elements.length} className="text-gray-300 ml-6 mb-1">
            {line.substring(2)}
          </li>
        );
      } else {
        currentParagraph.push(line);
      }
    });

    flushParagraph();

    return <div className="prose prose-invert max-w-none">{elements}</div>;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-cyan-400">{section.name}</h2>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskBadgeColor(section.risk_level)}`}>
                {section.risk_level.toUpperCase()} RISK
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getClassificationBadgeColor(section.classification)}`}>
                {section.classification.toUpperCase()}
              </span>
            </div>
          </div>
          <p className="text-gray-400">{section.description}</p>
        </div>

        <div className="space-y-6">
          {section.folder.files.map((file, index) => (
            <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-emerald-400">{file.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getClassificationBadgeColor(file.classification)}`}>
                  {file.classification}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4">{file.description}</p>
              <div className="border-t border-gray-800 pt-4">
                {renderMarkdownContent(file.content)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
