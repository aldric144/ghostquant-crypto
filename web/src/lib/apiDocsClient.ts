/**
 * API Documentation Client
 * TypeScript client for GhostQuant API Documentation Portal
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export enum RiskLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export interface APIEndpointDoc {
  endpoint_id: string;
  name: string;
  method: HTTPMethod;
  path: string;
  section: string;
  description: string;
  summary: string;
  params?: Array<{ name: string; type: string; required: boolean }>;
  query_params?: Array<{ name: string; type: string; required: boolean }>;
  body_schema?: Record<string, any>;
  headers?: Array<{ [key: string]: string }>;
  response_schema?: Record<string, any>;
  response_examples?: Array<Record<string, any>>;
  status_codes?: Record<number, string>;
  risk_level: RiskLevel;
  risk_notes?: string;
  use_cases?: string[];
  code_examples?: Record<string, string>;
  tags?: string[];
  deprecated?: boolean;
  requires_auth?: boolean;
  rate_limit?: string;
  notes?: string;
  see_also?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface APISection {
  section_id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  endpoints?: string[];
  subsections?: string[];
}

export interface APIDocsSummary {
  timestamp: string;
  total_endpoints: number;
  total_sections: number;
  endpoints_by_section: Record<string, number>;
  endpoints_by_method: Record<string, number>;
  endpoints_by_risk: Record<string, number>;
  documented_endpoints: number;
  endpoints_with_examples: number;
  endpoints_with_tests: number;
  top_endpoints: Array<{
    endpoint_id: string;
    name: string;
    path: string;
    method: string;
    section: string;
    summary: string;
    risk_level: string;
  }>;
  recommended_endpoints: Array<{
    endpoint_id: string;
    name: string;
    path: string;
    method: string;
    section: string;
    summary: string;
    use_cases: string[];
  }>;
  sections: APISection[];
  metadata?: Record<string, any>;
}

export interface APITestResult {
  test_id: string;
  endpoint_id: string;
  timestamp: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  params: Record<string, any>;
  body?: Record<string, any>;
  status_code: number;
  response_time_ms: number;
  response_body: any;
  response_headers: Record<string, string>;
  success: boolean;
  error?: string;
  warnings?: string[];
}

export interface APICodeExample {
  example_id: string;
  endpoint_id: string;
  language: string;
  title: string;
  code: string;
  description?: string;
  notes?: string;
}

export class APIDocsClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get API documentation portal information
   */
  async getInfo(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/apidocs/`);
    if (!response.ok) {
      throw new Error(`Failed to get API docs info: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get documentation summary
   */
  async getSummary(): Promise<APIDocsSummary> {
    const response = await fetch(`${this.baseUrl}/apidocs/summary`);
    if (!response.ok) {
      throw new Error(`Failed to get summary: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * List all endpoints with optional filtering
   */
  async getEndpoints(filters?: {
    section?: string;
    method?: string;
    risk_level?: string;
  }): Promise<{ endpoints: APIEndpointDoc[]; total_count: number; filters: any }> {
    const params = new URLSearchParams();
    if (filters?.section) params.append('section', filters.section);
    if (filters?.method) params.append('method', filters.method);
    if (filters?.risk_level) params.append('risk_level', filters.risk_level);

    const url = `${this.baseUrl}/apidocs/endpoints${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to get endpoints: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get detailed documentation for a specific endpoint
   */
  async getEndpoint(endpointId: string): Promise<APIEndpointDoc> {
    const response = await fetch(`${this.baseUrl}/apidocs/endpoint/${endpointId}`);
    if (!response.ok) {
      throw new Error(`Failed to get endpoint: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Test an API endpoint
   */
  async testEndpoint(
    endpointId: string,
    params?: Record<string, any>,
    body?: Record<string, any>
  ): Promise<{ test_status: string; result?: APITestResult; validation?: any }> {
    const queryParams = new URLSearchParams({ endpoint_id: endpointId });
    
    const response = await fetch(`${this.baseUrl}/apidocs/test?${queryParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params, body }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to test endpoint: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get code examples for a specific language
   */
  async getExamples(language: string): Promise<{ language: string; examples: APICodeExample[]; total_count: number }> {
    const response = await fetch(`${this.baseUrl}/apidocs/examples/${language}`);
    if (!response.ok) {
      throw new Error(`Failed to get examples: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get health status
   */
  async getHealth(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/apidocs/health`);
    if (!response.ok) {
      throw new Error(`Failed to get health: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get comprehensive API information
   */
  async getAPIInfo(): Promise<{
    sections: APISection[];
    quickstart: any;
    top_20_actions: any[];
    console_config: any;
    total_endpoints: number;
    total_sections: number;
  }> {
    const response = await fetch(`${this.baseUrl}/apidocs/info`);
    if (!response.ok) {
      throw new Error(`Failed to get API info: ${response.statusText}`);
    }
    return response.json();
  }
}

export const apiDocsClient = new APIDocsClient();
