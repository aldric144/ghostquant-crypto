/**
 * GhostQuant Channel Partner Contract Schema
 * Global Distributor Edition (GDE) v3.0
 *
 * TypeScript interfaces for contract management system
 */

export enum ContractType {
  MASTER_DISTRIBUTION = "MASTER_DISTRIBUTION",
  REGIONAL_DISTRIBUTION = "REGIONAL_DISTRIBUTION",
  EXCLUSIVE_DISTRIBUTION = "EXCLUSIVE_DISTRIBUTION",
  NON_EXCLUSIVE_DISTRIBUTION = "NON_EXCLUSIVE_DISTRIBUTION",
  OEM_DISTRIBUTION = "OEM_DISTRIBUTION",
  VAR_AGREEMENT = "VAR_AGREEMENT",
  RESELLER_AGREEMENT = "RESELLER_AGREEMENT",
  GOVERNMENT_DISTRIBUTION = "GOVERNMENT_DISTRIBUTION",
}

export enum ContractStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  UNDER_NEGOTIATION = "UNDER_NEGOTIATION",
  APPROVED = "APPROVED",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  EXPIRED = "EXPIRED",
  TERMINATED = "TERMINATED",
  RENEWED = "RENEWED",
}

export enum DistributorTier {
  AUTHORIZED = "AUTHORIZED",
  PREFERRED = "PREFERRED",
  PREMIER = "PREMIER",
  STRATEGIC = "STRATEGIC",
  GLOBAL_ELITE = "GLOBAL_ELITE",
}

export enum RegionCode {
  AMERICAS = "AMERICAS",
  EMEA = "EMEA",
  APAC = "APAC",
  LATAM = "LATAM",
  MENA = "MENA",
  DACH = "DACH",
  NORDICS = "NORDICS",
  BENELUX = "BENELUX",
  IBERIA = "IBERIA",
  CEE = "CEE",
  CIS = "CIS",
  ANZ = "ANZ",
  GREATER_CHINA = "GREATER_CHINA",
  INDIA_SUBCONTINENT = "INDIA_SUBCONTINENT",
  JAPAN_KOREA = "JAPAN_KOREA",
  ASEAN = "ASEAN",
  AFRICA = "AFRICA",
  GLOBAL = "GLOBAL",
}

export enum CurrencyCode {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  CHF = "CHF",
  AUD = "AUD",
  CAD = "CAD",
  SGD = "SGD",
  HKD = "HKD",
  CNY = "CNY",
  INR = "INR",
  AED = "AED",
  BRL = "BRL",
  MXN = "MXN",
  ZAR = "ZAR",
}

export enum PaymentTerms {
  NET_15 = "NET_15",
  NET_30 = "NET_30",
  NET_45 = "NET_45",
  NET_60 = "NET_60",
  NET_90 = "NET_90",
  PREPAID = "PREPAID",
  COD = "COD",
}

export enum NegotiationStatus {
  NOT_STARTED = "NOT_STARTED",
  INITIAL_PROPOSAL = "INITIAL_PROPOSAL",
  COUNTER_PROPOSAL = "COUNTER_PROPOSAL",
  UNDER_REVIEW = "UNDER_REVIEW",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
  FINAL_TERMS = "FINAL_TERMS",
}

