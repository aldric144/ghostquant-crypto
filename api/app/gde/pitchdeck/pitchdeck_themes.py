"""
Pitch Deck Themes
Premium visual themes for investor pitch decks.
"""

from dataclasses import dataclass
from typing import Dict, Any


@dataclass
class DeckTheme:
    """Visual theme for pitch deck."""
    name: str
    description: str
    primary_color: str
    secondary_color: str
    accent_color: str
    background_color: str
    text_color: str
    heading_color: str
    font_family: str
    heading_font: str
    font_size_base: str
    font_size_heading: str
    font_size_subtitle: str
    line_height: str
    slide_padding: str
    slide_background: str
    header_style: str
    footer_style: str
    bullet_style: str
    
    def to_css(self) -> str:
        """Generate CSS for this theme."""
        return f"""
/* {self.name} Theme */
:root {{
    --primary-color: {self.primary_color};
    --secondary-color: {self.secondary_color};
    --accent-color: {self.accent_color};
    --background-color: {self.background_color};
    --text-color: {self.text_color};
    --heading-color: {self.heading_color};
    --font-family: {self.font_family};
    --heading-font: {self.heading_font};
    --font-size-base: {self.font_size_base};
    --font-size-heading: {self.font_size_heading};
    --font-size-subtitle: {self.font_size_subtitle};
    --line-height: {self.line_height};
    --slide-padding: {self.slide_padding};
}}

body {{
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: var(--line-height);
    color: var(--text-color);
    background: var(--background-color);
    margin: 0;
    padding: 0;
}}

.slide {{
    min-height: 100vh;
    padding: var(--slide-padding);
    background: {self.slide_background};
    display: flex;
    flex-direction: column;
    justify-content: center;
    page-break-after: always;
}}

h1, h2, h3 {{
    font-family: var(--heading-font);
    color: var(--heading-color);
    margin: 0 0 1rem 0;
}}

h1 {{
    font-size: var(--font-size-heading);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
}}

h2 {{
    font-size: var(--font-size-subtitle);
    font-weight: 700;
}}

.slide-header {{
    {self.header_style}
}}

.slide-footer {{
    {self.footer_style}
}}

ul {{
    {self.bullet_style}
}}

@media print {{
    .slide {{
        page-break-after: always;
        min-height: 100vh;
    }}
    
    @page {{
        size: A4;
        margin: 0;
    }}
}}
"""
    
    def dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "name": self.name,
            "description": self.description,
            "primary_color": self.primary_color,
            "secondary_color": self.secondary_color,
            "accent_color": self.accent_color,
            "background_color": self.background_color,
            "text_color": self.text_color,
            "heading_color": self.heading_color,
            "font_family": self.font_family,
            "heading_font": self.heading_font,
            "font_size_base": self.font_size_base,
            "font_size_heading": self.font_size_heading,
            "font_size_subtitle": self.font_size_subtitle,
            "line_height": self.line_height,
            "slide_padding": self.slide_padding,
        }


BLACK_OPS_INTELLIGENCE = DeckTheme(
    name="Black Ops Intelligence",
    description="Dark, powerful theme with emerald and cyan accents for intelligence operations",
    primary_color="#10b981",  # Emerald
    secondary_color="#06b6d4",  # Cyan
    accent_color="#22d3ee",  # Bright cyan
    background_color="#000000",  # Pure black
    text_color="#e5e7eb",  # Light gray
    heading_color="#10b981",  # Emerald
    font_family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    heading_font="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    font_size_base="1.125rem",
    font_size_heading="3rem",
    font_size_subtitle="1.5rem",
    line_height="1.6",
    slide_padding="4rem",
    slide_background="linear-gradient(135deg, #000000 0%, #0a1a0a 100%)",
    header_style="border-bottom: 2px solid #10b981; padding-bottom: 1rem; margin-bottom: 2rem;",
    footer_style="border-top: 1px solid #374151; padding-top: 1rem; margin-top: 2rem; font-size: 0.875rem; color: #9ca3af;",
    bullet_style="list-style: none; padding-left: 0; li { padding-left: 2rem; position: relative; margin-bottom: 1rem; } li:before { content: '▸'; position: absolute; left: 0; color: #10b981; font-weight: bold; }",
)

