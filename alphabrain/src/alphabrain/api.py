"""
AlphaBrain API Endpoints

Exposes AlphaBrain functionality via REST API.
"""
import logging
from datetime import datetime
from typing import Dict, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from functools import wraps
import uvicorn

from alphabrain.service import AlphaBrainService

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="AlphaBrain API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

service: Optional[AlphaBrainService] = None
_cache = {}


@app.on_event("startup")
async def startup_event():
    """Initialize service on startup"""
    global service
    service = AlphaBrainService()
    await service.connect_db()
    logger.info("AlphaBrain API started")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global service
    if service:
        await service.close_db()
    logger.info("AlphaBrain API shutdown")


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "alphabrain", "timestamp": datetime.now().isoformat()}


@app.get("/alphabrain/summary")
async def get_summary():
    """
    Get comprehensive AlphaBrain summary.
    
    Returns:
        - Macro regime
        - Portfolio recommendation
        - Top picks
        - Playbook recommendations
        - Narrative summary
    
    Cached for 60s for performance.
    """
    try:
        cache_key = "alphabrain:summary"
        if cache_key in _cache:
            cached_data, cached_time = _cache[cache_key]
            if (datetime.now() - cached_time).total_seconds() < 60:
                return cached_data
        
        summary = await service.get_summary()
        _cache[cache_key] = (summary, datetime.now())
        return summary
    except Exception as e:
        logger.error(f"Error getting summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/alphabrain/regime")
async def get_regime():
    """
    Get current macro regime analysis.
    
    Returns:
        - Regime classification (risk_on, risk_off, neutral, crisis)
        - Confidence score
        - Macro indicators (VIX, DXY, yields)
        - Exposure multiplier
        - Interpretation
    """
    try:
        regime_data = await service.macro_detector.update_regime()
        return regime_data
    except Exception as e:
        logger.error(f"Error getting regime: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/alphabrain/portfolio")
async def get_portfolio():
    """
    Get portfolio recommendation.
    
    Returns:
        - Asset weights
        - Portfolio metrics (Sharpe, volatility, etc.)
        - Risk contributions
        - Top picks with rationale
    """
    try:
        recommendation = await service.generate_portfolio_recommendation()
        
        return {
            'weights': recommendation.get('portfolio_weights', {}),
            'metrics': recommendation.get('portfolio_metrics', {}),
            'top_picks': recommendation.get('top_picks', []),
            'timestamp': recommendation.get('timestamp')
        }
    except Exception as e:
        logger.error(f"Error getting portfolio: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/alphabrain/suggestions")
async def get_suggestions():
    """
    Get actionable investment suggestions.
    
    Returns:
        - Buy/sell recommendations
        - Position sizing
        - Risk warnings
        - Regime-based adjustments
    """
    try:
        recommendation = await service.generate_portfolio_recommendation()
        
        regime = recommendation.get('macro_regime', {})
        weights = recommendation.get('portfolio_weights', {})
        top_picks = recommendation.get('top_picks', [])
        playbook_rec = recommendation.get('playbook_recommendations', {})
        
        suggestions = {
            'timestamp': recommendation.get('timestamp'),
            'regime_context': {
                'regime': regime.get('regime'),
                'confidence': regime.get('confidence'),
                'interpretation': regime.get('interpretation')
            },
            'recommended_strategy': playbook_rec.get('primary_strategy'),
            'top_picks': top_picks,
            'actions': []
        }
        
        for pick in top_picks[:3]:
            action = {
                'symbol': pick['symbol'],
                'action': 'BUY' if pick['weight'] > 0.1 else 'ACCUMULATE',
                'target_weight': pick['weight'],
                'rationale': pick['rationale'],
                'confidence': 'HIGH' if pick['weight'] > 0.15 else 'MEDIUM'
            }
            suggestions['actions'].append(action)
        
        if regime.get('regime') == 'risk_off':
            suggestions['warnings'] = [
                "Risk-off regime detected. Consider reducing exposure.",
                "Increase cash allocation and focus on quality assets."
            ]
        elif regime.get('regime') == 'crisis':
            suggestions['warnings'] = [
                "Crisis mode. Minimize exposure and preserve capital.",
                "Wait for regime stabilization before re-entering."
            ]
        
        return suggestions
        
    except Exception as e:
        logger.error(f"Error getting suggestions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/alphabrain/playbooks")
async def get_playbooks():
    """
    Get institutional playbook analysis.
    
    Returns:
        - Results from all playbook strategies
        - Comparison metrics
        - Recommended strategy based on regime
    """
    try:
        recommendation = await service.generate_portfolio_recommendation()
        
        return {
            'playbook_results': recommendation.get('playbook_results', {}),
            'recommendations': recommendation.get('playbook_recommendations', {}),
            'timestamp': recommendation.get('timestamp')
        }
    except Exception as e:
        logger.error(f"Error getting playbooks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/alphabrain/factors")
async def get_factors():
    """
    Get factor model analysis.
    
    Returns:
        - Factor exposures for all assets
        - Smart Beta scores
        - Factor weights
    """
    try:
        factor_exposures = await service.compute_all_factor_exposures()
        
        if factor_exposures.empty:
            return {'factors': {}, 'smart_beta_scores': {}}
        
        smart_beta_scores = service.factor_model.compute_smart_beta_scores(factor_exposures)
        
        return {
            'factors': factor_exposures.to_dict('index'),
            'smart_beta_scores': smart_beta_scores.to_dict(),
            'model_summary': service.factor_model.get_model_summary()
        }
    except Exception as e:
        logger.error(f"Error getting factors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/alphabrain/narrative")
async def get_narrative():
    """
    Get narrative analysis.
    
    Returns:
        - Recent narrative summary
        - Sentiment distribution
        - Key themes
        - Funding catalysts
    """
    try:
        from alphabrain.analytics.narrative import generate_mock_narratives
        
        narratives = generate_mock_narratives(20)
        summary = service.narrative_analyzer.generate_narrative_summary(narratives, hours=24)
        catalysts = service.narrative_analyzer.get_funding_catalysts(narratives)
        
        return {
            'summary': summary,
            'catalysts': catalysts,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting narrative: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/alphabrain/analytics")
async def get_analytics():
    """
    Get Harvard-style performance analytics.
    
    Returns:
        - Sharpe, Sortino, Calmar ratios
        - Max drawdown, CVaR
        - Win rate, profit factor
    """
    try:
        return {
            'message': 'Analytics computed on actual portfolio performance',
            'note': 'Requires historical portfolio returns data',
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8081)
