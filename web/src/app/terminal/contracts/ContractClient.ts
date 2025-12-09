/**
 * GhostQuant Channel Partner Contract Client
 * Global Distributor Edition (GDE) v3.0
 *
 * API client wrapper for contract management endpoints
 */

import {
  ContractType,
  ContractStatus,
  DistributorTier,
  RegionCode,
  CurrencyCode,
  DistributorContract,
  ContractSummary,
  ContractValidationResult,
  ContractAnalytics,
  NegotiationWorkflow,
  NegotiationWorkflowSummary,
  PricingCalculation,
  PriceList,
  RebateCalculation,
  ComplianceAssessment,
  ComplianceStatus,
  RegionInfo,
  RenewalEligibility,
  RenewalCalculation,
  RenewalTerms,
  ContractAmendment,
  ContractStatistics,
  ContractTemplate,
  HistoryEntry,
  ContractGenerateRequest,
  StatusUpdateRequest,
  NegotiationStartRequest,
  CounterProposalRequest,
  ApprovalRequest,
  PricingRequest,
  RebateRequest,
  AmendmentRequest,
  RenewalRequest,
  CertificationRequest,
  AuditRequest,
  TerritoryConflictCheckRequest,
  TerritoryConflict,
} from "./ContractSchema";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface ListResponse<T> {
  success: boolean;
  contracts?: T[];
  summaries?: T[];
  count: number;
  total?: number;
}

class ContractClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = `${baseUrl}/contracts`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async healthCheck(): Promise<{
    status: string;
    module: string;
    version: string;
    timestamp: string;
    components: Record<string, unknown>;
  }> {
    return this.request("/health");
  }

  async generateContract(
    request: ContractGenerateRequest
  ): Promise<{ success: boolean; contract: DistributorContract; message: string }> {
    return this.request("/generate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async listContracts(params?: {
    status?: ContractStatus;
    tier?: DistributorTier;
    region?: RegionCode;
    contract_type?: ContractType;
    distributor_name?: string;
    limit?: number;
    offset?: number;
  }): Promise<ListResponse<DistributorContract>> {
    const searchParams = new URLSearchParams();

    if (params?.status) searchParams.append("status", params.status);
    if (params?.tier) searchParams.append("tier", params.tier);
    if (params?.region) searchParams.append("region", params.region);
    if (params?.contract_type)
      searchParams.append("contract_type", params.contract_type);
    if (params?.distributor_name)
      searchParams.append("distributor_name", params.distributor_name);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const query = searchParams.toString();
    return this.request(`/list${query ? `?${query}` : ""}`);
  }

  async getContractSummaries(params?: {
    status?: ContractStatus;
    limit?: number;
  }): Promise<ListResponse<ContractSummary>> {
    const searchParams = new URLSearchParams();

    if (params?.status) searchParams.append("status", params.status);
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.request(`/summaries${query ? `?${query}` : ""}`);
  }

  async getContract(
    contractId: string
  ): Promise<{ success: boolean; contract: DistributorContract }> {
    return this.request(`/${contractId}`);
  }

  async getContractByNumber(
    contractNumber: string
  ): Promise<{ success: boolean; contract: DistributorContract }> {
    return this.request(`/number/${contractNumber}`);
  }

  async updateContractStatus(
    contractId: string,
    request: StatusUpdateRequest
  ): Promise<{ success: boolean; contract: DistributorContract; message: string }> {
    return this.request(`/${contractId}/status`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  }

  async validateContract(
    contractId: string
  ): Promise<{ success: boolean; validation_result: ContractValidationResult }> {
    return this.request(`/${contractId}/validate`, {
      method: "POST",
    });
  }

  async deleteContract(
    contractId: string,
    hardDelete: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    const params = hardDelete ? "?hard_delete=true" : "";
    return this.request(`/${contractId}${params}`, {
      method: "DELETE",
    });
  }

  async startNegotiation(
    contractId: string,
    request: NegotiationStartRequest
  ): Promise<{ success: boolean; workflow: NegotiationWorkflow; message: string }> {
    return this.request(`/${contractId}/negotiation/start`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getNegotiationWorkflow(contractId: string): Promise<{
    success: boolean;
    workflow: NegotiationWorkflow;
    summary: NegotiationWorkflowSummary;
  }> {
    return this.request(`/${contractId}/negotiation`);
  }

  async submitCounterProposal(
    workflowId: string,
    request: CounterProposalRequest
  ): Promise<{ success: boolean; workflow: NegotiationWorkflow; message: string }> {
    return this.request(`/negotiation/${workflowId}/counter-proposal`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async processNegotiationApproval(
    workflowId: string,
    request: ApprovalRequest
  ): Promise<{ success: boolean; workflow: NegotiationWorkflow; message: string }> {
    return this.request(`/negotiation/${workflowId}/approve`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async finalizeNegotiation(
    workflowId: string,
    finalizer: Record<string, string>
  ): Promise<{ success: boolean; workflow: NegotiationWorkflow; message: string }> {
    return this.request(`/negotiation/${workflowId}/finalize`, {
      method: "POST",
      body: JSON.stringify({ finalizer }),
    });
  }

  async calculatePricing(
    request: PricingRequest
  ): Promise<{ success: boolean; pricing: PricingCalculation }> {
    return this.request("/pricing/calculate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getPriceList(params?: {
    tier?: DistributorTier;
    currency?: CurrencyCode;
    region?: RegionCode;
  }): Promise<{ success: boolean; price_list: PriceList }> {
    const searchParams = new URLSearchParams();

    if (params?.tier) searchParams.append("tier", params.tier);
    if (params?.currency) searchParams.append("currency", params.currency);
    if (params?.region) searchParams.append("region", params.region);

    const query = searchParams.toString();
    return this.request(`/pricing/price-list${query ? `?${query}` : ""}`);
  }

  async calculateRebate(
    request: RebateRequest
  ): Promise<{ success: boolean; rebates: RebateCalculation }> {
    return this.request("/pricing/rebate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async assessCompliance(
    contractId: string
  ): Promise<{ success: boolean; assessment: ComplianceAssessment }> {
    return this.request("/compliance/assess", {
      method: "POST",
      body: JSON.stringify({ contract_id: contractId }),
    });
  }

  async getComplianceStatus(
    contractId: string
  ): Promise<{ success: boolean; compliance_status: ComplianceStatus }> {
    return this.request(`/${contractId}/compliance/status`);
  }

  async registerCertification(
    request: CertificationRequest
  ): Promise<{ success: boolean; certification: Record<string, unknown> }> {
    return this.request("/compliance/certification", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async scheduleAudit(
    request: AuditRequest
  ): Promise<{ success: boolean; audit: Record<string, unknown> }> {
    return this.request("/compliance/audit", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async listRegions(): Promise<{
    success: boolean;
    regions: Array<{
      code: string;
      name: string;
      countries_count: number;
      market_maturity: string;
    }>;
  }> {
    return this.request("/territory/regions");
  }

  async getRegionDetails(
    regionCode: RegionCode
  ): Promise<{ success: boolean; region: RegionInfo }> {
    return this.request(`/territory/region/${regionCode}`);
  }

  async checkTerritoryConflicts(
    request: TerritoryConflictCheckRequest
  ): Promise<{
    success: boolean;
    conflicts: TerritoryConflict[];
    has_conflicts: boolean;
  }> {
    return this.request("/territory/check-conflicts", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async checkRenewalEligibility(
    contractId: string
  ): Promise<{ success: boolean; eligibility: RenewalEligibility }> {
    return this.request(`/${contractId}/renewal/eligibility`);
  }

  async calculateRenewalTerms(
    contractId: string,
    params?: {
      performance_data?: Record<string, unknown>;
      requested_changes?: Record<string, unknown>;
    }
  ): Promise<{ success: boolean; renewal_terms: RenewalCalculation }> {
    return this.request(`/${contractId}/renewal/calculate`, {
      method: "POST",
      body: JSON.stringify(params || {}),
    });
  }

  async createRenewal(
    contractId: string,
    request: RenewalRequest
  ): Promise<{ success: boolean; renewal: RenewalTerms; message: string }> {
    return this.request(`/${contractId}/renewal/create`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async createAmendment(
    contractId: string,
    request: AmendmentRequest
  ): Promise<{ success: boolean; amendment: ContractAmendment; message: string }> {
    return this.request(`/${contractId}/amendment`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getAmendmentHistory(
    contractId: string
  ): Promise<{ success: boolean; amendments: ContractAmendment[]; count: number }> {
    return this.request(`/${contractId}/amendments`);
  }

  async getRenewalHistory(
    contractId: string
  ): Promise<{ success: boolean; renewals: RenewalTerms[]; count: number }> {
    return this.request(`/${contractId}/renewals`);
  }

  async getRenewalQueue(params?: {
    priority?: string;
    status?: string;
  }): Promise<{ success: boolean; queue: Record<string, unknown>[]; count: number }> {
    const searchParams = new URLSearchParams();

    if (params?.priority) searchParams.append("priority", params.priority);
    if (params?.status) searchParams.append("status", params.status);

    const query = searchParams.toString();
    return this.request(`/renewal/queue${query ? `?${query}` : ""}`);
  }

  async getExpiringContracts(
    days: number = 90
  ): Promise<{
    success: boolean;
    expiring_contracts: DistributorContract[];
    count: number;
    days_checked: number;
  }> {
    return this.request(`/renewal/expiring?days=${days}`);
  }

  async listTemplates(): Promise<{
    success: boolean;
    templates: ContractTemplate[];
  }> {
    return this.request("/templates/list");
  }

  async getTemplate(
    templateId: string,
    region?: RegionCode
  ): Promise<{ success: boolean; template: Record<string, unknown> }> {
    const params = region ? `?region=${region}` : "";
    return this.request(`/templates/${templateId}${params}`);
  }

  async getExhibit(
    exhibitType: string,
    params?: {
      tier?: DistributorTier;
      region?: RegionCode;
    }
  ): Promise<{ success: boolean; exhibit: Record<string, unknown> }> {
    const searchParams = new URLSearchParams();

    if (params?.tier) searchParams.append("tier", params.tier);
    if (params?.region) searchParams.append("region", params.region);

    const query = searchParams.toString();
    return this.request(`/templates/exhibits/${exhibitType}${query ? `?${query}` : ""}`);
  }

  async getStatistics(): Promise<{
    success: boolean;
    statistics: ContractStatistics;
  }> {
    return this.request("/statistics");
  }

  async getContractAnalytics(
    contractId: string
  ): Promise<{ success: boolean; analytics: ContractAnalytics }> {
    return this.request(`/analytics/${contractId}`);
  }

  async getDistributorContracts(
    distributorId: string
  ): Promise<{ success: boolean; contracts: DistributorContract[]; count: number }> {
    return this.request(`/distributor/${distributorId}/contracts`);
  }

  async getHistory(params?: {
    contract_id?: string;
    action?: string;
    limit?: number;
  }): Promise<{ success: boolean; history: HistoryEntry[]; count: number }> {
    const searchParams = new URLSearchParams();

    if (params?.contract_id)
      searchParams.append("contract_id", params.contract_id);
    if (params?.action) searchParams.append("action", params.action);
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.request(`/history${query ? `?${query}` : ""}`);
  }

  async exportContracts(
    format: string = "dict"
  ): Promise<{
    success: boolean;
    data: Record<string, unknown>[];
    count: number;
    format: string;
    exported_at: string;
  }> {
    return this.request("/export", {
      method: "POST",
      body: JSON.stringify({ format }),
    });
  }
}

export const contractClient = new ContractClient();

export default ContractClient;

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = CurrencyCode.USD
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function getDaysUntilExpiration(expirationDate: string): number {
  const expiration = new Date(expirationDate);
  const now = new Date();
  const diffTime = expiration.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpirationUrgency(
  daysUntil: number
): "critical" | "high" | "medium" | "low" | "none" {
  if (daysUntil <= 0) return "critical";
  if (daysUntil <= 30) return "critical";
  if (daysUntil <= 60) return "high";
  if (daysUntil <= 90) return "medium";
  if (daysUntil <= 180) return "low";
  return "none";
}

export function getStatusBadgeColor(status: ContractStatus): string {
  const colors: Record<ContractStatus, string> = {
    [ContractStatus.DRAFT]: "bg-gray-100 text-gray-800",
    [ContractStatus.PENDING_REVIEW]: "bg-yellow-100 text-yellow-800",
    [ContractStatus.UNDER_NEGOTIATION]: "bg-blue-100 text-blue-800",
    [ContractStatus.APPROVED]: "bg-green-100 text-green-800",
    [ContractStatus.ACTIVE]: "bg-emerald-100 text-emerald-800",
    [ContractStatus.SUSPENDED]: "bg-orange-100 text-orange-800",
    [ContractStatus.EXPIRED]: "bg-red-100 text-red-800",
    [ContractStatus.TERMINATED]: "bg-red-100 text-red-800",
    [ContractStatus.RENEWED]: "bg-purple-100 text-purple-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getTierBadgeColor(tier: DistributorTier): string {
  const colors: Record<DistributorTier, string> = {
    [DistributorTier.AUTHORIZED]: "bg-gray-100 text-gray-800",
    [DistributorTier.PREFERRED]: "bg-blue-100 text-blue-800",
    [DistributorTier.PREMIER]: "bg-purple-100 text-purple-800",
    [DistributorTier.STRATEGIC]: "bg-amber-100 text-amber-800",
    [DistributorTier.GLOBAL_ELITE]: "bg-emerald-100 text-emerald-800",
  };
  return colors[tier] || "bg-gray-100 text-gray-800";
}
