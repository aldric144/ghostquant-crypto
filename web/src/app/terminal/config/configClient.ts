/**
 * GhostQuant™ — System-Wide Configuration Security & Environment Isolation
 * Module: configClient.ts
 * Purpose: API client for configuration management
 * 
 * SECURITY NOTICE:
 * - All API calls use fetch with proper JSON headers
 * - No raw configuration values are ever returned from API
 * - Only metadata and validation status
 * - Comprehensive error handling
 */

const API_BASE = '/api';

export interface ConfigItem {
  key: string;
  value_type: string;
  default_value: string | number | boolean | null;
  environment: string;
  classification: string;
  description: string;
  last_loaded: string;
  is_set: boolean;
  is_valid: boolean;
  validation_errors: string[];
  required: boolean;
  sensitive: boolean;
}

export interface ConfigSet {
  environment: string;
  items: ConfigItem[];
  loaded_at: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  total_items: number;
  set_items: number;
  required_items: number;
  missing_required: number;
}

export interface ConfigValidationIssue {
  key: string;
  message: string;
  severity: string;
  detected_at: string;
  environment: string | null;
  resolution: string;
}

export interface EnvironmentHealth {
  environment: string;
  status: string;
  total_configs: number;
  valid_configs: number;
  invalid_configs: number;
  missing_required: number;
  misconfigurations: number;
  critical_issues: number;
  warnings: number;
  last_check: string;
}

export interface IsolationViolation {
  violation_type: string;
  source_environment: string;
  target_environment: string;
  action: string;
  message: string;
  timestamp: string;
}

export interface PolicyViolation {
  violation_id: string;
  config_key: string;
  policy_key: string;
  violation_type: string;
  severity: string;
  description: string;
  detected_at: string;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
}

/**
 * Get configuration summary
 */
export async function getConfig(): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE}/config/config`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.summary || {};
    } else {
      console.error('Failed to get config:', data.error);
      return {};
    }
  } catch (error) {
    console.error('Error getting config:', error);
    return {};
  }
}

/**
 * Get current environment information
 */
export async function getEnvironment(): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE}/config/config/environment`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return {
        environment: data.environment,
        health: data.health
      };
    } else {
      console.error('Failed to get environment:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error getting environment:', error);
    return null;
  }
}

/**
 * List all configuration items (metadata only)
 */
export async function getItems(environment?: string): Promise<ConfigItem[]> {
  try {
    const url = environment
      ? `${API_BASE}/config/config/items?environment=${environment}`
      : `${API_BASE}/config/config/items`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.items || [];
    } else {
      console.error('Failed to get items:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error getting items:', error);
    return [];
  }
}

/**
 * Get specific configuration item metadata
 */
export async function getItem(key: string): Promise<ConfigItem | null> {
  try {
    const response = await fetch(
      `${API_BASE}/config/config/item/${encodeURIComponent(key)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.item || null;
    } else {
      console.error('Failed to get item:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
}

/**
 * Validate configuration
 */
export async function validate(environment?: string): Promise<any> {
  try {
    const url = environment
      ? `${API_BASE}/config/config/validate?environment=${environment}`
      : `${API_BASE}/config/config/validate`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      return {
        environment: data.environment,
        valid: data.valid,
        total_items: data.total_items,
        set_items: data.set_items,
        missing_required: data.missing_required,
        issues: data.issues || [],
        misconfigurations: data.misconfigurations || []
      };
    } else {
      console.error('Failed to validate:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error validating:', error);
    return null;
  }
}

/**
 * Get environment isolation report
 */
export async function isolation(): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE}/config/config/isolation`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.report || {};
    } else {
      console.error('Failed to get isolation report:', data.error);
      return {};
    }
  } catch (error) {
    console.error('Error getting isolation report:', error);
    return {};
  }
}

/**
 * Get isolation violations
 */
export async function getIsolationViolations(limit: number = 100): Promise<IsolationViolation[]> {
  try {
    const response = await fetch(
      `${API_BASE}/config/config/isolation/violations?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.violations || [];
    } else {
      console.error('Failed to get isolation violations:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error getting isolation violations:', error);
    return [];
  }
}

/**
 * Get allowed actions for target environment
 */
export async function getAllowedActions(targetEnvironment: string): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE}/config/config/isolation/allowed?target_environment=${targetEnvironment}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return {
        target_environment: data.target_environment,
        allowed_actions: data.allowed_actions || [],
        blocked_actions: data.blocked_actions || []
      };
    } else {
      console.error('Failed to get allowed actions:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error getting allowed actions:', error);
    return null;
  }
}

/**
 * Get governance report
 */
export async function governance(): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE}/config/config/governance`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.report || {};
    } else {
      console.error('Failed to get governance report:', data.error);
      return {};
    }
  } catch (error) {
    console.error('Error getting governance report:', error);
    return {};
  }
}

/**
 * Get governance policies
 */
export async function getGovernancePolicies(activeOnly: boolean = true): Promise<any[]> {
  try {
    const response = await fetch(
      `${API_BASE}/config/config/governance/policies?active_only=${activeOnly}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.policies || [];
    } else {
      console.error('Failed to get governance policies:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error getting governance policies:', error);
    return [];
  }
}

/**
 * Get governance violations
 */
export async function getGovernanceViolations(): Promise<PolicyViolation[]> {
  try {
    const response = await fetch(
      `${API_BASE}/config/config/governance/violations`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.violations || [];
    } else {
      console.error('Failed to get governance violations:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error getting governance violations:', error);
    return [];
  }
}

/**
 * Get compliance summary
 */
export async function getComplianceSummary(): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE}/config/config/governance/compliance`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.compliance || {};
    } else {
      console.error('Failed to get compliance summary:', data.error);
      return {};
    }
  } catch (error) {
    console.error('Error getting compliance summary:', error);
    return {};
  }
}

/**
 * Get misconfigurations
 */
export async function getMisconfigurations(): Promise<ConfigItem[]> {
  try {
    const response = await fetch(
      `${API_BASE}/config/config/misconfigurations`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.misconfigurations || [];
    } else {
      console.error('Failed to get misconfigurations:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error getting misconfigurations:', error);
    return [];
  }
}

/**
 * Perform health check
 */
export async function health(): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE}/config/config/health`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.health || null;
    } else {
      console.error('Failed to get health status:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error getting health status:', error);
    return null;
  }
}
