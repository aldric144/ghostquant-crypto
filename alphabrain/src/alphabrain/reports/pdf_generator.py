"""
PDF Report Generator

Generates weekly investor letters in PDF format using ReportLab.
"""
import logging
from datetime import datetime
from typing import Dict, List
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT

logger = logging.getLogger(__name__)


class PDFReportGenerator:
    """
    Generates PDF reports for AlphaBrain.
    """
    
    def __init__(self, output_dir: str = '/app/reports'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e3a8a'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            spaceBefore=12
        )
    
    def generate_investor_letter(self,
                                 portfolio_data: Dict,
                                 regime_data: Dict,
                                 performance_metrics: Dict,
                                 period_start: datetime,
                                 period_end: datetime) -> str:
        """
        Generate investor letter PDF.
        
        Args:
            portfolio_data: Portfolio weights and metrics
            regime_data: Macro regime analysis
            performance_metrics: Performance statistics
            period_start: Period start date
            period_end: Period end date
        
        Returns:
            Path to generated PDF
        """
        filename = f"investor_letter_{period_end.strftime('%Y%m')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        story = []
        
        title = Paragraph("GhostQuant AlphaBrain<br/>Investor Letter", self.title_style)
        story.append(title)
        
        period_text = f"{period_start.strftime('%B %d, %Y')} - {period_end.strftime('%B %d, %Y')}"
        period_para = Paragraph(period_text, self.styles['Normal'])
        story.append(period_para)
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("Executive Summary", self.heading_style))
        
        summary_text = f"""
        Dear Investors,<br/><br/>
        
        We are pleased to present our performance update for the period ending 
        {period_end.strftime('%B %Y')}. Our systematic approach continues to generate 
        consistent risk-adjusted returns through disciplined factor investing and 
        adaptive risk management.<br/><br/>
        
        The current macro regime is classified as <b>{regime_data.get('regime', 'N/A')}</b> 
        with {regime_data.get('confidence', 0):.0%} confidence. This informs our 
        portfolio positioning and risk exposure levels.
        """
        story.append(Paragraph(summary_text, self.styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
        
        story.append(Paragraph("Performance Metrics", self.heading_style))
        
        metrics_data = [
            ['Metric', 'Value'],
            ['Expected Return', f"{performance_metrics.get('expected_return', 0):.2%}"],
            ['Volatility', f"{performance_metrics.get('volatility', 0):.2%}"],
            ['Sharpe Ratio', f"{performance_metrics.get('sharpe', 0):.2f}"],
            ['Max Weight', f"{performance_metrics.get('max_weight', 0):.2%}"],
            ['Effective N Assets', f"{performance_metrics.get('effective_n_assets', 0):.1f}"]
        ]
        
        metrics_table = Table(metrics_data, colWidths=[3*inch, 2*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("Market Commentary", self.heading_style))
        
        commentary = f"""
        The macro environment shows {regime_data.get('regime', 'neutral')} conditions. 
        {regime_data.get('interpretation', 'Market conditions are mixed.')}
        <br/><br/>
        Our exposure multiplier is currently {regime_data.get('exposure_multiplier', 1.0):.2f}x, 
        reflecting our systematic approach to regime-based risk management.
        """
        story.append(Paragraph(commentary, self.styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
        
        story.append(Paragraph("Portfolio Positioning", self.heading_style))
        
        weights = portfolio_data.get('weights', {})
        if weights:
            sorted_weights = sorted(weights.items(), key=lambda x: x[1], reverse=True)
            
            position_data = [['Asset', 'Weight']]
            for symbol, weight in sorted_weights[:10]:
                position_data.append([symbol, f"{weight:.2%}"])
            
            position_table = Table(position_data, colWidths=[2*inch, 2*inch])
            position_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(position_table)
        else:
            story.append(Paragraph("No active positions.", self.styles['Normal']))
        
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("Risk Management", self.heading_style))
        
        risk_text = f"""
        We maintain strict risk controls with position limits and correlation monitoring.
        Our portfolio volatility target is 15% annually, and we dynamically adjust exposure
        based on market regime and correlation conditions.<br/><br/>
        
        Current portfolio concentration (Herfindahl Index): 
        {performance_metrics.get('herfindahl_index', 0):.3f}
        """
        story.append(Paragraph(risk_text, self.styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
        
        story.append(Paragraph("Outlook", self.heading_style))
        
        outlook_text = """
        We remain focused on generating consistent risk-adjusted returns through our
        systematic approach combining momentum, value, and carry factors with adaptive
        risk management. Our multi-strategy framework allows us to navigate different
        market regimes effectively.<br/><br/>
        
        Thank you for your continued confidence.
        """
        story.append(Paragraph(outlook_text, self.styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        signature = Paragraph(
            "Sincerely,<br/>The GhostQuant AlphaBrain Team",
            self.styles['Normal']
        )
        story.append(signature)
        
        doc.build(story)
        
        logger.info(f"Generated investor letter: {filepath}")
        return filepath
    
    def generate_weekly_summary(self,
                               summary_data: Dict,
                               week_start: datetime,
                               week_end: datetime) -> str:
        """
        Generate weekly summary PDF.
        
        Args:
            summary_data: AlphaBrain summary data
            week_start: Week start date
            week_end: Week end date
        
        Returns:
            Path to generated PDF
        """
        filename = f"weekly_summary_{week_end.strftime('%Y%m%d')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        story = []
        
        title = Paragraph("AlphaBrain Weekly Summary", self.title_style)
        story.append(title)
        
        period_text = f"Week of {week_start.strftime('%B %d')} - {week_end.strftime('%B %d, %Y')}"
        story.append(Paragraph(period_text, self.styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        regime = summary_data.get('regime', {})
        story.append(Paragraph("Market Regime", self.heading_style))
        regime_text = f"""
        <b>Classification:</b> {regime.get('regime', 'N/A')}<br/>
        <b>Confidence:</b> {regime.get('confidence', 0):.0%}<br/>
        <b>Exposure Multiplier:</b> {regime.get('exposure_multiplier', 1.0):.2f}x
        """
        story.append(Paragraph(regime_text, self.styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
        
        portfolio = summary_data.get('portfolio', {})
        top_picks = portfolio.get('top_picks', [])
        
        if top_picks:
            story.append(Paragraph("Top 10 Alpha Assets", self.heading_style))
            
            picks_data = [['Rank', 'Asset', 'Weight', 'Score']]
            for i, pick in enumerate(top_picks[:10], 1):
                picks_data.append([
                    str(i),
                    pick.get('symbol', 'N/A'),
                    f"{pick.get('weight', 0):.2%}",
                    f"{pick.get('smart_beta_score', 0):.2f}"
                ])
            
            picks_table = Table(picks_data, colWidths=[0.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            picks_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(picks_table)
            story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("Risk Map", self.heading_style))
        metrics = portfolio.get('metrics', {})
        
        risk_data = [
            ['Metric', 'Value'],
            ['Expected Return', f"{metrics.get('expected_return', 0):.2%}"],
            ['Volatility', f"{metrics.get('volatility', 0):.2%}"],
            ['Sharpe Ratio', f"{metrics.get('sharpe', 0):.2f}"],
            ['Concentration', f"{metrics.get('herfindahl_index', 0):.3f}"]
        ]
        
        risk_table = Table(risk_data, colWidths=[2.5*inch, 2*inch])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige)
        ]))
        story.append(risk_table)
        
        doc.build(story)
        
        logger.info(f"Generated weekly summary: {filepath}")
        return filepath
