/**
 * Partner Program API Client
 * TypeScript client for partner program generation endpoints
 */

export interface PartnerTier {
  tier_level: string;
  tier_name: string;
  annual_revenue_requirement: number;
  commission_rate: number;
  mdf_allocation: number;
  benefits: string[];
}

export interface CommissionModel {
  base_rate: number;
  tier_rates: Record<string, number>;
  new_business_rate: number;
  renewal_rate: number;
  deal_registration_bonus: number;
  payout_terms: string;
}

export interface ResellerAgreement {
  agreement_id: string;
  partner_name: string;
  partner_type: string;
  effective_date: string;
  territory: string[];
  term_length_months: number;
}

export interface ChannelPlaybook {
  playbook_id: string;
  partner_tier: string;
  gtm_strategy: string;
  target_markets: string[];
  sales_process: Array<Record<string, string>>;
}

export interface OnboardingPackage {
  package_id: string;
  partner_tier: string;
  onboarding_timeline: string;
  phase_1_tasks: Array<Record<string, string>>;
  phase_2_tasks: Array<Record<string, string>>;
  phase_3_tasks: Array<Record<string, string>>;
}

export interface PartnerProgram {
  package_id: string;
  partner_name: string;
  partner_type: string;
  tier: string;
  generated_at: string;
  summary: string;
  metadata: Record<string, any>;
}

export interface ProgramSummary {
  package_id: string;
  partner_name: string;
  tier: string;
  summary: string;
  key_benefits: string[];
}

export interface GeneratePartnerProgramRequest {
  partner_name: string;
  partner_type: string;
  target_tier: string;
  territory: string[];
  target_revenue: number;
}

export class PartnerClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/partners') {
    this.baseUrl = baseUrl;
  }

  async generatePartnerProgram(request: GeneratePartnerProgramRequest): Promise<PartnerProgram> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate partner program: ${response.statusText}`);
    }

    return response.json();
  }

  async getPartnerProgram(packageId: string): Promise<PartnerProgram> {
    const response = await fetch(`${this.baseUrl}/program/${packageId}`);

    if (!response.ok) {
      throw new Error(`Failed to get partner program: ${response.statusText}`);
    }

    return response.json();
  }

  async getTierStructure(packageId: string): Promise<PartnerTier> {
    const response = await fetch(`${this.baseUrl}/tiers/${packageId}`);

    if (!response.ok) {
      throw new Error(`Failed to get tier structure: ${response.statusText}`);
    }

    return response.json();
  }

  async getCommissionModel(packageId: string): Promise<CommissionModel> {
    const response = await fetch(`${this.baseUrl}/commissions/${packageId}`);

    if (!response.ok) {
      throw new Error(`Failed to get commission model: ${response.statusText}`);
    }

    return response.json();
  }

  async getResellerAgreement(packageId: string): Promise<ResellerAgreement> {
    const response = await fetch(`${this.baseUrl}/agreement/${packageId}`);

    if (!response.ok) {
      throw new Error(`Failed to get reseller agreement: ${response.statusText}`);
    }

    return response.json();
  }

  async getChannelPlaybook(packageId: string): Promise<ChannelPlaybook> {
    const response = await fetch(`${this.baseUrl}/playbook/${packageId}`);

    if (!response.ok) {
      throw new Error(`Failed to get channel playbook: ${response.statusText}`);
    }

    return response.json();
  }

  async getOnboardingPackage(packageId: string): Promise<OnboardingPackage> {
    const response = await fetch(`${this.baseUrl}/onboarding/${packageId}`);

    if (!response.ok) {
      throw new Error(`Failed to get onboarding package: ${response.statusText}`);
    }

    return response.json();
  }

  async getProgramSummary(packageId: string): Promise<ProgramSummary> {
    const response = await fetch(`${this.baseUrl}/summary/${packageId}`);

    if (!response.ok) {
      throw new Error(`Failed to get program summary: ${response.statusText}`);
    }

    return response.json();
  }

  async listPartnerPrograms(partnerName?: string): Promise<PartnerProgram[]> {
    const url = partnerName
      ? `${this.baseUrl}/list?partner_name=${encodeURIComponent(partnerName)}`
      : `${this.baseUrl}/list`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to list partner programs: ${response.statusText}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const partnerClient = new PartnerClient();
