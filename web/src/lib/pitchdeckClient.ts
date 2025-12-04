/**
 * Pitch Deck Client
 * 
 * TypeScript client for GhostQuant Pitch Deck Generator API.
 * Provides methods for generating investor and government pitch decks.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


export interface DeckSlide {
  title: string;
  subtitle: string;
  bullets: string[];
  narrative: string;
  visuals: string[];
  risk_flags: string[];
  confidence: number;
  metadata: Record<string, any>;
}

export interface DeckSection {
  name: string;
  description: string;
  slides: DeckSlide[];
  slide_count: number;
}

export interface DeckMetadata {
  deck_type: string;
  company_name: string;
  generated_at: string;
  slide_count: number;
  section_count: number;
  version: string;
  author: string;
  tags: string[];
  compliance_badges: string[];
}

export interface Deck {
  metadata: DeckMetadata;
  sections: DeckSection[];
  executive_summary: string;
  table_of_contents: string[];
  total_slides: number;
  classification?: string;
  clearance_required?: string;
}

export type PitchDeck = Deck;

export interface DeckExportPackage {
  deck_json: Record<string, any>;
  deck_markdown: string;
  deck_html: string;
  metadata: DeckMetadata;
  table_of_contents: string[];
  summary: string;
}

export interface InvestorDeckRequest {
  company_name: string;
  company_profile?: Record<string, any>;
}

export interface GovernmentDeckRequest {
  agency_name: string;
  agency_profile?: Record<string, any>;
}

export interface CustomDeckRequest {
  deck_name: string;
  slide_templates: string[];
  deck_type?: string;
  profile?: Record<string, any>;
}

export interface TemplateSummary {
  id: string;
  headline: string;
  subtitle: string;
  bullet_count: number;
  visual_count: number;
}


class PitchDeckClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate investor pitch deck
   */
  async generateInvestorDeck(request: InvestorDeckRequest): Promise<{
    success: boolean;
    deck?: Deck;
    export_package?: DeckExportPackage;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/pitchdeck/investor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to generate investor deck',
      };
    }
  }

  /**
   * Generate government pitch deck
   */
  async generateGovernmentDeck(request: GovernmentDeckRequest): Promise<{
    success: boolean;
    deck?: Deck;
    export_package?: DeckExportPackage;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/pitchdeck/government`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to generate government deck',
      };
    }
  }

  /**
   * Generate custom pitch deck
   */
  async generateCustomDeck(request: CustomDeckRequest): Promise<{
    success: boolean;
    deck?: Deck;
    export_package?: DeckExportPackage;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/pitchdeck/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to generate custom deck',
      };
    }
  }

  /**
   * Get deck summary
   */
  async getSummary(deckType: string = 'investor'): Promise<{
    success: boolean;
    deck_type?: string;
    template_count?: number;
    templates?: TemplateSummary[];
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/pitchdeck/summary?deck_type=${deckType}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get deck summary',
      };
    }
  }

  /**
   * Get available templates
   */
  async getTemplates(deckType: string = 'investor'): Promise<{
    success: boolean;
    deck_type?: string;
    templates?: string[];
    template_count?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/pitchdeck/templates?deck_type=${deckType}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get templates',
      };
    }
  }

  /**
   * Get metadata
   */
  async getMetadata(): Promise<{
    success: boolean;
    version?: string;
    deck_types?: string[];
    investor_templates?: number;
    government_templates?: number;
    export_formats?: string[];
    features?: string[];
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/pitchdeck/metadata`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get metadata',
      };
    }
  }

  /**
   * Health check
   */
  async health(): Promise<{
    success: boolean;
    status?: string;
    version?: string;
    investor_templates?: number;
    government_templates?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/pitchdeck/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Health check failed',
      };
    }
  }

  /**
   * Get system information
   */
  async info(): Promise<{
    success: boolean;
    system?: string;
    version?: string;
    features?: string[];
    investor_templates?: string[];
    government_templates?: string[];
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/pitchdeck/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get info',
      };
    }
  }
}

export const pitchdeckClient = new PitchDeckClient();
