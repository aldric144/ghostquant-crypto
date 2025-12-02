/**
 * Pricing Client
 * 
 * Frontend client for Pricing Engine & Revenue Model Generator
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface PricingTier {
  name: string
  category: string
  monthly_price: number
  annual_price: number
  included_modules: string[]
  rate_limit_per_month: number
  rate_limit_per_day: number
  overage_fee_per_1k: number
  support_level: string
  sla_uptime: number
  max_users: number
  api_access: boolean
  export_enabled: boolean
  webhooks_enabled: boolean
  custom_integrations: boolean
  white_label: boolean
  dedicated_instance: boolean
}

export interface UsageCostBreakdown {
  breakdown: Record<string, { count: number; cost: number }>
  total_cost: number
  total_requests: number
  pricing_rates: Record<string, number>
}

export interface EnterpriseContract {
  contract_type: string
  organization_name: string
  annual_commit: number
  per_user_cost: number
  per_engine_cost: number
  government_multiplier: number
  discount_rate: number
  included_users: number
  included_engines: string[]
  support_level: string
  sla_uptime: number
  onboarding_fee: number
  training_hours: number
  custom_integrations: boolean
  white_label: boolean
  dedicated_instance: boolean
}

export interface RevenueProjection {
  monthly_revenue: number
  annual_revenue: number
  three_year_projection: number
  breakdown_by_tier: Record<string, number>
  growth_rate: number
  total_users: number
  summary: string
}

export class PricingClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  /**
   * Get all pricing tiers
   */
  async getTiers(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pricing/tiers`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get tiers')
    }

    return response.json()
  }

  /**
   * Get specific pricing tier
   */
  async getTier(tierName: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pricing/tier/${tierName}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get tier')
    }

    return response.json()
  }

  /**
   * Calculate usage cost
   */
  async calculateUsageCost(usage: Record<string, number>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pricing/usage-cost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usage),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to calculate usage cost')
    }

    return response.json()
  }

  /**
   * Calculate enterprise contract
   */
  async calculateEnterpriseContract(params: {
    contract_type: string
    organization_name: string
    num_users: number
    num_engines: number
    is_government: boolean
    discount_rate: number
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pricing/enterprise-contract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to calculate enterprise contract')
    }

    return response.json()
  }

  /**
   * Project revenue
   */
  async projectRevenue(params: {
    tier_distribution: Record<string, number>
    growth_rate: number
    months: number
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pricing/revenue-projection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to project revenue')
    }

    return response.json()
  }

  /**
   * Suggest best plan
   */
  async suggestBestPlan(usage: {
    monthly_requests: number
    required_engines: string[]
    num_users: number
    needs_api: boolean
    needs_export: boolean
    needs_webhooks: boolean
    needs_custom_integrations: boolean
    is_enterprise: boolean
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pricing/suggest-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usage),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to suggest plan')
    }

    return response.json()
  }

  /**
   * Compare tiers
   */
  async compareTiers(tierA: string, tierB: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pricing/compare-tiers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tier_a: tierA, tier_b: tierB }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to compare tiers')
    }

    return response.json()
  }

  /**
   * Optimize pricing
   */
  async optimizePricing(profile: {
    organization_type: string
    annual_budget: number
    num_users: number
    expected_usage: number
    required_engines: string[]
    priority_features: string[]
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pricing/optimize-pricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to optimize pricing')
    }

    return response.json()
  }

  /**
   * Health check
   */
  async health(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pricing/health`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Health check failed')
    }

    return response.json()
  }

  /**
   * Get pricing engine information
   */
  async info(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pricing/info`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get info')
    }

    return response.json()
  }
}

export const pricingClient = new PricingClient()
