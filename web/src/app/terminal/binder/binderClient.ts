/**
 * GhostQuant™ — Regulatory Audit Binder Generator
 * Module: binderClient.ts
 * Purpose: API client for audit binder operations
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export interface BinderSection {
  id: string;
  title: string;
  order: number;
  filename: string;
  generated_at?: string;
}

export interface BinderAttachment {
  filename: string;
  description: string;
  type: string;
  generated_at?: string;
}

export interface BinderMetadata {
  binder_id: string;
  name: string;
  generated_at: string;
  section_count: number;
  attachment_count: number;
  sections: BinderSection[];
  attachments: BinderAttachment[];
  metadata?: Record<string, any>;
}

export interface BinderListItem {
  binder_id: string;
  name: string;
  generated_at: string;
  section_count: number;
  attachment_count: number;
  directory: string;
  metadata_file: string;
}

export interface GenerateBinderResponse {
  success: boolean;
  message?: string;
  binder_id?: string;
  binder_name?: string;
  section_count?: number;
  attachment_count?: number;
  export_directory?: string;
  files_exported?: number;
  generated_at?: string;
  exported_at?: string;
  download_url?: string;
  error?: string;
}

export interface BinderHealthResponse {
  success: boolean;
  health?: {
    status: string;
    engine: {
      builder_initialized: boolean;
      exporter_initialized: boolean;
      latest_binder: string | null;
    };
    exporter: {
      status: string;
      base_export_dir: string;
      base_dir_exists: boolean;
      base_dir_writable: boolean;
      binder_count: number;
      total_size_bytes: number;
      total_size_mb: number;
      timestamp: string;
    };
    timestamp: string;
  };
  error?: string;
}

export interface BinderStatisticsResponse {
  success: boolean;
  statistics?: {
    total_binders: number;
    total_sections: number;
    total_attachments: number;
    average_sections_per_binder: number;
    average_attachments_per_binder: number;
    latest_binder: BinderListItem | null;
    timestamp: string;
  };
  error?: string;
}

/**
 * Generate new audit binder
 */
export async function generateBinder(name?: string): Promise<GenerateBinderResponse> {
  try {
    const url = new URL(`${API_BASE}/binder/generate`);
    if (name) {
      url.searchParams.append('name', name);
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating binder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get latest binder metadata
 */
export async function getLatestBinder(): Promise<{ success: boolean; data?: BinderMetadata; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/binder/latest`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error getting latest binder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * List all exported binders
 */
export async function listBinders(): Promise<{ success: boolean; binders?: BinderListItem[]; count?: number; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/binder/list`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      binders: data.binders || [],
      count: data.count || 0,
    };
  } catch (error) {
    console.error('Error listing binders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get binder metadata by ID
 */
export async function getBinderMetadata(binderId: string): Promise<{ success: boolean; metadata?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/binder/metadata/${binderId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      metadata: data.metadata,
    };
  } catch (error) {
    console.error('Error getting binder metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Download binder file
 */
export async function downloadBinderFile(binderId: string, filePath: string): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/binder/download/${binderId}/${filePath}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const content = await response.text();
    return {
      success: true,
      content,
    };
  } catch (error) {
    console.error('Error downloading binder file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete binder
 */
export async function deleteBinder(binderId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/binder/delete/${binderId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting binder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get binder system health
 */
export async function getBinderHealth(): Promise<BinderHealthResponse> {
  try {
    const response = await fetch(`${API_BASE}/binder/health`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting binder health:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get binder statistics
 */
export async function getBinderStatistics(): Promise<BinderStatisticsResponse> {
  try {
    const response = await fetch(`${API_BASE}/binder/statistics`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting binder statistics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Cleanup old binders
 */
export async function cleanupOldBinders(days: number = 30): Promise<{ success: boolean; deleted_count?: number; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/binder/cleanup?days=${days}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cleaning up old binders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
