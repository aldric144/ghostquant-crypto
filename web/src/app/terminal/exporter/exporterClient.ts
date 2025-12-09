/**
 * GhostQuant™ — Full Compliance Documentation Exporter System
 * Module: exporterClient.ts
 * Purpose: API client for compliance documentation export
 * 
 * SECURITY NOTICE:
 * - NO sensitive information in exports
 * - Only metadata, policies, architecture, controls
 * - All exports are read-only documentation
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export interface ComplianceDocument {
  doc_id: string;
  name: string;
  doc_type: string;
  version: string;
  generated_at: string;
  sections_count: number;
  compliance_frameworks: string[];
}

export interface ExportResult {
  success: boolean;
  file_path: string;
  format: string;
  error?: string;
  doc_id: string;
  doc_type: string;
  file_size: number;
  exported_at: string;
}

export interface DocumentType {
  type: string;
  name: string;
  description: string;
  frameworks: string[];
  sections_count: number;
}

export interface ExportFile {
  filename: string;
  file_path: string;
  file_size: number;
  format: string;
  doc_id: string;
  doc_type: string;
  modified_at: string;
}

export interface ExporterHealth {
  status: string;
  export_directory: string;
  directory_exists: boolean;
  directory_writable: boolean;
  total_exports: number;
  total_size_bytes: number;
  format_breakdown: Record<string, number>;
  manifest: {
    total_exports: number;
    successful_exports: number;
    failed_exports: number;
  };
  checked_at: string;
}

export interface ExportStatistics {
  total_exports: number;
  total_size_bytes: number;
  by_format: Record<string, { count: number; total_size: number }>;
  by_doc_type: Record<string, { count: number; total_size: number }>;
  oldest_export?: {
    filename: string;
    modified_at: string;
  };
  newest_export?: {
    filename: string;
    modified_at: string;
  };
}

/**
 * Get exporter system information
 */
export async function getExporterInfo(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/exporter/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching exporter info:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * List all available document types
 */
export async function getDocumentTypes(): Promise<{ success: boolean; document_types?: DocumentType[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/exporter/docs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching document types:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Generate a compliance document
 * 
 * @param docType - Type of document to generate (cjis, nist, soc2, etc.)
 */
export async function generateDocument(docType: string): Promise<{
  success: boolean;
  document?: ComplianceDocument;
  exports?: ExportResult[];
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/exporter/generate/${docType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating document:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Download an exported file
 * 
 * @param filename - Name of file to download
 */
export async function downloadExport(filename: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/exporter/download/${filename}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading export:', error);
    throw error;
  }
}

/**
 * List all exported files
 */
export async function listExports(): Promise<{ success: boolean; exports?: ExportFile[]; total_exports?: number; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/exporter/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error listing exports:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get exporter system health status
 */
export async function getHealth(): Promise<{ success: boolean; health?: ExporterHealth; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/exporter/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching health:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get export statistics
 */
export async function getStatistics(): Promise<{ success: boolean; statistics?: ExportStatistics; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/exporter/statistics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get export manifest
 */
export async function getManifest(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/exporter/manifest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching manifest:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Clear all exported files
 */
export async function clearExports(): Promise<{ success: boolean; deleted_count?: number; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/exporter/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing exports:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get exports by document type
 * 
 * @param docType - Document type to filter by
 */
export async function getExportsByType(docType: string): Promise<{ success: boolean; exports?: ExportFile[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/exporter/by-type/${docType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching exports by type:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get exports by document ID
 * 
 * @param docId - Document ID to filter by
 */
export async function getExportsById(docId: string): Promise<{ success: boolean; exports?: ExportFile[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/exporter/by-id/${docId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching exports by ID:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
}
