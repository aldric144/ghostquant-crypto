/**
 * Sales Client
 * API client for GhostQuant Enterprise Sales Pipeline
 */

const SALES_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export enum LeadSource {
  DEMO = 'demo',
  WEBSITE = 'website',
  REFERRAL = 'referral',
  CONFERENCE = 'conference',
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  PARTNER = 'partner',
}

export enum LeadCategory {
  GOVERNMENT = 'government',
  EXCHANGE = 'exchange',
  ENTERPRISE = 'enterprise',
  VENTURE_CAPITAL = 'venture_capital',
  COMPLIANCE = 'compliance',
  RESEARCH = 'research',
}

export enum LeadPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum InteractionType {
  EMAIL = 'email',
  CALL = 'call',
  MEETING = 'meeting',
  DEMO = 'demo',
  PROPOSAL = 'proposal',
  CONTRACT = 'contract',
  NOTE = 'note',
}

export interface SalesLead {
  lead_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  organization: string;
  email: string;
  phone?: string;
  title?: string;
  source: LeadSource;
  category: LeadCategory;
  priority: LeadPriority;
  current_stage: string;
  stage_history: Array<any>;
  lead_score: number;
  close_probability: number;
  estimated_value?: number;
  use_case: string;
  industry?: string;
  company_size?: string;
  budget_range?: string;
  timeline?: string;
  requirements?: string;
  pain_points?: string;
  decision_makers: string[];
  competitors: string[];
  assigned_rep?: string;
  next_action?: string;
  next_action_date?: string;
  last_interaction_date?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  metadata: Record<string, any>;
}

export interface SalesInteraction {
  interaction_id: string;
  lead_id: string;
  timestamp: string;
  interaction_type: InteractionType;
  subject: string;
  notes: string;
  rep_name?: string;
  outcome?: string;
  next_steps?: string;
  attachments: string[];
  metadata: Record<string, any>;
}

export interface SalesPipelineSummary {
  timestamp: string;
  total_leads: number;
  leads_by_stage: Record<string, number>;
  leads_by_category: Record<string, number>;
  leads_by_priority: Record<string, number>;
  total_pipeline_value: number;
  weighted_pipeline_value: number;
  average_deal_size: number;
  conversion_rates: Record<string, number>;
  average_cycle_time_days: number;
  top_leads: Array<any>;
  recent_wins: Array<any>;
  at_risk_leads: Array<any>;
  metadata: Record<string, any>;
}

export interface LeadCreateRequest {
  name: string;
  organization: string;
  email: string;
  phone?: string;
  title?: string;
  source: LeadSource;
  category: LeadCategory;
  use_case: string;
  requirements?: string;
  estimated_value?: number;
}

export interface StageUpdateRequest {
  new_stage: string;
  notes?: string;
}

export interface InteractionCreateRequest {
  interaction_type: InteractionType;
  subject: string;
  notes: string;
  rep_name?: string;
  outcome?: string;
  next_steps?: string;
}

class SalesClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${SALES_API_BASE}/sales`;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`Sales API error: ${response.statusText}`);
    }
    return response.json();
  }

  async createLead(request: LeadCreateRequest): Promise<SalesLead> {
    return this.fetch<SalesLead>('/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async updateLeadStage(leadId: string, request: StageUpdateRequest): Promise<SalesLead> {
    return this.fetch<SalesLead>(`/lead/${leadId}/stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async listLeads(filters?: {
    category?: LeadCategory;
    priority?: LeadPriority;
    stage?: string;
    assigned_rep?: string;
  }): Promise<SalesLead[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.stage) params.append('stage', filters.stage);
    if (filters?.assigned_rep) params.append('assigned_rep', filters.assigned_rep);
    
    const query = params.toString();
    return this.fetch<SalesLead[]>(`/leads${query ? `?${query}` : ''}`);
  }

  async getLeadDetails(leadId: string): Promise<any> {
    return this.fetch<any>(`/lead/${leadId}`);
  }

  async createInteraction(leadId: string, request: InteractionCreateRequest): Promise<SalesInteraction> {
    return this.fetch<SalesInteraction>(`/interaction?lead_id=${leadId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async getPipelineSummary(): Promise<SalesPipelineSummary> {
    return this.fetch<SalesPipelineSummary>('/summary');
  }

  async getInvestorView(): Promise<any> {
    return this.fetch<any>('/investor');
  }

  async getHealth(): Promise<any> {
    return this.fetch<any>('/health');
  }

  async getInfo(): Promise<any> {
    return this.fetch<any>('/');
  }
}

export const salesClient = new SalesClient();
