/**
 * Billing Dashboard Engine
 * 
 * Helper functions for billing dashboard UI calculations and visualizations
 */

export interface UsageBar {
  metric: string
  current: number
  limit: number
  percentage: number
  color: string
  status: 'safe' | 'warning' | 'critical' | 'unlimited'
}

export interface BillingHealth {
  overall: 'healthy' | 'warning' | 'critical'
  score: number
  issues: string[]
  recommendations: string[]
}

export interface PlanFeature {
  name: string
  free: boolean | string
  pro: boolean | string
  institutional: boolean | string
  government: boolean | string
}

export interface CustomerStatusCard {
  title: string
  value: string
  status: 'success' | 'warning' | 'error' | 'info'
  icon: string
}

export class BillingDashboardEngine {
  /**
   * Calculate usage bars for visualization
   */
  static calculateUsageBars(
    usage: Record<string, number>,
    limits: Record<string, number>
  ): UsageBar[] {
    const bars: UsageBar[] = []

    for (const [metric, current] of Object.entries(usage)) {
      const limit = limits[metric] || -1
      
      let percentage = 0
      let status: 'safe' | 'warning' | 'critical' | 'unlimited' = 'safe'
      let color = 'green'

      if (limit === -1) {
        percentage = 0
        status = 'unlimited'
        color = 'blue'
      } else {
        percentage = (current / limit) * 100

        if (percentage >= 90) {
          status = 'critical'
          color = 'red'
        } else if (percentage >= 75) {
          status = 'warning'
          color = 'yellow'
        } else {
          status = 'safe'
          color = 'green'
        }
      }

      bars.push({
        metric: this.formatMetricName(metric),
        current,
        limit,
        percentage: Math.min(percentage, 100),
        color,
        status
      })
    }

    return bars
  }

  /**
   * Compute billing health score
   */
  static computeBillingHealth(summary: any): BillingHealth {
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    if (summary.fraud_risk) {
      issues.push('Fraud risk detected - multiple payment failures')
      score -= 30
    }

    if (summary.overdue) {
      issues.push('Account has overdue invoices')
      score -= 25
    }

    if (summary.failed_payments_count > 0) {
      issues.push(`${summary.failed_payments_count} failed payment(s)`)
      score -= summary.failed_payments_count * 10
    }

    if (summary.unpaid_invoices && summary.unpaid_invoices.length > 0) {
      issues.push(`${summary.unpaid_invoices.length} unpaid invoice(s)`)
      score -= summary.unpaid_invoices.length * 5
    }

    if (summary.usage_this_month && summary.usage_limits) {
      for (const [metric, usage] of Object.entries(summary.usage_this_month)) {
        const limit = summary.usage_limits[metric]
        if (limit > 0) {
          const percentage = ((usage as number) / limit) * 100
          if (percentage >= 90) {
            issues.push(`${this.formatMetricName(metric)} usage at ${percentage.toFixed(0)}%`)
            recommendations.push(`Consider upgrading plan for more ${this.formatMetricName(metric)}`)
            score -= 5
          }
        }
      }
    }

    if (summary.payment_status === 'overdue') {
      recommendations.push('Update payment method to avoid service interruption')
    }

    if (score < 0) score = 0

    let overall: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (score < 50) {
      overall = 'critical'
    } else if (score < 75) {
      overall = 'warning'
    }

    return {
      overall,
      score,
      issues,
      recommendations
    }
  }

  /**
   * Compute plan features comparison
   */
  static computePlanFeatures(): PlanFeature[] {
    return [
      {
        name: 'API Calls/Month',
        free: '1,000',
        pro: '100,000',
        institutional: '10M',
        government: 'Unlimited'
      },
      {
        name: 'Predictions/Month',
        free: '100',
        pro: '10,000',
        institutional: '1M',
        government: 'Unlimited'
      },
      {
        name: 'Users',
        free: '1',
        pro: '5',
        institutional: '100',
        government: 'Unlimited'
      },
      {
        name: 'Intelligence Modules',
        free: '2',
        pro: '6',
        institutional: '14',
        government: '14'
      },
      {
        name: 'SLA Uptime',
        free: '99.0%',
        pro: '99.5%',
        institutional: '99.95%',
        government: '99.99%'
      },
      {
        name: 'Support Level',
        free: 'Community',
        pro: 'Email',
        institutional: 'White Glove',
        government: 'Dedicated'
      },
      {
        name: 'KYC Required',
        free: false,
        pro: false,
        institutional: true,
        government: true
      },
      {
        name: 'Risk Scoring',
        free: false,
        pro: true,
        institutional: true,
        government: true
      },
      {
        name: 'Custom Integrations',
        free: false,
        pro: false,
        institutional: true,
        government: true
      },
      {
        name: 'White Label',
        free: false,
        pro: false,
        institutional: true,
        government: true
      }
    ]
  }

