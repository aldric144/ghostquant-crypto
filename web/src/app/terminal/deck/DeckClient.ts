/**
 * Deck Builder API Client
 * TypeScript client for GhostQuant Investor Pitch Deck Builder API
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
}

export interface DeckExportPackage {
  deck_json: Record<string, any>;
  deck_markdown: string;
  deck_html: string;
  metadata: DeckMetadata;
  table_of_contents: string[];
  summary: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export interface SlideTemplate {
  id: string;
  title: string;
  subtitle: string;
  bullet_count: number;
  has_narrative: boolean;
  visual_count: number;
}

export interface BuildDeckRequest {
  deck_type: 'investor' | 'government';
  company_name: string;
  theme: string;
}

export class DeckClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get deck builder information
   */
  async getRoot(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/deck/`);
    if (!response.ok) {
      throw new Error(`Failed to get deck root: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get deck builder summary
   */
  async getSummary(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/deck/summary`);
    if (!response.ok) {
      throw new Error(`Failed to get summary: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get all available slides
   */
  async getSlides(deckType: 'investor' | 'government' = 'investor'): Promise<{
    success: boolean;
    deck_type: string;
    slides: SlideTemplate[];
    total: number;
  }> {
    const response = await fetch(`${this.baseUrl}/deck/slides?deck_type=${deckType}`);
    if (!response.ok) {
      throw new Error(`Failed to get slides: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get a single slide by name
   */
  async getSlide(name: string, deckType: 'investor' | 'government' = 'investor'): Promise<{
    success: boolean;
    slide: DeckSlide;
  }> {
    const response = await fetch(`${this.baseUrl}/deck/slide/${name}?deck_type=${deckType}`);
    if (!response.ok) {
      throw new Error(`Failed to get slide: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get all available themes
   */
  async getThemes(): Promise<{
    success: boolean;
    themes: Theme[];
    total: number;
  }> {
    const response = await fetch(`${this.baseUrl}/deck/themes`);
    if (!response.ok) {
      throw new Error(`Failed to get themes: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Build a complete deck
   */
  async buildDeck(request: BuildDeckRequest): Promise<{
    success: boolean;
    deck: Deck;
    export_package: DeckExportPackage;
    theme: string;
  }> {
    const response = await fetch(`${this.baseUrl}/deck/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to build deck: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Export deck to HTML
   */
  async exportHTML(deck: Deck): Promise<string> {
    const response = await fetch(`${this.baseUrl}/deck/export/html`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deck),
    });
    if (!response.ok) {
      throw new Error(`Failed to export HTML: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Export deck to Markdown
   */
  async exportMarkdown(deck: Deck): Promise<string> {
    const response = await fetch(`${this.baseUrl}/deck/export/md`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deck),
    });
    if (!response.ok) {
      throw new Error(`Failed to export Markdown: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Export deck to JSON
   */
  async exportJSON(deck: Deck): Promise<string> {
    const response = await fetch(`${this.baseUrl}/deck/export/json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deck),
    });
    if (!response.ok) {
      throw new Error(`Failed to export JSON: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Export deck to PDF-ready HTML
   */
  async exportPDF(deck: Deck): Promise<string> {
    const response = await fetch(`${this.baseUrl}/deck/export/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deck),
    });
    if (!response.ok) {
      throw new Error(`Failed to export PDF: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Health check
   */
  async health(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/deck/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }
}

export const deckClient = new DeckClient();