export enum ComplianceLevel {
  STANDARD = "STANDARD",
  ENHANCED = "ENHANCED",
  STRICT = "STRICT",
  GOVERNMENT = "GOVERNMENT",
  HEALTHCARE = "HEALTHCARE",
  FINANCIAL_SERVICES = "FINANCIAL_SERVICES",
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Contact {
  name: string;
  title: string;
  email: string;
  phone: string;
  role: string;
}

export interface TerritoryDefinition {
  territory_id: string;
  territory_name: string;
  region_code: RegionCode;
  countries: string[];
  sub_regions: string[];
  excluded_countries: string[];
  is_exclusive: boolean;
  population_coverage: number;
  gdp_coverage_usd: number;
  market_potential_score: number;
  regulatory_complexity: string;
  local_requirements: string[];
}

export interface PricingTier {
  tier_name: string;
  min_volume: number;
  max_volume: number | null;
  discount_percentage: number;
  unit_price: number;
  currency: CurrencyCode;
  effective_date: string;
}

export interface ProductAuthorization {
  product_id: string;
  product_name: string;
  product_category: string;
  authorization_level: string;
  restrictions: string[];
  special_terms: string;
  effective_date: string;
  expiration_date: string | null;
}

export interface CommitmentSchedule {
  year: number;
  minimum_revenue_commitment: number;
  quarterly_targets: number[];
  growth_target_percentage: number;
  penalty_for_shortfall: number;
  bonus_for_overachievement: number;
  review_date: string;
}

export interface RebateThreshold {
  threshold: number;
  rebate_percentage?: number;
  bonus_per_customer?: number;
}

export interface RebateStructure {
  rebate_id: string;
  rebate_name: string;
  rebate_type: string;
  calculation_period: string;
  thresholds: RebateThreshold[];
  payment_timing: string;
  maximum_rebate_percentage: number;
}

export interface MarketDevelopmentFund {
  mdf_id: string;
  total_allocation: number;
  currency: CurrencyCode;
  fiscal_year: number;
  quarterly_allocation: number[];
  eligible_activities: string[];
  reimbursement_rate: number;
  approval_required_above: number;
  documentation_requirements: string[];
  claim_deadline_days: number;
}

export interface ComplianceRequirement {
  requirement_id: string;
  requirement_name: string;
  compliance_level: ComplianceLevel;
  applicable_regions: RegionCode[];
  regulatory_framework: string;
  certification_required: boolean;
  certification_name: string | null;
  audit_frequency: string;
  documentation_requirements: string[];
  penalties_for_non_compliance: string;
  remediation_timeline_days: number;
  reporting_requirements: string[];
}

export interface NegotiationTerm {
  term_id: string;
  term_category: string;
  term_name: string;
  original_value: number | string | boolean | null;
  proposed_value: number | string | boolean | null;
  final_value: number | string | boolean | null;
  is_negotiable: boolean;
  minimum_acceptable: number | null;
  maximum_acceptable: number | null;
  justification: string;
  status: string;
  counter_proposals: CounterProposal[];
}

export interface CounterProposal {
  round: number;
  proposed_value?: number | string | boolean;
  action?: string;
  submitter?: Record<string, string>;
  approver?: Record<string, string>;
  rejector?: Record<string, string>;
  justification?: string;
  comments?: string;
  reason?: string;
  timestamp: string;
}

export interface NegotiationSession {
  session_id: string;
  contract_id: string;
  session_date: string;
  participants: Record<string, string>[];
  agenda_items: string[];
  terms_discussed: string[];
  decisions_made: Record<string, unknown>[];
  action_items: Record<string, unknown>[];
  next_steps: string[];
  session_notes: string;
}

export interface ApprovalChainItem {
  role: string;
  required: boolean;
  reasons: string[];
  status: string;
  approved_by: Record<string, string> | null;
  approved_at: string | null;
  comments?: string;
}

export interface NegotiationWorkflow {
  workflow_id: string;
  contract_id: string;
  status: NegotiationStatus;
  started_at: string;
  last_updated: string;
  current_round: number;
  max_rounds: number;
  negotiable_terms: NegotiationTerm[];
  sessions: NegotiationSession[];
  stakeholders: Record<string, string>[];
  approval_chain: ApprovalChainItem[];
  deadlines: Record<string, string>;
  escalation_path: Record<string, unknown>[];
  notes: NegotiationNote[];
}

export interface NegotiationNote {
  timestamp: string;
  author: string;
  note: string;
}

export interface ContractAmendment {
  amendment_id: string;
  contract_id: string;
  amendment_number: number;
  amendment_date: string;
  effective_date: string;
  amendment_type: string;
  sections_modified: string[];
  original_terms: Record<string, unknown>;
  amended_terms: Record<string, unknown>;
  reason_for_amendment: string;
  approved_by: Record<string, string>[];
  approval_date: string;
  amendment_text: string;
}

export interface RenewalTerms {
  renewal_id: string;
  contract_id: string;
  original_term_end: string;
  renewal_term_start: string;
  renewal_term_end: string;
  renewal_type: string;
  auto_renewal: boolean;
  notice_period_days: number;
  price_adjustment_percentage: number;
  commitment_changes: Record<string, number>;
  territory_changes: unknown[];
  product_changes: unknown[];
  new_terms: unknown[];
  renewal_conditions: string[];
}

export interface DistributorProfile {
  distributor_id: string;
  company_name: string;
  legal_name: string;
  dba_name: string;
  registration_number: string;
  tax_id: string;
  duns_number: string;
  headquarters_address: Address;
  billing_address: Address;
  shipping_addresses: Address[];
  primary_region: RegionCode;
  operating_regions: RegionCode[];
  year_established: number;
  employee_count: number;
  annual_revenue: number;
  credit_rating: string;
  industry_certifications: string[];
  key_contacts: Contact[];
  bank_details: Record<string, string>;
  insurance_info: Record<string, unknown>;
  website: string;
  linkedin_url: string;
}

export interface ContractTerms {
  contract_type: ContractType;
  distributor_tier: DistributorTier;
  effective_date: string;
  expiration_date: string;
  initial_term_months: number;
  renewal_term_months: number;
  auto_renewal: boolean;
  notice_period_days: number;
  territories: TerritoryDefinition[];
  products: ProductAuthorization[];
  pricing_tiers: PricingTier[];
  commitments: CommitmentSchedule[];
  rebates: RebateStructure[];
  mdf: MarketDevelopmentFund | null;
  compliance_requirements: ComplianceRequirement[];
  payment_terms: PaymentTerms;
  currency: CurrencyCode;
  credit_limit: number;
  termination_clauses: string[];
  governing_law: string;
  dispute_resolution: string;
  arbitration_venue: string;
  confidentiality_term_years: number;
  non_compete_term_months: number;
  liability_cap: number;
  indemnification_cap: number;
  insurance_requirements: Record<string, number>;
  special_terms: string[];
}

export interface DistributorContract {
  contract_id: string;
  contract_number: string;
  version: string;
  status: ContractStatus;
  distributor: DistributorProfile;
  terms: ContractTerms;
  negotiation: NegotiationWorkflow | null;
  amendments: ContractAmendment[];
  renewals: RenewalTerms[];
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by: string;
  executed_at: string | null;
  metadata: Record<string, unknown>;
}

export interface ContractSummary {
  contract_id: string;
  contract_number: string;
  distributor_name: string;
  contract_type: ContractType;
  distributor_tier: DistributorTier;
  status: ContractStatus;
  territories: string[];
  total_commitment: number;
  currency: CurrencyCode;
  effective_date: string;
  expiration_date: string;
  days_until_expiration: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ComplianceCheck {
  framework: string;
  region: string;
  required: boolean;
  in_contract: boolean;
  distributor_certified: boolean;
  passed: boolean;
  message: string;
}

export interface TerritoryConflict {
  type: string;
  existing_contract: string;
  existing_distributor: string;
  territory: string;
  countries: string[];
  message: string;
}

export interface ContractValidationResult {
  is_valid: boolean;
  contract_id: string;
  validation_timestamp: string;
  errors: ValidationError[];
  warnings: ValidationError[];
  compliance_checks: ComplianceCheck[];
  territory_conflicts: TerritoryConflict[];
  pricing_issues: Record<string, string>[];
  commitment_gaps: Record<string, string>[];
  recommendations: string[];
}

export interface ContractAnalytics {
  contract_id: string;
  contract_number: string;
  distributor_name: string;
  analysis_date: string;
  contract_value: ContractValue;
  performance_metrics: PerformanceMetrics;
  risk_assessment: RiskAssessment;
  territory_analysis: TerritoryAnalysis;
  recommendations: string[];
}

export interface ContractValue {
  total_commitment: number;
  annual_commitment: number;
  potential_rebates: number;
  mdf_allocation: number;
  net_contract_value: number;
  currency: CurrencyCode;
}

export interface PerformanceMetrics {
  commitment_achievement: number;
  growth_rate: number;
  customer_acquisition: number;
  territory_coverage: number;
  compliance_score: number;
}

export interface RiskAssessment {
  overall_risk: string;
  credit_risk: string;
  compliance_risk: string;
  territory_risk: string;
  concentration_risk: string;
  risk_factors: string[];
}

export interface TerritoryAnalysis {
  total_countries: number;
  total_population: number;
  total_gdp: number;
  market_potential: number;
  exclusive_territories: number;
  overlap_count: number;
}

export interface PricingCalculation {
  quote_id: string;
  product_id: string;
  quantity: number;
  currency: string;
  region: string;
  tier: string;
  years: number;
  pricing_breakdown: PricingBreakdown;
  unit_price: number;
  subtotal: number;
  annual_value: number;
  total_contract_value: number;
  total_discount_rate: number;
  total_savings: number;
  generated_at: string;
}

export interface PricingBreakdown {
  list_price: number;
  tier_discount: DiscountDetail;
  volume_discount: DiscountDetail;
  special_discount: DiscountDetail;
  multi_year_discount: DiscountDetail;
}

export interface DiscountDetail {
  rate: number;
  amount: number;
  price_after?: number;
}

export interface PriceList {
  price_list_id: string;
  tier: string;
  region: string;
  currency: string;
  effective_date: string;
  products: PriceListProduct[];
  volume_discounts: VolumeDiscount[];
  multi_year_discounts: Record<number, number>;
  generated_at: string;
}

export interface PriceListProduct {
  product_id: string;
  list_price: number;
  distributor_price: number;
  discount_rate: number;
  currency: string;
}

export interface VolumeDiscount {
  min_units: number;
  max_units: number | null;
  additional_discount: number;
}

export interface RebateCalculation {
  total_rebate: number;
  rebate_breakdown: RebateDetail[];
  effective_rebate_rate: number;
  calculation_date: string;
}

export interface RebateDetail {
  rebate_id: string;
  rebate_name: string;
  rebate_type: string;
  actual_revenue: number;
  actual_growth: number;
  new_customers: number;
  threshold_achieved: number | null;
  rebate_rate: number;
  calculated_rebate: number;
  maximum_rebate: number;
  final_rebate: number;
  calculation_date: string;
}

export interface ComplianceAssessment {
  distributor_id: string;
  distributor_name: string;
  tier: string;
  regions: string[];
  assessment_date: string;
  total_requirements: number;
  compliant_count: number;
  compliance_score: number;
  is_fully_compliant: boolean;
  assessment_results: ComplianceAssessmentResult[];
  compliance_gaps: ComplianceGap[];
  recommendations: string[];
}

export interface ComplianceAssessmentResult {
  requirement_id: string;
  framework: string;
  required: boolean;
  certification_required: boolean;
  has_certification: boolean;
  is_compliant: boolean;
  compliance_level: string;
}

export interface ComplianceGap {
  framework: string;
  requirement: string;
  certification_required: boolean;
  remediation_steps: string[];
}

export interface ComplianceStatus {
  contract_id: string;
  distributor_id: string;
  check_date: string;
  total_requirements: number;
  compliant_count: number;
  compliance_score: number;
  is_fully_compliant: boolean;
  status_items: ComplianceStatusItem[];
  pending_audits: number;
  risk_level: string;
}

export interface ComplianceStatusItem {
  requirement_id: string;
  requirement_name: string;
  compliance_level: string;
  certification_required: boolean;
  is_compliant: boolean;
  has_certification: boolean;
  certification_verified: boolean;
  audit_frequency: string;
  last_audit: string | null;
  next_audit_due: string | null;
}

export interface RegionInfo {
  code: string;
  name: string;
  countries: string[];
  population: number;
  gdp_usd: number;
  market_maturity: string;
  primary_languages: string[];
  time_zones: string[];
}

export interface RenewalEligibility {
  contract_id: string;
  is_eligible: boolean;
  days_until_expiration: number;
  expiration_date: string;
  urgency: string;
  blockers: string[];
  auto_renewal_enabled: boolean;
  notice_period_days: number;
  notice_deadline: string;
  checked_at: string;
}

export interface RenewalCalculation {
  renewal_id: string;
  contract_id: string;
  current_expiration: string;
  proposed_start: string;
  proposed_end: string;
  renewal_term_months: number;
  pricing: RenewalPricing;
  tier: RenewalTierInfo;
  commitments: RenewalCommitments;
  territory_changes: unknown[];
  product_changes: unknown[];
  auto_renewal: boolean;
  generated_at: string;
}

export interface RenewalPricing {
  adjustment_type: string;
  adjustment_percentage: number;
  current_credit_limit: number;
  proposed_credit_limit: number;
}

export interface RenewalTierInfo {
  current_tier: string;
  recommended_tier: string;
  tier_change_reason: string;
}

export interface RenewalCommitments {
  current_commitment: number;
  proposed_commitment: number;
  growth_expectation: number;
}

export interface ContractStatistics {
  total_contracts: number;
  total_distributors: number;
  by_status: Record<string, number>;
  by_tier: Record<string, number>;
  by_type: Record<string, number>;
  total_commitment_value: number;
  history_entries: number;
  generated_at: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  content?: string;
}

export interface NegotiationWorkflowSummary {
  workflow_id: string;
  contract_id: string;
  status: string;
  current_round: number;
  max_rounds: number;
  terms_summary: TermsSummary;
  approvals_summary: ApprovalsSummary;
  sessions_count: number;
  started_at: string;
  last_updated: string;
  deadlines: Record<string, string>;
}

export interface TermsSummary {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

export interface ApprovalsSummary {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

export interface HistoryEntry {
  timestamp: string;
  action: string;
  contract_id: string;
  details: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ContractGenerateRequest {
  distributor_data: Partial<DistributorProfile>;
  contract_type: ContractType;
  tier: DistributorTier;
  region: RegionCode;
  territories?: TerritoryRequest[];
  term_months?: number;
  currency?: CurrencyCode;
}

export interface TerritoryRequest {
  name: string;
  region: RegionCode;
  countries?: string[];
  is_exclusive?: boolean;
}

export interface StatusUpdateRequest {
  status: ContractStatus;
  reason?: string;
}

export interface NegotiationStartRequest {
  initial_terms?: NegotiationTermRequest[];
  max_rounds?: number;
  deadline_days?: number;
  stakeholders?: Record<string, string>[];
}

export interface NegotiationTermRequest {
  term_name: string;
  category?: string;
  original_value?: unknown;
  proposed_value?: unknown;
  is_negotiable?: boolean;
  minimum?: number;
  maximum?: number;
  justification?: string;
}

export interface CounterProposalRequest {
  proposed_changes: ProposedChange[];
  submitter: Record<string, string>;
  justification: string;
}

export interface ProposedChange {
  term_id: string;
  proposed_value: unknown;
  justification?: string;
}

export interface ApprovalRequest {
  approver_role: string;
  approver: Record<string, string>;
  approved: boolean;
  comments?: string;
}

export interface PricingRequest {
  product_id: string;
  quantity: number;
  tier: DistributorTier;
  currency?: CurrencyCode;
  region?: RegionCode;
  years?: number;
  special_discount?: number;
}

export interface RebateRequest {
  contract_id: string;
  actual_revenue: number;
  actual_growth?: number;
  new_customers?: number;
}

export interface AmendmentRequest {
  amendment_type: string;
  sections_modified: string[];
  original_terms: Record<string, unknown>;
  amended_terms: Record<string, unknown>;
  reason: string;
  approved_by: Record<string, string>[];
}

export interface RenewalRequest {
  renewal_terms: RenewalCalculation;
  approved_by: Record<string, string>;
}

export interface CertificationRequest {
  distributor_id: string;
  certification_name: string;
  certification_body: string;
  issue_date: string;
  expiry_date: string;
  certificate_number: string;
  scope?: string;
}

export interface AuditRequest {
  contract_id: string;
  distributor_id: string;
  audit_type: string;
  scheduled_date: string;
  auditor: Record<string, string>;
  scope: string[];
}

export interface TerritoryConflictCheckRequest {
  territory: TerritoryRequest;
}

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  [ContractType.MASTER_DISTRIBUTION]: "Master Distribution",
  [ContractType.REGIONAL_DISTRIBUTION]: "Regional Distribution",
  [ContractType.EXCLUSIVE_DISTRIBUTION]: "Exclusive Distribution",
  [ContractType.NON_EXCLUSIVE_DISTRIBUTION]: "Non-Exclusive Distribution",
  [ContractType.OEM_DISTRIBUTION]: "OEM Distribution",
  [ContractType.VAR_AGREEMENT]: "VAR Agreement",
  [ContractType.RESELLER_AGREEMENT]: "Reseller Agreement",
  [ContractType.GOVERNMENT_DISTRIBUTION]: "Government Distribution",
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: "Draft",
  [ContractStatus.PENDING_REVIEW]: "Pending Review",
  [ContractStatus.UNDER_NEGOTIATION]: "Under Negotiation",
  [ContractStatus.APPROVED]: "Approved",
  [ContractStatus.ACTIVE]: "Active",
  [ContractStatus.SUSPENDED]: "Suspended",
  [ContractStatus.EXPIRED]: "Expired",
  [ContractStatus.TERMINATED]: "Terminated",
  [ContractStatus.RENEWED]: "Renewed",
};

export const DISTRIBUTOR_TIER_LABELS: Record<DistributorTier, string> = {
  [DistributorTier.AUTHORIZED]: "Authorized",
  [DistributorTier.PREFERRED]: "Preferred",
  [DistributorTier.PREMIER]: "Premier",
  [DistributorTier.STRATEGIC]: "Strategic",
  [DistributorTier.GLOBAL_ELITE]: "Global Elite",
};

export const REGION_LABELS: Record<RegionCode, string> = {
  [RegionCode.AMERICAS]: "Americas",
  [RegionCode.EMEA]: "EMEA",
  [RegionCode.APAC]: "Asia Pacific",
  [RegionCode.LATAM]: "Latin America",
  [RegionCode.MENA]: "Middle East & North Africa",
  [RegionCode.DACH]: "DACH",
  [RegionCode.NORDICS]: "Nordics",
  [RegionCode.BENELUX]: "Benelux",
  [RegionCode.IBERIA]: "Iberia",
  [RegionCode.CEE]: "Central & Eastern Europe",
  [RegionCode.CIS]: "CIS",
  [RegionCode.ANZ]: "Australia & New Zealand",
  [RegionCode.GREATER_CHINA]: "Greater China",
  [RegionCode.INDIA_SUBCONTINENT]: "India & Subcontinent",
  [RegionCode.JAPAN_KOREA]: "Japan & Korea",
  [RegionCode.ASEAN]: "ASEAN",
  [RegionCode.AFRICA]: "Africa",
  [RegionCode.GLOBAL]: "Global",
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  [CurrencyCode.USD]: "$",
  [CurrencyCode.EUR]: "€",
  [CurrencyCode.GBP]: "£",
  [CurrencyCode.JPY]: "¥",
  [CurrencyCode.CHF]: "CHF",
  [CurrencyCode.AUD]: "A$",
  [CurrencyCode.CAD]: "C$",
  [CurrencyCode.SGD]: "S$",
  [CurrencyCode.HKD]: "HK$",
  [CurrencyCode.CNY]: "¥",
  [CurrencyCode.INR]: "₹",
  [CurrencyCode.AED]: "د.إ",
  [CurrencyCode.BRL]: "R$",
  [CurrencyCode.MXN]: "MX$",
  [CurrencyCode.ZAR]: "R",
};

export const STATUS_COLORS: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: "gray",
  [ContractStatus.PENDING_REVIEW]: "yellow",
  [ContractStatus.UNDER_NEGOTIATION]: "blue",
  [ContractStatus.APPROVED]: "green",
  [ContractStatus.ACTIVE]: "emerald",
  [ContractStatus.SUSPENDED]: "orange",
  [ContractStatus.EXPIRED]: "red",
  [ContractStatus.TERMINATED]: "red",
  [ContractStatus.RENEWED]: "purple",
};

export const TIER_COLORS: Record<DistributorTier, string> = {
  [DistributorTier.AUTHORIZED]: "gray",
  [DistributorTier.PREFERRED]: "blue",
  [DistributorTier.PREMIER]: "purple",
  [DistributorTier.STRATEGIC]: "amber",
  [DistributorTier.GLOBAL_ELITE]: "emerald",
};
