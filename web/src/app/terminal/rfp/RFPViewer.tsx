'use client';

/**
 * RFP Viewer Component
 * 
 * Renders RFP proposal content with Markdown support.
 */

import React from 'react';
import { RFPProposal, RFPSection } from './RFPClient';

interface RFPViewerProps {
  proposal: RFPProposal | null;
  selectedSection?: string;
}

export default function RFPViewer({ proposal, selectedSection }: RFPViewerProps) {
  if (!proposal) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <div className="text-xl">No proposal selected</div>
          <div className="text-sm mt-2">Generate a new proposal to get started</div>
        </div>
      </div>
    );
  }

  const sectionsToShow = selectedSection
    ? proposal.sections.filter(s => s.section_name === selectedSection)
    : proposal.sections;

  return (
    <div className="h-full overflow-y-auto bg-black">
      {/* Proposal Header */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border-b border-emerald-500/30 p-6">
        <h1 className="text-2xl font-bold text-white mb-2">{proposal.title}</h1>
        <div className="text-emerald-400">{proposal.agency}</div>
        <div className="flex gap-4 mt-4 text-sm text-gray-400">
          <div>
            <span className="text-gray-500">Proposal ID:</span> {proposal.proposal_id}
          </div>
          <div>
            <span className="text-gray-500">Status:</span>{' '}
            <span className="text-cyan-400 uppercase">{proposal.status}</span>
          </div>
          <div>
            <span className="text-gray-500">Sections:</span> {proposal.metadata.total_sections}
          </div>
          <div>
            <span className="text-gray-500">Words:</span> {proposal.metadata.total_words.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="p-6">
        {sectionsToShow.map((section) => (
          <SectionView key={section.section_number} section={section} />
        ))}
      </div>
    </div>
  );
}

interface SectionViewProps {
  section: RFPSection;
}

function SectionView({ section }: SectionViewProps) {
  return (
    <div className="mb-8 bg-gray-900/50 border border-emerald-500/20 rounded-lg overflow-hidden">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border-b border-emerald-500/30 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold">
            {section.section_number}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{section.section_name}</h2>
            <div className="text-sm text-gray-400">{section.word_count} words</div>
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6">
        <MarkdownContent content={section.content} />
      </div>
    </div>
  );
}

interface MarkdownContentProps {
  content: string;
}

function MarkdownContent({ content }: MarkdownContentProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={key++} className="mb-4 text-gray-300 leading-relaxed">
          {currentParagraph.join(' ')}
        </p>
      );
      currentParagraph = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushParagraph();
      elements.push(
        <h1 key={key++} className="text-3xl font-bold text-emerald-400 mb-4 mt-6">
          {trimmed.substring(2)}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      flushParagraph();
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-cyan-400 mb-3 mt-5">
          {trimmed.substring(3)}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushParagraph();
      elements.push(
        <h3 key={key++} className="text-xl font-bold text-gray-200 mb-2 mt-4">
          {trimmed.substring(4)}
        </h3>
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      flushParagraph();
      elements.push(
        <p key={key++} className="mb-3 text-white font-semibold">
          {trimmed.substring(2, trimmed.length - 2)}
        </p>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      elements.push(
        <li key={key++} className="mb-2 text-gray-300 ml-6">
          {trimmed.substring(2)}
        </li>
      );
    } else {
      currentParagraph.push(trimmed);
    }
  });

  flushParagraph();

  return <div className="prose prose-invert max-w-none">{elements}</div>;
}