  /**
   * Detect anomalies in billing data
   */
  static anomalyDetection(
    usage: Record<string, number>,
    previousUsage: Record<string, number>
  ): string[] {
    const anomalies: string[] = []

    for (const [metric, current] of Object.entries(usage)) {
      const previous = previousUsage[metric] || 0

      if (previous === 0) continue

      const change = ((current - previous) / previous) * 100

      if (change > 200) {
        anomalies.push(`${this.formatMetricName(metric)} spiked ${change.toFixed(0)}%`)
      }

      if (change < -50) {
        anomalies.push(`${this.formatMetricName(metric)} dropped ${Math.abs(change).toFixed(0)}%`)
      }
    }

    return anomalies
  }

  /**
   * Get color for status
   */
  static getColorForStatus(status: string): string {
    const colorMap: Record<string, string> = {
      'active': 'green',
      'past_due': 'yellow',
      'canceled': 'red',
      'trialing': 'blue',
      'incomplete': 'gray',
      'paid': 'green',
      'open': 'yellow',
      'void': 'gray',
      'uncollectible': 'red',
      'current': 'green',
      'overdue': 'red',
      'at_risk': 'yellow'
    }

    return colorMap[status] || 'gray'
  }

  /**
   * Get customer status cards
   */
  static getCustomerStatusCard(summary: any): CustomerStatusCard[] {
    const cards: CustomerStatusCard[] = []

    if (summary.subscription_status) {
      cards.push({
        title: 'Subscription',
        value: summary.subscription_status.toUpperCase(),
        status: summary.subscription_status === 'active' ? 'success' : 'warning',
        icon: 'subscription'
      })
    }

    cards.push({
      title: 'Payment',
      value: summary.payment_status.toUpperCase(),
      status: summary.payment_status === 'current' ? 'success' : 
              summary.payment_status === 'overdue' ? 'error' : 'warning',
      icon: 'payment'
    })

    if (summary.upcoming_invoice_amount > 0) {
      cards.push({
        title: 'Next Invoice',
        value: `$${summary.upcoming_invoice_amount.toFixed(2)}`,
        status: 'info',
        icon: 'invoice'
      })
    }

    if (summary.fraud_risk) {
      cards.push({
        title: 'Risk Alert',
        value: 'FRAUD RISK',
        status: 'error',
        icon: 'alert'
      })
    }

    return cards
  }

  /**
   * Format metric name for display
   */
  static formatMetricName(metric: string): string {
    return metric
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  /**
   * Format number with commas
   */
  static formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num)
  }

  /**
   * Calculate days until date
   */
  static daysUntil(dateString: string): number {
    const date = new Date(dateString)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Get status badge color classes
   */
  static getStatusBadgeClasses(status: string): string {
    const color = this.getColorForStatus(status)
    
    const classMap: Record<string, string> = {
      'green': 'bg-green-500/20 border-green-500/50 text-green-400',
      'yellow': 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
      'red': 'bg-red-500/20 border-red-500/50 text-red-400',
      'blue': 'bg-blue-500/20 border-blue-500/50 text-blue-400',
      'gray': 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }

    return classMap[color] || classMap['gray']
  }

  /**
   * Generate usage chart data
   */
  static generateUsageChartData(
    usage: Record<string, number>,
    limits: Record<string, number>
  ): any[] {
    const data: any[] = []

    for (const [metric, current] of Object.entries(usage)) {
      const limit = limits[metric] || -1

      data.push({
        metric: this.formatMetricName(metric),
        current,
        limit: limit === -1 ? current * 1.5 : limit,
        percentage: limit === -1 ? 0 : (current / limit) * 100
      })
    }

    return data.sort((a, b) => b.current - a.current)
  }
}
