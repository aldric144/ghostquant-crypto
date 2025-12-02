/**
 * GhostQuant™ — Secure Key Management & Secrets Governance
 * Module: secretsClient.ts
 * Purpose: API client for secrets management
 * 
 * SECURITY NOTICE:
 * - All API calls use fetch with proper JSON headers
 * - No raw secret values are ever returned from API
 * - All access is logged for audit compliance
 * - Comprehensive error handling
 */

const API_BASE = '/api';

export interface SecretMetadata {
  name: string;
  value_hash: string;
  created_at: string;
  last_rotated: string;
  rotations_count: number;
  environment: string;
  classification: string;
  owner: string;
  purpose: string;
  rotation_frequency_days: number;
  is_active: boolean;
}

export interface AccessLog {
  timestamp: string;
  name: string;
  actor: string;
  action: string;
  ip: string;
  success: boolean;
  reason: string;
  metadata?: Record<string, any>;
}

export interface GovernancePolicy {
  policy_id: string;
  secret_pattern: string;
  classification: string;
  allowed_roles: string[];
  rotation_frequency_days: number;
  encryption_required: boolean;
  approval_required: boolean;
  compliance_frameworks: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface PolicyViolation {
  violation_id: string;
  secret_name: string;
  policy_id: string;
  violation_type: string;
  severity: string;
  description: string;
  detected_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

export interface HealthStatus {
  status: string;
  secrets: {
    total: number;
    active: number;
    stale: number;
    critical: number;
  };
  rotation: {
    total_rotations: number;
    successful: number;
    failed: number;
    last_24h: number;
  };
  governance: {
    total_policies: number;
    total_violations: number;
    critical_violations: number;
    compliance_percentage: number;
  };
  audit: {
    total_logs: number;
  };
}

/**
 * Get all secrets (metadata only, no values)
 */
export async function getSecrets(includeInactive: boolean = false): Promise<SecretMetadata[]> {
  try {
    const response = await fetch(
      `${API_BASE}/secrets/secrets?include_inactive=${includeInactive}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.secrets || [];
    } else {
      console.error('Failed to get secrets:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error getting secrets:', error);
    return [];
  }
}

/**
 * Get metadata for a specific secret (no value returned)
 */
export async function getSecret(name: string): Promise<SecretMetadata | null> {
  try {
    const response = await fetch(
      `${API_BASE}/secrets/secrets/${encodeURIComponent(name)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.secret || null;
    } else {
      console.error('Failed to get secret:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error getting secret:', error);
    return null;
  }
}

/**
 * Rotate a secret to a new value
 */
export async function rotateSecret(name: string, newValue: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE}/secrets/secrets/rotate/${encodeURIComponent(name)}?new_value=${encodeURIComponent(newValue)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return true;
    } else {
      console.error('Failed to rotate secret:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error rotating secret:', error);
    return false;
  }
}

/**
 * Delete a secret (marks as inactive)
 */
export async function deleteSecret(name: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE}/secrets/secrets/delete/${encodeURIComponent(name)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return true;
    } else {
      console.error('Failed to delete secret:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error deleting secret:', error);
    return false;
  }
}

/**
 * Export all secrets metadata for backup/audit
 */
export async function getMetadata(): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE}/secrets/secrets/metadata`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.metadata || {};
    } else {
      console.error('Failed to get metadata:', data.error);
      return {};
    }
  } catch (error) {
    console.error('Error getting metadata:', error);
    return {};
  }
}

/**
 * Get comprehensive governance report
 */
export async function getGovernance(): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE}/secrets/secrets/governance`,
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
export async function getGovernancePolicies(activeOnly: boolean = true): Promise<GovernancePolicy[]> {
  try {
    const response = await fetch(
      `${API_BASE}/secrets/secrets/governance/policies?active_only=${activeOnly}`,
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
 * Detect policy violations
 */
export async function getViolations(): Promise<PolicyViolation[]> {
  try {
    const response = await fetch(
      `${API_BASE}/secrets/secrets/governance/violations`,
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
      console.error('Failed to get violations:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error getting violations:', error);
    return [];
  }
}

/**
 * Get recent access logs
 */
export async function getLogs(limit: number = 100): Promise<AccessLog[]> {
  try {
    const response = await fetch(
      `${API_BASE}/secrets/secrets/logs?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.logs || [];
    } else {
      console.error('Failed to get logs:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error getting logs:', error);
    return [];
  }
}

/**
 * Get rotation report
 */
export async function getRotationReport(): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE}/secrets/secrets/rotation/report`,
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
      console.error('Failed to get rotation report:', data.error);
      return {};
    }
  } catch (error) {
    console.error('Error getting rotation report:', error);
    return {};
  }
}

/**
 * Detect stale keys
 */
export async function getStaleKeys(thresholdDays?: number): Promise<any[]> {
  try {
    const url = thresholdDays
      ? `${API_BASE}/secrets/secrets/rotation/stale?threshold_days=${thresholdDays}`
      : `${API_BASE}/secrets/secrets/rotation/stale`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.stale_secrets || [];
    } else {
      console.error('Failed to get stale keys:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error getting stale keys:', error);
    return [];
  }
}

/**
 * Perform health check
 */
export async function health(): Promise<HealthStatus | null> {
  try {
    const response = await fetch(
      `${API_BASE}/secrets/secrets/health`,
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
