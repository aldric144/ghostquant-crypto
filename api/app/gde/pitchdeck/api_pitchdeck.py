"""
Pitch Deck API Router

FastAPI endpoints for pitch deck generation.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from .pitchdeck_engine import PitchDeckEngine


router = APIRouter(prefix="/pitchdeck")
engine = PitchDeckEngine()



class InvestorDeckRequest(BaseModel):
    """Request model for investor deck generation"""
    company_name: str
    company_profile: Dict[str, Any] = {}


class GovernmentDeckRequest(BaseModel):
    """Request model for government deck generation"""
    agency_name: str
    agency_profile: Dict[str, Any] = {}


class CustomDeckRequest(BaseModel):
    """Request model for custom deck generation"""
    deck_name: str
    slide_templates: List[str]
    deck_type: str = "investor"
    profile: Dict[str, Any] = {}



@router.post("/investor")
async def generate_investor_deck(request: InvestorDeckRequest) -> Dict[str, Any]:
    """
    Generate investor pitch deck
    
    Args:
        request: Investor deck request with company profile
    
    Returns:
        Generated deck with JSON/Markdown/HTML exports
    """
    try:
        company_profile = {
            'company_name': request.company_name,
            **request.company_profile
        }
        
        result = engine.generate_investor_deck(company_profile)
        
        if not result.get('success'):
            return {
                'success': False,
                'error': result.get('error', 'Failed to generate investor deck')
            }
        
        return {
            'success': True,
            'deck': result['deck'],
            'export_package': result['export_package'],
            'message': f'Generated investor deck for {request.company_name}'
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to generate investor deck: {str(e)}'
        }


@router.post("/government")
async def generate_government_deck(request: GovernmentDeckRequest) -> Dict[str, Any]:
    """
    Generate government pitch deck
    
    Args:
        request: Government deck request with agency profile
    
    Returns:
        Generated deck with JSON/Markdown/HTML exports
    """
    try:
        agency_profile = {
            'agency_name': request.agency_name,
            **request.agency_profile
        }
        
        result = engine.generate_government_deck(agency_profile)
        
        if not result.get('success'):
            return {
                'success': False,
                'error': result.get('error', 'Failed to generate government deck')
            }
        
        return {
            'success': True,
            'deck': result['deck'],
            'export_package': result['export_package'],
            'message': f'Generated government deck for {request.agency_name}'
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to generate government deck: {str(e)}'
        }


@router.post("/custom")
async def generate_custom_deck(request: CustomDeckRequest) -> Dict[str, Any]:
    """
    Generate custom pitch deck with selected templates
    
    Args:
        request: Custom deck request with template selection
    
    Returns:
        Generated deck with JSON/Markdown/HTML exports
    """
    try:
        slides = []
        for template_id in request.slide_templates:
            slide = engine.generate_slide(template_id, request.profile, request.deck_type)
            if slide:
                slides.append(slide)
        
        if not slides:
            return {
                'success': False,
                'error': 'No valid slides generated from templates'
            }
        
        from .pitchdeck_schema import DeckMetadata, DeckSection, InvestorDeck, GovernmentDeck
        
        metadata = DeckMetadata(
            deck_type='custom',
            company_name=request.deck_name,
            slide_count=len(slides),
            section_count=1
        )
        
        section = DeckSection(
            name='Custom Deck',
            slides=slides,
            description='Custom assembled pitch deck'
        )
        
        if request.deck_type == 'investor':
            deck = InvestorDeck(
                metadata=metadata,
                sections=[section],
                executive_summary=f'Custom investor deck for {request.deck_name}',
                table_of_contents=[s.title for s in slides]
            )
        else:
            deck = GovernmentDeck(
                metadata=metadata,
                sections=[section],
                executive_summary=f'Custom government deck for {request.deck_name}',
                table_of_contents=[s.title for s in slides]
            )
        
        export_package = engine.assemble_deck(deck, request.deck_type)
        
        return {
            'success': True,
            'deck': deck.to_dict(),
            'export_package': export_package.to_dict(),
            'message': f'Generated custom deck: {request.deck_name}'
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to generate custom deck: {str(e)}'
        }


@router.get("/summary")
async def get_deck_summary(deck_type: str = "investor") -> Dict[str, Any]:
    """
    Get summary of available deck templates
    
    Args:
        deck_type: Type of deck (investor or government)
    
    Returns:
        Summary of available templates
    """
    try:
        if deck_type == "investor":
            templates = engine.investor_templates
        elif deck_type == "government":
            templates = engine.government_templates
        else:
            return {
                'success': False,
                'error': f'Invalid deck type: {deck_type}'
            }
        
        template_summaries = []
        for template_id, template in templates.items():
            template_summaries.append({
                'id': template_id,
                'headline': template.get('headline', ''),
                'subtitle': template.get('subtitle', ''),
                'bullet_count': len(template.get('bullets', [])),
                'visual_count': len(template.get('visuals', []))
            })
        
        return {
            'success': True,
            'deck_type': deck_type,
            'template_count': len(templates),
            'templates': template_summaries
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to get deck summary: {str(e)}'
        }


@router.get("/templates")
async def get_templates(deck_type: str = "investor") -> Dict[str, Any]:
    """
    Get all available templates for deck type
    
    Args:
        deck_type: Type of deck (investor or government)
    
    Returns:
        List of available templates
    """
    try:
        if deck_type == "investor":
            templates = engine.investor_templates
        elif deck_type == "government":
            templates = engine.government_templates
        else:
            return {
                'success': False,
                'error': f'Invalid deck type: {deck_type}'
            }
        
        return {
            'success': True,
            'deck_type': deck_type,
            'templates': list(templates.keys()),
            'template_count': len(templates)
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to get templates: {str(e)}'
        }


@router.get("/metadata")
async def get_metadata() -> Dict[str, Any]:
    """
    Get pitch deck generator metadata
    
    Returns:
        Metadata about the pitch deck generator
    """
    try:
        return {
            'success': True,
            'version': engine.VERSION,
            'deck_types': ['investor', 'government', 'custom'],
            'investor_templates': len(engine.investor_templates),
            'government_templates': len(engine.government_templates),
            'export_formats': ['json', 'markdown', 'html'],
            'features': [
                'Investor deck generation (15-20 slides)',
                'Government deck generation (20-30 slides)',
                'Custom deck assembly',
                'JSON/Markdown/HTML export',
                'Visual placeholders',
                'Narrative generation',
                'Risk flag detection',
                'Confidence scoring'
            ]
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to get metadata: {str(e)}'
        }


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint
    
    Returns:
        Health status
    """
    try:
        health = engine.health()
        
        return {
            'success': True,
            'status': health['status'],
            'version': health['version'],
            'investor_templates': health['investor_templates'],
            'government_templates': health['government_templates']
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Health check failed: {str(e)}'
        }


@router.get("/info")
async def get_info() -> Dict[str, Any]:
    """
    Get system information
    
    Returns:
        System information
    """
    try:
        info = engine.info()
        
        return {
            'success': True,
            'system': 'GhostQuant Pitch Deck Generator™',
            'version': info['version'],
            'features': info['features'],
            'investor_templates': info['investor_templates'],
            'government_templates': info['government_templates']
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to get info: {str(e)}'
        }
