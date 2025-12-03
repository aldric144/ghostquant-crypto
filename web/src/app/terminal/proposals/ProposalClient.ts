/**
 * Proposal API Client
 * 
 * TypeScript client for proposal generation endpoints.
 */

export interface ProposalVolume {
  volume_id: string;
  volume_name: string;
  volume_number: number;
  total_words: number;
  page_estimate: number;
}

export interface ProposalDocument {
  document_id: string;
  title: string;
  agency: string;
  rfp_number: string;
  total_pages: number;
  total_words: number;
  persona: string;
  generated_at: string;
  volumes: ProposalVolume[];
}

export interface ComplianceMatrix {
  matrix_id: string;
  overall_score: number;
  requirements_count: number;
}

export interface RiskTable {
  risk_id: string;
  overall_risk_level: string;
  risks_count: number;
}

export interface CostBreakdown {
  cost_id: string;
  total_cost: number;
  cost_risk_level: string;
}

export interface ProposalPackage {
  package_id: string;
  document: ProposalDocument;
  compliance_matrix?: ComplianceMatrix;
  risk_table?: RiskTable;
  cost_breakdown?: CostBreakdown;
  status: string;
  created_at: string;
}

export interface GenerateProposalRequest {
  rfp_id: string;
  agency: string;
  title: string;
  persona_type?: string;
  requirements?: any[];
}

export interface UploadRFPRequest {
  rfp_id: string;
  agency: string;
  title: string;
  deadline?: string;
  requirements?: any[];
  evaluation_criteria?: any[];
  compliance_requirements?: string[];
}

export class ProposalClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/proposals') {
    this.baseUrl = baseUrl;
  }

  async generateProposal(request: GenerateProposalRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate proposal: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadRFP(request: UploadRFPRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/rfp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload RFP: ${response.statusText}`);
    }

    return response.json();
  }

  async getProposal(proposalId: string): Promise<ProposalPackage> {
    const response = await fetch(`${this.baseUrl}/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to get proposal: ${response.statusText}`);
    }

    return response.json();
  }

  async getCompliance(proposalId: string): Promise<ComplianceMatrix> {
    const response = await fetch(`${this.baseUrl}/compliance/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to get compliance: ${response.statusText}`);
    }

    return response.json();
  }

  async getCost(proposalId: string): Promise<CostBreakdown> {
    const response = await fetch(`${this.baseUrl}/cost/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to get cost: ${response.statusText}`);
    }

    return response.json();
  }

  async exportHTML(proposalId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/export/html/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to export HTML: ${response.statusText}`);
    }

    return response.text();
  }

  async exportMarkdown(proposalId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/export/md/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to export Markdown: ${response.statusText}`);
    }

    return response.text();
  }

  async exportJSON(proposalId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/export/json/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to export JSON: ${response.statusText}`);
    }

    return response.json();
  }

  async exportZIP(proposalId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export/zip/${proposalId}`);

    if (!response.ok) {
      throw new Error(`Failed to export ZIP: ${response.statusText}`);
    }

    return response.blob();
  }

  async list(limit: number = 100, offset: number = 0): Promise<any> {
    const response = await fetch(`${this.baseUrl}/list?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
      throw new Error(`Failed to list proposals: ${response.statusText}`);
    }

    return response.json();
  }

  async history(limit: number = 100): Promise<any> {
    const response = await fetch(`${this.baseUrl}/history?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.statusText}`);
    }

    return response.json();
  }

  async health(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(`Failed to get health: ${response.statusText}`);
    }

    return response.json();
  }

  downloadZIP(proposalId: string): void {
    const url = `${this.baseUrl}/export/zip/${proposalId}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `proposal_${proposalId}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const proposalClient = new ProposalClient();