PALANTIR_MINIMALIST = DeckTheme(
    name="Palantir Minimalist",
    description="Clean, minimal theme with navy and white for enterprise presentations",
    primary_color="#1e3a8a",  # Navy blue
    secondary_color="#3b82f6",  # Blue
    accent_color="#60a5fa",  # Light blue
    background_color="#ffffff",  # White
    text_color="#1f2937",  # Dark gray
    heading_color="#1e3a8a",  # Navy
    font_family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    heading_font="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    font_size_base="1rem",
    font_size_heading="2.5rem",
    font_size_subtitle="1.25rem",
    line_height="1.5",
    slide_padding="3rem 4rem",
    slide_background="#ffffff",
    header_style="border-bottom: 3px solid #1e3a8a; padding-bottom: 1rem; margin-bottom: 2rem;",
    footer_style="border-top: 1px solid #e5e7eb; padding-top: 1rem; margin-top: 2rem; font-size: 0.875rem; color: #6b7280;",
    bullet_style="list-style: none; padding-left: 0; li { padding-left: 2rem; position: relative; margin-bottom: 0.75rem; } li:before { content: '•'; position: absolute; left: 0; color: #1e3a8a; font-size: 1.5rem; line-height: 1; }",
)

GHOSTQUANT_DARK_FUSION = DeckTheme(
    name="GhostQuant Dark Fusion",
    description="Signature GhostQuant theme with purple, neon red, and black",
    primary_color="#a855f7",  # Purple
    secondary_color="#ec4899",  # Pink/Red
    accent_color="#f43f5e",  # Neon red
    background_color="#0a0a0a",  # Near black
    text_color="#f3f4f6",  # Off white
    heading_color="#a855f7",  # Purple
    font_family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    heading_font="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    font_size_base="1.125rem",
    font_size_heading="3.5rem",
    font_size_subtitle="1.75rem",
    line_height="1.7",
    slide_padding="4rem 5rem",
    slide_background="radial-gradient(circle at top right, #1a0a1a 0%, #0a0a0a 50%, #0a0a1a 100%)",
    header_style="border-bottom: 2px solid #a855f7; padding-bottom: 1.5rem; margin-bottom: 2.5rem; background: linear-gradient(90deg, #a855f7 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;",
    footer_style="border-top: 1px solid #374151; padding-top: 1rem; margin-top: 2rem; font-size: 0.875rem; color: #9ca3af;",
    bullet_style="list-style: none; padding-left: 0; li { padding-left: 2.5rem; position: relative; margin-bottom: 1.25rem; } li:before { content: '→'; position: absolute; left: 0; color: #ec4899; font-weight: bold; font-size: 1.25rem; }",
)

INSTITUTIONAL_BLUE = DeckTheme(
    name="Institutional Blue",
    description="Professional theme with blue and gray for institutional investors",
    primary_color="#2563eb",  # Blue
    secondary_color="#64748b",  # Slate gray
    accent_color="#0ea5e9",  # Sky blue
    background_color="#f8fafc",  # Off white
    text_color="#334155",  # Dark slate
    heading_color="#1e40af",  # Dark blue
    font_family="'Helvetica Neue', Helvetica, Arial, sans-serif",
    heading_font="'Helvetica Neue', Helvetica, Arial, sans-serif",
    font_size_base="1rem",
    font_size_heading="2.75rem",
    font_size_subtitle="1.5rem",
    line_height="1.6",
    slide_padding="3.5rem 4.5rem",
    slide_background="linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)",
    header_style="border-bottom: 4px solid #2563eb; padding-bottom: 1.25rem; margin-bottom: 2rem;",
    footer_style="border-top: 2px solid #cbd5e1; padding-top: 1rem; margin-top: 2rem; font-size: 0.875rem; color: #64748b;",
    bullet_style="list-style: none; padding-left: 0; li { padding-left: 2rem; position: relative; margin-bottom: 1rem; } li:before { content: '■'; position: absolute; left: 0; color: #2563eb; font-size: 0.75rem; }",
)


THEMES = {
    "black_ops_intelligence": BLACK_OPS_INTELLIGENCE,
    "palantir_minimalist": PALANTIR_MINIMALIST,
    "ghostquant_dark_fusion": GHOSTQUANT_DARK_FUSION,
    "institutional_blue": INSTITUTIONAL_BLUE,
}


def get_theme(theme_name: str) -> DeckTheme:
    """Get theme by name."""
    return THEMES.get(theme_name, GHOSTQUANT_DARK_FUSION)


def list_themes() -> list:
    """List all available themes."""
    return [
        {
            "id": key,
            "name": theme.name,
            "description": theme.description,
            "colors": {
                "primary": theme.primary_color,
                "secondary": theme.secondary_color,
                "accent": theme.accent_color,
                "background": theme.background_color,
            }
        }
        for key, theme in THEMES.items()
    ]
