/**
 * RFP Client
 * 
 * TypeScript API client for RFP Generator endpoints.
 */

export interface RFPProposal {
  proposal_id: string;
  rfp_id: string;
  title: string;
  agency: string;
  sections: RFPSection[];
  metadata: {
    generator_version: string;
    total_sections: number;
    total_words: number;
    generated_at: string;
  };
  status: string;
  created_at: string;
  updated_at: string;
  compliance_matrix?: ComplianceMatrix;
}

export interface RFPSection {
  section_name: string;
  section_number: number;
  content: string;
  word_count: number;
  generated_at: string;
}

export interface RFPRequirement {
  requirement_id: string;
  section: string;
  description: string;
  mandatory: boolean;
  weight: number;
  compliance_status?: string;
  response?: string;
}

export interface ComplianceMatrix {
  requirements: any[];
  summary: {
    total_requirements: number;
    scored_requirements: number;
    exceeds_count: number;
    meets_count: number;
    partial_count: number;
    does_not_meet_count: number;
    out_of_scope_count: number;
    unscored_count: number;
    compliance_percentage: number;
  };
  risk_level: string;
  generated_at: string;
}

export class RFPClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/rfp') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate complete RFP proposal
   */
  async generateProposal(
    rfpId: string,
    agency: string,
    title: string,
    context?: any
  ): Promise<{ success: boolean; proposal: RFPProposal; message: string }> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfp_id: rfpId, agency, title, context }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate proposal: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload RFP requirements
   */
  async uploadRequirements(
    rfpId: string,
    requirements: RFPRequirement[]
  ): Promise<{ success: boolean; rfp_id: string; ingestion_result: any }> {
    const response = await fetch(`${this.baseUrl}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfp_id: rfpId, requirements }),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload requirements: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get proposal by ID
   */
  async getProposal(proposalId: string): Promise<{ success: boolean; proposal: RFPProposal }> {
    const response = await fetch(`${this.baseUrl}/proposal/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to get proposal: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get compliance matrix
   */
  async getCompliance(proposalId: string): Promise<{ success: boolean; compliance_matrix?: ComplianceMatrix }> {
    const response = await fetch(`${this.baseUrl}/compliance/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to get compliance: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Export as HTML
   */
  async exportHTML(proposalId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export/html/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to export HTML: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Export as Markdown
   */
  async exportMarkdown(proposalId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export/markdown/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to export Markdown: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Export as JSON
   */
  async exportJSON(proposalId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export/json/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to export JSON: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Export as ZIP bundle
   */
  async exportZIP(proposalId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export/zip/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to export ZIP: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * List all proposals
   */
  async list(limit: number = 100, offset: number = 0): Promise<{ success: boolean; count: number; proposals: RFPProposal[] }> {
    const response = await fetch(`${this.baseUrl}/list?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
      throw new Error(`Failed to list proposals: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get operation history
   */
  async history(limit: number = 100): Promise<{ success: boolean; count: number; history: any[] }> {
    const response = await fetch(`${this.baseUrl}/history?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async health(): Promise<{ status: string; engine: any; storage: any; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(`Failed to check health: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Download file helper
   */
  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
