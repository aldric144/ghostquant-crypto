/**
 * Data Room API Client
 * 
 * TypeScript client for GhostQuant Investor Data Room API.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface DataRoomFile {
  name: string;
  description: string;
  content: string;
  file_type: string;
  size_bytes: number;
  classification: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface DataRoomFolder {
  name: string;
  description: string;
  files: DataRoomFile[];
  subfolders: DataRoomFolder[];
  classification: string;
  risk_level: string;
  metadata: Record<string, any>;
}

export interface DataRoomSection {
  name: string;
  description: string;
  folder: DataRoomFolder;
  order: number;
  classification: string;
  risk_level: string;
  created_at: string;
  updated_at: string;
}

export interface DataRoomSummary {
  name: string;
  total_sections: number;
  sections: Array<{
    order: number;
    name: string;
    description: string;
    classification: string;
    risk_level: string;
    file_count: number;
    files: Array<{
      name: string;
      description: string;
      file_type: string;
      classification: string;
    }>;
  }>;
}

export interface AccessLevel {
  level: string;
  description: string;
  allowed_classifications: string[];
}

export interface FolderNode {
  name: string;
  type: 'root' | 'section' | 'folder' | 'file';
  order?: number;
  classification?: string;
  risk_level?: string;
  file_type?: string;
  size_bytes?: number;
  children?: FolderNode[];
}

export class DataRoomClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get data room root information
   */
  async getRoot(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/dataroom/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data room root: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get data room summary
   */
  async getSummary(): Promise<DataRoomSummary> {
    const response = await fetch(`${this.baseUrl}/dataroom/summary`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data room summary: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * List all sections
   */
  async listSections(): Promise<{ sections: string[]; count: number }> {
    const response = await fetch(`${this.baseUrl}/dataroom/sections`);
    if (!response.ok) {
      throw new Error(`Failed to list sections: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get a specific section by name
   */
  async getSection(name: string): Promise<DataRoomSection> {
    const response = await fetch(`${this.baseUrl}/dataroom/section/${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch section '${name}': ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get complete data room schema
   */
  async getSchema(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/dataroom/schema`);
    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get data room as HTML
   */
  async getHTML(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/dataroom/html`);
    if (!response.ok) {
      throw new Error(`Failed to fetch HTML: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Get data room as Markdown
   */
  async getMarkdown(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/dataroom/markdown`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Markdown: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Get data room as JSON
   */
  async getJSON(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/dataroom/json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Export all formats
   */
  async exportAll(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/dataroom/export/all`);
    if (!response.ok) {
      throw new Error(`Failed to export all formats: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Download ZIP bundle
   */
  async downloadZIP(): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/dataroom/export/zip`);
    if (!response.ok) {
      throw new Error(`Failed to download ZIP: ${response.statusText}`);
    }
    return response.blob();
  }

  /**
   * Set access level and get filtered sections
   */
  async setAccessLevel(level: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/dataroom/access/${level}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to set access level: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get access level summary
   */
  async getAccessSummary(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/dataroom/access/summary`);
    if (!response.ok) {
      throw new Error(`Failed to fetch access summary: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Health check
   */
  async health(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/dataroom/health`);
    if (!response.ok) {
      throw new Error(`Failed to check health: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get system info
   */
  async info(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/dataroom/info`);
    if (!response.ok) {
      throw new Error(`Failed to fetch info: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get folder structure
   */
  async getFolderStructure(): Promise<FolderNode> {
    const info = await this.info();
    return info.folder_structure;
  }
}

export default DataRoomClient;
