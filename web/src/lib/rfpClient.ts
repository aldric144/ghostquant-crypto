/**
 * RFP Client
 * 
 * Frontend client for Government RFP Pack Generator API
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

export interface RFPSection {
  name: string
  title: string
  content: string
  word_count: number
  subsections: string[]
  metadata: Record<string, any>
}

export interface RFPMetadata {
  generated_at: string
  generator_version: string
  document_id: string
  agency: string
  solicitation_number: string
  response_deadline: string
  contractor: string
  total_sections: number
  total_words: number
  compliance_frameworks: string[]
}

export interface RFPDocument {
  metadata: RFPMetadata
  sections: RFPSection[]
}

export interface RFPSummary {
  document_id: string
  generated_at: string
  total_sections: number
  total_words: number
  sections: Array<{
    name: string
    title: string
    word_count: number
    subsections: number
  }>
  compliance_frameworks: string[]
  integrity_hash: string
}

export interface RFPGenerateResponse {
  status: string
  document_id: string
  metadata: RFPMetadata
  sections: RFPSection[]
  summary: RFPSummary
}

export interface RFPSectionResponse {
  status: string
  section: RFPSection
}

export interface RFPExportResponse {
  status: string
  format: string
  content: string
  document_id: string
}

export interface RFPSummaryResponse {
  status: string
  summary: RFPSummary
}

export interface RFPHealthResponse {
  status: string
  health: {
    status: string
    version: string
    available_sections: string[]
    timestamp: string
  }
}

export interface RFPInfoResponse {
  status: string
  name: string
  version: string
  description: string
  supported_agencies: string[]
  available_sections: string[]
  export_formats: string[]
  features: string[]
}

export interface RFPContext {
  agency?: string
  solicitation_number?: string
  deadline?: string
}

export class RFPClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  /**
   * Generate complete RFP response with all 9 sections
   */
  async generateRFP(context?: RFPContext): Promise<RFPGenerateResponse> {
    const response = await fetch(`${this.baseUrl}/rfp/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(context || {}),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to generate RFP')
    }

    return response.json()
  }

  /**
   * Generate a single RFP section
   */
  async generateSection(sectionName: string, context?: RFPContext): Promise<RFPSectionResponse> {
    const response = await fetch(`${this.baseUrl}/rfp/section/${sectionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(context || {}),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || `Failed to generate section: ${sectionName}`)
    }

    return response.json()
  }

  /**
   * Export RFP to JSON format
   */
  async exportJSON(): Promise<RFPExportResponse> {
    const response = await fetch(`${this.baseUrl}/rfp/export/json`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to export JSON')
    }

    return response.json()
  }

  /**
   * Export RFP to Markdown format
   */
  async exportMarkdown(): Promise<RFPExportResponse> {
    const response = await fetch(`${this.baseUrl}/rfp/export/markdown`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to export Markdown')
    }

    return response.json()
  }

  /**
   * Export RFP to HTML format
   */
  async exportHTML(): Promise<RFPExportResponse> {
    const response = await fetch(`${this.baseUrl}/rfp/export/html`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to export HTML')
    }

    return response.json()
  }

  /**
   * Get summary of last generated RFP
   */
  async summary(): Promise<RFPSummaryResponse> {
    const response = await fetch(`${this.baseUrl}/rfp/summary`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get summary')
    }

    return response.json()
  }

  /**
   * Health check for RFP generator
   */
  async health(): Promise<RFPHealthResponse> {
    const response = await fetch(`${this.baseUrl}/rfp/health`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Health check failed')
    }

    return response.json()
  }

  /**
   * Get RFP generator information
   */
  async info(): Promise<RFPInfoResponse> {
    const response = await fetch(`${this.baseUrl}/rfp/info`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get info')
    }

    return response.json()
  }

  /**
   * Download content as file
   */
  downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export const rfpClient = new RFPClient()
