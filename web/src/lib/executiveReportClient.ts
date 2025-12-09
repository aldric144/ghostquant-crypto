/**
 * GhostQuant™ — Executive Compliance Report Generator
 * Module: executiveReportClient.ts
 * Purpose: API client for executive compliance reports
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export interface ExecutiveSummary {
  title: string;
  overview: string;
  compliance_posture: string;
  key_strengths: string[];
  identified_gaps: string[];
  regulatory_readiness: string;
  risk_profile: string;
  governance_maturity: string;
  recommendations: string;
  conclusion: string;
  overall_rating: string;
  compliance_score: number;
  readiness_tier: string;
  last_assessment: string;
}

export interface ExecutiveReport {
  report_id: string;
  title: string;
  generated_at: string;
  version: string;
  organization: string;
  report_type: string;
  page_count: string;
  executive_summary: ExecutiveSummary;
  regulatory_alignment: any;
  security_posture: any;
  risk_assessment: any;
  governance_score: any;
  compliance_matrix: any;
  remediation_roadmap: any;
  metadata: {
    frameworks_covered: number;
    regulatory_agencies: number;
    risk_categories: number;
    security_domains: number;
    compliance_controls: number;
    report_sections: number;
    export_formats: string[];
  };
}

export interface GenerateReportResponse {
  success: boolean;
  message?: string;
  report?: ExecutiveReport;
  metadata?: {
    report_id: string;
    generated_at: string;
    page_count: string;
    sections: number;
    frameworks: number;
    export_formats: string[];
  };
  error?: string;
  timestamp: string;
}

export interface SummaryResponse {
  success: boolean;
  message?: string;
  summary?: ExecutiveSummary;
  metadata?: {
    report_id: string;
    generated_at: string;
    compliance_score: number;
    readiness_tier: string;
    overall_rating: string;
  };
  error?: string;
  timestamp: string;
}

export interface ExportResponse {
  success: boolean;
  message?: string;
  format?: string;
  content?: string;
  metadata?: {
    report_id: string;
    generated_at: string;
    content_length: number;
    pdf_ready?: boolean;
    estimated_pages: string;
  };
  error?: string;
  timestamp: string;
}

export interface HealthResponse {
  success: boolean;
  status?: string;
  engine?: {
    initialized: boolean;
    version: string;
    report_id: string;
  };
  capabilities?: {
    report_generation: string;
    executive_summary: string;
    markdown_export: string;
    html_export: string;
    json_export: string;
  };
  statistics?: {
    frameworks_covered: number;
    regulatory_agencies: number;
    risk_categories: number;
    security_domains: number;
    compliance_controls: number;
    report_sections: number;
  };
  error?: string;
  timestamp: string;
}

/**
 * Generate full executive compliance report
 */
export async function generateReport(): Promise<GenerateReportResponse> {
  try {
    const response = await fetch(`${API_BASE}/compliance/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get executive summary only
 */
export async function getSummary(): Promise<SummaryResponse> {
  try {
    const response = await fetch(`${API_BASE}/compliance/report/summary`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get report in Markdown format
 */
export async function getMarkdown(): Promise<ExportResponse> {
  try {
    const response = await fetch(`${API_BASE}/compliance/report/markdown`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting markdown:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get report in HTML format
 */
export async function getHTML(): Promise<ExportResponse> {
  try {
    const response = await fetch(`${API_BASE}/compliance/report/html`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting HTML:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get system health
 */
export async function getHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE}/compliance/report/health`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting health:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Download report content as file
 */
export function downloadReport(content: string, filename: string, format: 'markdown' | 'html' | 'json') {
  try {
    const mimeTypes = {
      markdown: 'text/markdown',
      html: 'text/html',
      json: 'application/json',
    };

    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading report:', error);
  }
}
