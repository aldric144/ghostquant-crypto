/**
 * Billing Client
 * 
 * Frontend client for Billing System & Payment Gateway Integration
 * Never throws errors - always returns {success: false, error: "..."} on failure
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

export interface BillingCustomer {
  id: string
  email: string
  name: string
  currency: string
  default_payment_method?: string
  fraud_risk: boolean
  overdue: boolean
  failed_payments_count: number
}

export interface Subscription {
  id: string
  customer_id: string
  plan_id: string
  status: string
  billing_period: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export interface Invoice {
  id: string
  customer_id: string
  subscription_id?: string
  status: string
  currency: string
  subtotal: number
  tax: number
  total: number
  amount_due: number
  amount_paid: number
  line_items: any[]
  due_date: string
  paid_at?: string
}

export interface BillingSummary {
  customer_id: string
  current_plan?: any
  subscription_status?: string
  usage_this_month: Record<string, number>
  usage_limits: Record<string, number>
  unpaid_invoices: any[]
  upcoming_invoice_amount: number
  payment_status: string
  last_payment_date?: string
  next_payment_date?: string
  fraud_risk: boolean
  overdue: boolean
  failed_payments_count: number
  summary: string
}

export class BillingClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  /**
   * Create a billing customer
   */
  async createCustomer(profile: {
    email: string
    name: string
    currency?: string
    metadata?: Record<string, any>
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create customer'
      }
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPayment(customerId: string, stripeToken: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          stripe_token: stripeToken
        }),
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to attach payment'
      }
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(customerId: string, planId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          plan_id: planId
        }),
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create subscription'
      }
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, atPeriodEnd: boolean = false): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          at_period_end: atPeriodEnd
        }),
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to cancel subscription'
      }
    }
  }

  /**
   * Record usage for a customer
   */
  async recordUsage(customerId: string, metric: string, amount: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          metric: metric,
          amount: amount
        }),
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to record usage'
      }
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/invoice/${invoiceId}`)

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get invoice'
      }
    }
  }

  /**
   * Get billing summary for customer
   */
  async getSummary(customerId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/summary/${customerId}`)

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get billing summary'
      }
    }
  }

  /**
   * Get billing metrics and daily report
   */
  async getMetrics(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/metrics`)

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get metrics'
      }
    }
  }

  /**
   * Health check
   */
  async health(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/health`)

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Health check failed'
      }
    }
  }

  /**
   * Get billing system information
   */
  async info(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/info`)

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get info'
      }
    }
  }
}

export const billingClient = new BillingClient()
