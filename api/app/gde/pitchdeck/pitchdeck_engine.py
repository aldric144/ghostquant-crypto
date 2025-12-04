"""
Pitch Deck Engine

Core engine for generating investor and government pitch decks.
500+ lines implementing deck generation, slide assembly, and export.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from .pitchdeck_schema import (
    DeckSlide,
    DeckSection,
    DeckMetadata,
    InvestorDeck,
    GovernmentDeck,
    DeckExportPackage,
    DeckTheme,
    DeckOutput
)
from .pitchdeck_templates import (
    INVESTOR_TEMPLATES,
    GOVERNMENT_TEMPLATES,
    get_investor_template,
    get_government_template
)
from .pitchdeck_themes import get_theme, list_themes
from .pitchdeck_exporter import DeckExporter


class PitchDeckEngine:
    """
    Core engine for pitch deck generation
    
    Features:
    - Generate investor decks (15-20 slides)
    - Generate government decks (20-30 slides)
    - Custom deck assembly
    - JSON/Markdown/HTML export
    - Visual placeholder generation
    - Narrative generation
    """
    
    VERSION = "1.0.0"
    
    def __init__(self):
        self.investor_templates = INVESTOR_TEMPLATES
        self.government_templates = GOVERNMENT_TEMPLATES
        self.exporter = DeckExporter()
        self.current_theme = "ghostquant_dark_fusion"
    
    
    def generate_investor_deck(self, company_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate complete investor pitch deck
        
        Args:
            company_profile: Company information and data
        
        Returns:
            Result dict with success flag and deck data
        """
        try:
            company_name = company_profile.get('company_name', 'GhostQuant')
            
            metadata = DeckMetadata(
                deck_type='investor',
                company_name=company_name,
                tags=['investor', 'series-a', 'crypto', 'intelligence'],
                compliance_badges=['SOC2', 'CJIS', 'NIST']
            )
            
            slide_order = [
                'vision',
                'mission',
                'problem',
                'market_size',
                'solution',
                'why_now',
                'product_demo',
                'architecture',
                'ai_advantage',
                'go_to_market',
                'business_model',
                'traction',
                'competitive_landscape',
                'security_compliance',
                'tech_stack',
                'team',
                'roadmap',
                'financial_projections',
                'case_studies',
                'the_ask',
                'closing'
            ]
            
            slides = []
            for template_id in slide_order:
                slide = self.generate_slide(template_id, company_profile, 'investor')
                if slide:
                    slides.append(slide)
            
            sections = self._organize_investor_sections(slides)
            
            metadata.slide_count = len(slides)
            metadata.section_count = len(sections)
            
            deck = InvestorDeck(
                metadata=metadata,
                sections=sections,
                executive_summary=self._generate_executive_summary(company_profile, 'investor'),
                table_of_contents=self._generate_toc(sections)
            )
            
            export_package = self.assemble_deck(deck, 'investor')
            
            return {
                'success': True,
                'deck': deck.to_dict(),
                'export_package': export_package.to_dict()
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to generate investor deck: {str(e)}'
            }
    
    def _organize_investor_sections(self, slides: List[DeckSlide]) -> List[DeckSection]:
        """Organize slides into logical sections for investor deck"""
        sections = []
        
        intro_slides = [s for s in slides if s.title in ['Our Vision', 'Our Mission', 'The Problem']]
        if intro_slides:
            sections.append(DeckSection(
                name='Introduction',
                slides=intro_slides,
                description='Company vision, mission, and problem statement'
            ))
        
        market_slides = [s for s in slides if s.title in ['Market Opportunity', 'Why Now?']]
        if market_slides:
            sections.append(DeckSection(
                name='Market Opportunity',
                slides=market_slides,
                description='Market size and timing'
            ))
        
        solution_slides = [s for s in slides if s.title in ['The GhostQuant Solution', 'Product Demonstration', 'Technical Architecture', 'AI & Machine Learning Advantage']]
        if solution_slides:
            sections.append(DeckSection(
                name='Solution',
                slides=solution_slides,
                description='Product and technology'
            ))
        
        business_slides = [s for s in slides if s.title in ['Go-To-Market Strategy', 'Business Model', 'Traction & Milestones']]
        if business_slides:
            sections.append(DeckSection(
                name='Business',
                slides=business_slides,
                description='Go-to-market and traction'
            ))
        
        competitive_slides = [s for s in slides if s.title in ['Competitive Landscape', 'Security & Compliance', 'Technology Stack']]
        if competitive_slides:
            sections.append(DeckSection(
                name='Competitive Advantage',
                slides=competitive_slides,
                description='Differentiation and defensibility'
            ))
        
        team_slides = [s for s in slides if s.title in ['Team', 'Product Roadmap', 'Case Studies']]
        if team_slides:
            sections.append(DeckSection(
                name='Team & Execution',
                slides=team_slides,
                description='Team and execution plan'
            ))
        
        financial_slides = [s for s in slides if s.title in ['Financial Projections', 'The Ask', 'Join Us in Building the Future']]
        if financial_slides:
            sections.append(DeckSection(
                name='Financials & Ask',
                slides=financial_slides,
                description='Financial projections and funding ask'
            ))
        
        return sections
    
    
    def generate_government_deck(self, agency_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate complete government pitch deck
        
        Args:
            agency_profile: Agency information and requirements
        
        Returns:
            Result dict with success flag and deck data
        """
        try:
            agency_name = agency_profile.get('agency_name', 'Government Agency')
            
            metadata = DeckMetadata(
                deck_type='government',
                company_name=f'GhostQuant for {agency_name}',
                tags=['government', 'national-security', 'law-enforcement', 'compliance'],
                compliance_badges=['CJIS', 'NIST', 'FedRAMP', 'SOC2']
            )
            
            slide_order = [
                'mission_alignment',
                'national_security',
                'threat_landscape',
                'intelligence_architecture',
                'hydra_detection',
                'constellation_mapping',
                'behavioral_dna',
                'fusion_intelligence',
                'chain_of_custody',
                'compliance_framework',
                'air_gapped_deployment',
                'crisis_response',
                'systemic_threat_detection',
                'procurement_readiness',
                'interoperability',
                'training_onboarding',
                'pilot_program',
                'cost_efficiency',
                'action_plan',
                'closing_gov'
            ]
            
            slides = []
            for template_id in slide_order:
                slide = self.generate_slide(template_id, agency_profile, 'government')
                if slide:
                    slides.append(slide)
            
            sections = self._organize_government_sections(slides)
            
            metadata.slide_count = len(slides)
            metadata.section_count = len(sections)
            
            deck = GovernmentDeck(
                metadata=metadata,
                sections=sections,
                executive_summary=self._generate_executive_summary(agency_profile, 'government'),
                table_of_contents=self._generate_toc(sections),
                classification='UNCLASSIFIED',
                clearance_required='None'
            )
            
            export_package = self.assemble_deck(deck, 'government')
            
            return {
                'success': True,
                'deck': deck.to_dict(),
                'export_package': export_package.to_dict()
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to generate government deck: {str(e)}'
            }
    
    def _organize_government_sections(self, slides: List[DeckSlide]) -> List[DeckSection]:
        """Organize slides into logical sections for government deck"""
        sections = []
        
        mission_slides = [s for s in slides if s.title in ['Mission Alignment', 'National Security Relevance', 'Crypto Threat Landscape']]
        if mission_slides:
            sections.append(DeckSection(
                name='Mission & Threat Landscape',
                slides=mission_slides,
                description='Mission alignment and threat assessment'
            ))
        
        intel_slides = [s for s in slides if s.title in ['Intelligence Architecture', 'Hydra Detection System', 'Constellation Entity Mapping', 'Behavioral DNA Profiling', 'Fusion Intelligence Engine']]
        if intel_slides:
            sections.append(DeckSection(
                name='Intelligence Capabilities',
                slides=intel_slides,
                description='Core intelligence and analysis capabilities'
            ))
        
        compliance_slides = [s for s in slides if s.title in ['Chain-of-Custody Documentation', 'Government Compliance Framework', 'Air-Gapped Deployment']]
        if compliance_slides:
            sections.append(DeckSection(
                name='Compliance & Security',
                slides=compliance_slides,
                description='Security and compliance framework'
            ))
        
        ops_slides = [s for s in slides if s.title in ['Crisis Response Capabilities', 'Systemic Threat Detection']]
        if ops_slides:
            sections.append(DeckSection(
                name='Operational Capabilities',
                slides=ops_slides,
                description='Operational and crisis response'
            ))
        
        procurement_slides = [s for s in slides if s.title in ['Procurement Readiness', 'Interoperability & Integration', 'Training & Onboarding', 'Pilot Program']]
        if procurement_slides:
            sections.append(DeckSection(
                name='Procurement & Implementation',
                slides=procurement_slides,
                description='Acquisition and deployment process'
            ))
        
        value_slides = [s for s in slides if s.title in ['Cost Efficiency', 'Recommended Action Plan', 'Partnership for National Security']]
        if value_slides:
            sections.append(DeckSection(
                name='Value & Next Steps',
                slides=value_slides,
                description='Value proposition and action plan'
            ))
        
        return sections
    
    
    def generate_slide(
        self,
        template_id: str,
        data: Dict[str, Any],
        deck_type: str = 'investor'
    ) -> Optional[DeckSlide]:
        """
        Generate a single slide from template
        
        Args:
            template_id: Template identifier
            data: Data for slide generation
            deck_type: Type of deck (investor or government)
        
        Returns:
            DeckSlide or None if template not found
        """
        try:
            if deck_type == 'investor':
                template = get_investor_template(template_id)
            else:
                template = get_government_template(template_id)
            
            if not template:
                return None
            
            headline = template.get('headline', '')
            subtitle = template.get('subtitle', '')
            bullets = template.get('bullets', [])
            narrative_template = template.get('narrative_template', '')
            visuals = template.get('visuals', [])
            
            narrative = self.build_narrative(narrative_template, data)
            
            visual_placeholders = self.generate_visual_placeholders(visuals)
            
            risk_flags = self._detect_risk_flags(narrative, bullets)
            
            confidence = self._calculate_confidence(data, template_id)
            
            slide = DeckSlide(
                title=headline,
                subtitle=subtitle,
                bullets=bullets,
                narrative=narrative,
                visuals=visual_placeholders,
                risk_flags=risk_flags,
                confidence=confidence,
                metadata={
                    'template_id': template_id,
                    'deck_type': deck_type,
                    'generated_at': datetime.utcnow().isoformat()
                }
            )
            
            return slide
        
        except Exception as e:
            print(f"Error generating slide {template_id}: {str(e)}")
            return None
    
    
    def assemble_deck(
        self,
        deck: Any,
        deck_type: str
    ) -> DeckExportPackage:
        """
        Assemble complete deck export package
        
        Args:
            deck: InvestorDeck or GovernmentDeck
            deck_type: Type of deck
        
        Returns:
            DeckExportPackage with JSON, Markdown, and HTML
        """
        deck_json = deck.to_dict()
        
        deck_markdown = self._generate_markdown(deck, deck_type)
        
        deck_html = self._generate_html(deck, deck_type)
        
        export_package = DeckExportPackage(
            deck_json=deck_json,
            deck_markdown=deck_markdown,
            deck_html=deck_html,
            metadata=deck.metadata,
            table_of_contents=deck.table_of_contents,
            summary=deck.executive_summary
        )
        
        return export_package
    
    def _generate_markdown(self, deck: Any, deck_type: str) -> str:
        """Generate Markdown representation of deck"""
        lines = []
        
        lines.append(f"# {deck.metadata.company_name}")
        lines.append(f"## {deck_type.capitalize()} Pitch Deck")
        lines.append("")
        lines.append(f"Generated: {deck.metadata.generated_at}")
        lines.append(f"Version: {deck.metadata.version}")
        lines.append("")
        
        lines.append("## Executive Summary")
        lines.append("")
        lines.append(deck.executive_summary)
        lines.append("")
        
        lines.append("## Table of Contents")
        lines.append("")
        for i, item in enumerate(deck.table_of_contents, 1):
            lines.append(f"{i}. {item}")
        lines.append("")
        
        for section in deck.sections:
            lines.append(f"## {section.name}")
            lines.append("")
            lines.append(f"*{section.description}*")
            lines.append("")
            
            for slide in section.slides:
                lines.append(f"### {slide.title}")
                lines.append("")
                lines.append(f"**{slide.subtitle}**")
                lines.append("")
                
                for bullet in slide.bullets:
                    lines.append(f"- {bullet}")
                lines.append("")
                
                lines.append(slide.narrative)
                lines.append("")
                
                if slide.visuals:
                    lines.append("**Visuals:**")
                    for visual in slide.visuals:
                        lines.append(f"- {visual}")
                    lines.append("")
                
                if slide.risk_flags:
                    lines.append("**Risk Flags:**")
                    for flag in slide.risk_flags:
                        lines.append(f"- ⚠️ {flag}")
                    lines.append("")
                
                lines.append("---")
                lines.append("")
        
        return "\n".join(lines)
    
    def _generate_html(self, deck: Any, deck_type: str) -> str:
        """Generate HTML representation of deck"""
        html_parts = []
        
        html_parts.append("<!DOCTYPE html>")
        html_parts.append("<html lang='en'>")
        html_parts.append("<head>")
        html_parts.append("<meta charset='UTF-8'>")
        html_parts.append(f"<title>{deck.metadata.company_name} - {deck_type.capitalize()} Deck</title>")
        html_parts.append("<style>")
        html_parts.append(self._get_html_styles())
        html_parts.append("</style>")
        html_parts.append("</head>")
        html_parts.append("<body>")
        
        html_parts.append("<div class='slide title-slide'>")
        html_parts.append(f"<h1>{deck.metadata.company_name}</h1>")
        html_parts.append(f"<h2>{deck_type.capitalize()} Pitch Deck</h2>")
        html_parts.append(f"<p class='metadata'>Generated: {deck.metadata.generated_at}</p>")
        html_parts.append(f"<p class='metadata'>Version: {deck.metadata.version}</p>")
        html_parts.append("</div>")
        
        html_parts.append("<div class='slide'>")
        html_parts.append("<h2>Executive Summary</h2>")
        html_parts.append(f"<p>{deck.executive_summary}</p>")
        html_parts.append("</div>")
        
        html_parts.append("<div class='slide'>")
        html_parts.append("<h2>Table of Contents</h2>")
        html_parts.append("<ol>")
        for item in deck.table_of_contents:
            html_parts.append(f"<li>{item}</li>")
        html_parts.append("</ol>")
        html_parts.append("</div>")
        
        for section in deck.sections:
            for slide in section.slides:
                html_parts.append("<div class='slide'>")
                html_parts.append(f"<h2>{slide.title}</h2>")
                html_parts.append(f"<h3>{slide.subtitle}</h3>")
                
                html_parts.append("<ul class='bullets'>")
                for bullet in slide.bullets:
                    html_parts.append(f"<li>{bullet}</li>")
                html_parts.append("</ul>")
                
                html_parts.append(f"<div class='narrative'><p>{slide.narrative}</p></div>")
                
                if slide.visuals:
                    html_parts.append("<div class='visuals'>")
                    html_parts.append("<h4>Visuals:</h4>")
                    html_parts.append("<ul>")
                    for visual in slide.visuals:
                        html_parts.append(f"<li>{visual}</li>")
                    html_parts.append("</ul>")
                    html_parts.append("</div>")
                
                if slide.risk_flags:
                    html_parts.append("<div class='risk-flags'>")
                    html_parts.append("<h4>Risk Flags:</h4>")
                    html_parts.append("<ul>")
                    for flag in slide.risk_flags:
                        html_parts.append(f"<li>⚠️ {flag}</li>")
                    html_parts.append("</ul>")
                    html_parts.append("</div>")
                
                html_parts.append("</div>")
        
        html_parts.append("</body>")
        html_parts.append("</html>")
        
        return "\n".join(html_parts)
    
    def _get_html_styles(self) -> str:
        """Get CSS styles for HTML export"""
        return """
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .slide {
            background: white;
            padding: 40px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            page-break-after: always;
        }
        .title-slide {
            text-align: center;
            padding: 100px 40px;
        }
        .title-slide h1 {
            font-size: 48px;
            color: #0066cc;
            margin-bottom: 20px;
        }
        .title-slide h2 {
            font-size: 32px;
            color: #666;
            margin-bottom: 40px;
        }
        .metadata {
            color: #999;
            font-size: 14px;
        }
        h2 {
            color: #0066cc;
            font-size: 36px;
            margin-bottom: 10px;
        }
        h3 {
            color: #666;
            font-size: 24px;
            margin-bottom: 20px;
        }
        h4 {
            color: #333;
            font-size: 18px;
            margin-top: 20px;
        }
        .bullets {
            font-size: 18px;
            line-height: 1.8;
            margin: 20px 0;
        }
        .bullets li {
            margin: 10px 0;
        }
        .narrative {
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin: 20px 0;
            padding: 20px;
            background: #f9f9f9;
            border-left: 4px solid #0066cc;
        }
        .visuals {
            margin: 20px 0;
            padding: 15px;
            background: #e8f4f8;
            border-radius: 4px;
        }
        .risk-flags {
            margin: 20px 0;
            padding: 15px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
        }
        .risk-flags ul {
            margin: 10px 0;
        }
        ol, ul {
            padding-left: 30px;
        }
        @media print {
            body {
                background: white;
            }
            .slide {
                box-shadow: none;
                page-break-after: always;
            }
        }
        """
    
    
    def generate_visual_placeholders(self, visual_names: List[str]) -> List[str]:
        """
        Generate descriptive visual placeholders
        
        Args:
            visual_names: List of visual names
        
        Returns:
            List of visual placeholder descriptions
        """
        placeholders = []
        
        for name in visual_names:
            placeholder = f"[Visual: {name}]"
            placeholders.append(placeholder)
        
        return placeholders
    
    def build_narrative(self, template: str, data: Dict[str, Any]) -> str:
        """
        Build narrative from template and data
        
        Args:
            template: Narrative template
            data: Data for narrative generation
        
        Returns:
            Generated narrative text
        """
        narrative = template.strip()
        
        company_name = data.get('company_name', 'GhostQuant')
        narrative = narrative.replace('GhostQuant', company_name)
        
        return narrative
    
    def _generate_executive_summary(self, profile: Dict[str, Any], deck_type: str) -> str:
        """Generate executive summary"""
        company_name = profile.get('company_name', 'GhostQuant')
        
        if deck_type == 'investor':
            return f"""{company_name} is building the Bloomberg Terminal for cryptocurrency markets—the essential intelligence infrastructure for institutional participation in digital assets. Our platform combines comprehensive data aggregation, AI-powered behavioral analytics, and compliance-ready reporting to serve institutional investors, government agencies, and sophisticated trading operations.

We address a $50B+ market opportunity as traditional financial institutions allocate capital to crypto and governments establish regulatory frameworks. With 150+ institutional clients, $2.5M ARR growing 15% monthly, and proprietary AI models trained on 5+ years of data, we're positioned to become the category-defining platform for crypto intelligence.

Our team combines deep expertise in traditional finance, cryptocurrency markets, and artificial intelligence. We're raising $15M Series A to accelerate growth, targeting 3x revenue expansion and 500+ institutional clients within 12 months. This is a rare opportunity to build the defining platform in a massive and rapidly growing market."""
        
        else:  # government
            return f"""{company_name} provides specialized intelligence capabilities for government agencies tasked with monitoring, investigating, and enforcing in cryptocurrency markets. As digital assets become a primary vector for terrorist financing, money laundering, sanctions evasion, and fraud, traditional surveillance methods prove inadequate for decentralized markets.

Our platform delivers purpose-built capabilities for threat detection, network mapping, behavioral analysis, and evidence generation. We support law enforcement investigations, regulatory oversight, intelligence operations, and policy assessment with tools designed specifically for government requirements including chain-of-custody documentation, classification handling, and air-gapped deployment.

With proven effectiveness in real-world operations, alignment with CJIS/NIST/FedRAMP standards, and rapid deployment timelines, {company_name} enables agencies to address the growing threat of crypto-enabled crime. We're committed to supporting your mission with advanced intelligence capabilities and dedicated government support."""
    
    def _generate_toc(self, sections: List[DeckSection]) -> List[str]:
        """Generate table of contents"""
        toc = []
        
        for section in sections:
            toc.append(section.name)
        
        return toc
    
    def _detect_risk_flags(self, narrative: str, bullets: List[str]) -> List[str]:
        """Detect risk flags in content"""
        risk_flags = []
        
        risk_keywords = [
            'challenge', 'risk', 'threat', 'concern', 'issue',
            'problem', 'difficulty', 'obstacle', 'barrier'
        ]
        
        content = narrative.lower() + ' '.join(bullets).lower()
        
        for keyword in risk_keywords:
            if keyword in content:
                risk_flags.append(f"Content mentions '{keyword}'")
        
        return risk_flags[:3]  # Limit to top 3
    
    def _calculate_confidence(self, data: Dict[str, Any], template_id: str) -> float:
        """Calculate confidence score for slide"""
        confidence = 0.85
        
        if not data:
            confidence -= 0.1
        
        high_confidence_templates = ['vision', 'mission', 'solution', 'architecture']
        if template_id in high_confidence_templates:
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    def get_summary(self, deck: Any) -> str:
        """
        Get 10-20 line summary of deck
        
        Args:
            deck: InvestorDeck or GovernmentDeck
        
        Returns:
            Summary string
        """
        lines = []
        
        lines.append(f"Deck Type: {deck.metadata.deck_type.capitalize()}")
        lines.append(f"Company: {deck.metadata.company_name}")
        lines.append(f"Generated: {deck.metadata.generated_at}")
        lines.append(f"Total Slides: {deck.metadata.slide_count}")
        lines.append(f"Sections: {deck.metadata.section_count}")
        lines.append("")
        lines.append("Sections:")
        
        for section in deck.sections:
            lines.append(f"  - {section.name} ({len(section.slides)} slides)")
        
        lines.append("")
        lines.append("Compliance Badges:")
        for badge in deck.metadata.compliance_badges:
            lines.append(f"  - {badge}")
        
        lines.append("")
        lines.append("Executive Summary:")
        summary_preview = deck.executive_summary[:200] + "..." if len(deck.executive_summary) > 200 else deck.executive_summary
        lines.append(f"  {summary_preview}")
        
        return "\n".join(lines)
    
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'investor_templates': len(self.investor_templates),
            'government_templates': len(self.government_templates)
        }
    
    def info(self) -> Dict[str, Any]:
        """Get engine information"""
        return {
            'version': self.VERSION,
            'features': [
                'Investor deck generation (15-20 slides)',
                'Government deck generation (20-30 slides)',
                'Custom deck assembly',
                'JSON/Markdown/HTML export',
                'Visual placeholders',
                'Narrative generation',
                'Risk flag detection',
                'Confidence scoring'
            ],
            'investor_templates': list(self.investor_templates.keys()),
            'government_templates': list(self.government_templates.keys())
        }
    
    def build_slide(self, template_name: str, overrides: Dict[str, Any] = None) -> Optional[DeckSlide]:
        """
        Build a single slide from template with optional overrides.
        
        Args:
            template_name: Template identifier
            overrides: Optional data overrides
        
        Returns:
            DeckSlide or None
        """
        data = overrides or {}
        return self.generate_slide(template_name, data, 'investor')
    
    def build_full_deck(self, deck_type: str = 'investor', company_name: str = 'GhostQuant') -> Dict[str, Any]:
        """
        Build a complete deck with all slides.
        
        Args:
            deck_type: Type of deck (investor or government)
            company_name: Company/agency name
        
        Returns:
            Complete deck dictionary
        """
        if deck_type == 'investor':
            return self.generate_investor_deck({'company_name': company_name})
        else:
            return self.generate_government_deck({'agency_name': company_name})
    
    def assemble_html_deck(self, deck_dict: Dict[str, Any]) -> str:
        """
        Assemble HTML slideshow from deck dictionary.
        
        Args:
            deck_dict: Deck dictionary
        
        Returns:
            HTML string
        """
        theme = get_theme(self.current_theme)
        theme_css = theme.to_css()
        return self.exporter.export_html(deck_dict, theme_css)
    
    def assemble_markdown_deck(self, deck_dict: Dict[str, Any]) -> str:
        """
        Assemble Markdown document from deck dictionary.
        
        Args:
            deck_dict: Deck dictionary
        
        Returns:
            Markdown string
        """
        return self.exporter.export_markdown(deck_dict)
    
    def assemble_json_deck(self, deck_dict: Dict[str, Any]) -> str:
        """
        Assemble JSON from deck dictionary.
        
        Args:
            deck_dict: Deck dictionary
        
        Returns:
            JSON string
        """
        return self.exporter.export_json(deck_dict)
    
    def generate_pdf_ready_html(self, deck_dict: Dict[str, Any]) -> str:
        """
        Generate PDF-ready HTML with print optimization.
        
        Args:
            deck_dict: Deck dictionary
        
        Returns:
            PDF-ready HTML string
        """
        theme = get_theme(self.current_theme)
        theme_css = theme.to_css()
        return self.exporter.export_pdf_html(deck_dict, theme_css)
    
    def apply_theme(self, theme_name: str) -> bool:
        """
        Apply a theme to the deck generator.
        
        Args:
            theme_name: Theme identifier
        
        Returns:
            Success flag
        """
        try:
            theme = get_theme(theme_name)
            if theme:
                self.current_theme = theme_name
                return True
            return False
        except Exception:
            return False
    
    def summarize_for_investors(self, deck_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate investor-focused summary of deck.
        
        Args:
            deck_dict: Deck dictionary
        
        Returns:
            Summary dictionary
        """
        metadata = deck_dict.get('metadata', {})
        slides = []
        for section in deck_dict.get('sections', []):
            slides.extend(section.get('slides', []))
        
        key_slides = [s for s in slides if s.get('title') in [
            'Market Opportunity', 'The GhostQuant Solution', 'Traction & Milestones',
            'Business Model', 'The Ask'
        ]]
        
        return {
            'company': metadata.get('company_name', 'Unknown'),
            'deck_type': metadata.get('deck_type', 'investor'),
            'total_slides': len(slides),
            'key_highlights': [s.get('title') for s in key_slides],
            'executive_summary': deck_dict.get('executive_summary', ''),
            'generated_at': metadata.get('generated_at', ''),
        }
    
    def list_slides(self, deck_dict: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        List all slides in a deck with metadata.
        
        Args:
            deck_dict: Deck dictionary
        
        Returns:
            List of slide summaries
        """
        slides = []
        slide_number = 1
        
        for section in deck_dict.get('sections', []):
            for slide in section.get('slides', []):
                slides.append({
                    'number': slide_number,
                    'title': slide.get('title', ''),
                    'subtitle': slide.get('subtitle', ''),
                    'bullet_count': len(slide.get('bullets', [])),
                    'has_narrative': bool(slide.get('narrative', '')),
                    'visual_count': len(slide.get('visuals', [])),
                    'section': section.get('name', ''),
                })
                slide_number += 1
        
        return slides
