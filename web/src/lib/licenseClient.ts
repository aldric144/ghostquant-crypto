/**
 * License Client
 * 
 * Frontend client for Enterprise API Licensing Framework
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

export interface LicensePermissions {
  tier: string
  allowed_engines: string[]
  rate_limit_per_month: number
  rate_limit_per_day: number
  rate_limit_per_hour: number
  concurrency_limit: number
  ip_whitelist: string[]
  allow_analytics: boolean
  allow_export: boolean
  allow_webhooks: boolean
}

export interface LicenseKey {
  api_key: string
  customer_name: string
  customer_email: string
  tier: string
  status: string
  created_at: string
  expires_at?: string
  revoked_at?: string
  last_used_at?: string
}

export interface LicenseUsage {
  api_key: string
  total_requests: number
  requests_today: number
  requests_this_hour: number
  requests_this_month: number
  usage_percentage_hour?: number
  usage_percentage_day?: number
  usage_percentage_month?: number
  remaining_hour?: number
  remaining_day?: number
  remaining_month?: number
  engine_usage: Record<string, number>
  last_used_at?: string
}

export interface LicenseRecord {
  key: LicenseKey
  permissions: LicensePermissions
  usage: LicenseUsage
}

export interface LicenseValidationResult {
  valid: boolean
  api_key?: string
  reason?: string
  tier?: string
  allowed_engines: string[]
  remaining_requests_today?: number
  remaining_requests_hour?: number
  remaining_requests_month?: number
}

export interface CreateLicenseRequest {
  customer_name: string
  customer_email: string
  tier: string
  custom_permissions?: Partial<LicensePermissions>
  expires_in_days?: number
  ip_whitelist?: string[]
}

export interface ValidateRequest {
  api_key: string
  module_name: string
  client_ip?: string
}

export class LicenseClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  /**
   * Create a new API license
   */
  async createLicense(request: CreateLicenseRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create license')
    }

    return response.json()
  }

  /**
   * Validate an API request
   */
  async validate(request: ValidateRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Validation failed')
    }

    return response.json()
  }

  /**
   * Get usage statistics for a license
   */
  async getUsage(apiKey: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/usage/${apiKey}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get usage')
    }

    return response.json()
  }

  /**
   * Get usage history for a license
   */
  async getUsageHistory(apiKey: string, limit: number = 100): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/usage/${apiKey}/history?limit=${limit}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get usage history')
    }

    return response.json()
  }

  /**
   * List all licenses
   */
  async list(status?: string, tier?: string): Promise<any> {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (tier) params.append('tier', tier)

    const url = `${this.baseUrl}/license/list${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to list licenses')
    }

    return response.json()
  }

  /**
   * Revoke a license
   */
  async revoke(apiKey: string, reason?: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/revoke/${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to revoke license')
    }

    return response.json()
  }

  /**
   * Suspend a license
   */
  async suspend(apiKey: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/suspend/${apiKey}`, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to suspend license')
    }

    return response.json()
  }

  /**
   * Reactivate a suspended license
   */
  async reactivate(apiKey: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/reactivate/${apiKey}`, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to reactivate license')
    }

    return response.json()
  }

  /**
   * Update license permissions
   */
  async updatePermissions(apiKey: string, permissions: Partial<LicensePermissions>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/update/${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(permissions),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to update permissions')
    }

    return response.json()
  }

  /**
   * Extend license expiration
   */
  async extend(apiKey: string, additionalDays: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/extend/${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ additional_days: additionalDays }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to extend license')
    }

    return response.json()
  }

  /**
   * Export license to JSON
   */
  async export(apiKey: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/export/${apiKey}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to export license')
    }

    return response.json()
  }

  /**
   * Import license from JSON
   */
  async import(licenseData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(licenseData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to import license')
    }

    return response.json()
  }

  /**
   * Get platform-wide analytics
   */
  async getAnalytics(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/analytics`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get analytics')
    }

    return response.json()
  }

  /**
   * Get all tier definitions
   */
  async getTiers(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/tiers`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get tiers')
    }

    return response.json()
  }

  /**
   * Get tier information
   */
  async getTierInfo(tier: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/tiers/${tier}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get tier info')
    }

    return response.json()
  }

  /**
   * Health check
   */
  async health(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/health`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Health check failed')
    }

    return response.json()
  }

  /**
   * Get license engine information
   */
  async info(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/license/info`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get info')
    }

    return response.json()
  }
}

export const licenseClient = new LicenseClient()
