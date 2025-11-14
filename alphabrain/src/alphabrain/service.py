"""
AlphaBrain Main Service

Orchestrates all AlphaBrain components:
- Macro regime detection
- Factor model computation
- Risk allocation
- Institutional playbooks
- Alpha fusion
- Narrative analysis
- Harvard analytics
"""
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import psycopg
from psycopg.rows import dict_row
import pandas as pd
import numpy as np

from alphabrain.config import DATABASE_URL, FACTOR_LOOKBACK_DAYS
from alphabrain.models.macro_regime import MacroRegimeDetector
from alphabrain.models.factor_model import FactorModel
from alphabrain.models.risk_allocator import RiskAllocator
from alphabrain.playbooks.institutional import InstitutionalPlaybook
from alphabrain.fusion.alpha_fusion import AlphaFusionAgent, SignalEnsemble
from alphabrain.analytics.narrative import NarrativeAnalyzer, generate_mock_narratives
from alphabrain.analytics.harvard_analytics import HarvardAnalytics

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AlphaBrainService:
    """
    Main AlphaBrain service that orchestrates all components.
    """
    
    def __init__(self):
        self.conn = None
        
        self.macro_detector = MacroRegimeDetector(use_mock_data=True)
        self.factor_model = FactorModel(lookback_days=FACTOR_LOOKBACK_DAYS)
        self.risk_allocator = RiskAllocator()
        self.playbook = InstitutionalPlaybook()
        self.fusion_agent = AlphaFusionAgent()
        self.signal_ensemble = SignalEnsemble(self.fusion_agent)
        self.narrative_analyzer = NarrativeAnalyzer()
        self.harvard_analytics = HarvardAnalytics()
        
        logger.info("AlphaBrain service initialized")
    
    async def connect_db(self):
        """Connect to database"""
        self.conn = await psycopg.AsyncConnection.connect(DATABASE_URL)
        logger.info("Database connected")
    
    async def close_db(self):
        """Close database connection"""
        if self.conn:
            await self.conn.close()
            logger.info("Database closed")
    
    async def get_assets(self) -> List[Dict]:
        """Get all assets from database"""
        async with self.conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM assets ORDER BY symbol")
            return await cur.fetchall()
    
    async def get_asset_price_history(self, asset_id: int, days: int = 90) -> pd.DataFrame:
        """Get price history for an asset"""
        async with self.conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("""
                SELECT ts, price, qty as volume
                FROM ticks
                WHERE asset_id = %s
                  AND ts >= NOW() - INTERVAL '%s days'
                ORDER BY ts
            """, (asset_id, days))
            
            rows = await cur.fetchall()
            
            if not rows:
                return pd.DataFrame()
            
            df = pd.DataFrame(rows)
            df['ts'] = pd.to_datetime(df['ts'])
            df.set_index('ts', inplace=True)
            
            return df
    
    async def get_asset_metrics(self, asset_id: int) -> Dict:
        """Get current metrics for an asset"""
        async with self.conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("""
                SELECT price, ts
                FROM ticks
                WHERE asset_id = %s
                ORDER BY ts DESC
                LIMIT 1
            """, (asset_id,))
            
            price_row = await cur.fetchone()
            
            if not price_row:
                return {}
            
            await cur.execute("""
                SELECT funding_8h, oi
                FROM derivatives
                WHERE asset_id = %s
                ORDER BY ts DESC
                LIMIT 1
            """, (asset_id,))
            
            deriv_row = await cur.fetchone()
            
            await cur.execute("""
                SELECT *
                FROM factors
                WHERE asset_id = %s
                ORDER BY ts DESC
                LIMIT 1
            """, (asset_id,))
            
            factors_row = await cur.fetchone()
            
            metrics = {
                'current_price': price_row['price'] if price_row else 0,
                'funding_rate': deriv_row['funding_8h'] if deriv_row else 0,
                'oi': deriv_row['oi'] if deriv_row else 0,
                'staking_yield': 0.0,  # Placeholder
                'market_cap': 1e9,  # Placeholder
                'volume_24h': 1e8,  # Placeholder
                'spread_bps': 10,  # Placeholder
                'ma_200': price_row['price'] * 0.95 if price_row else 0,  # Approximate
            }
            
            return metrics
    
    async def compute_all_factor_exposures(self) -> pd.DataFrame:
        """Compute factor exposures for all assets"""
        assets = await self.get_assets()
        
        factor_data = []
        
        for asset in assets:
            asset_id = asset['asset_id']
            symbol = asset['symbol']
            
            price_history = await self.get_asset_price_history(asset_id)
            
            metrics = await self.get_asset_metrics(asset_id)
            
            exposures = await self.factor_model.compute_factor_exposures(
                metrics, price_history
            )
            
            exposures['symbol'] = symbol
            exposures['asset_id'] = asset_id
            
            factor_data.append(exposures)
        
        if not factor_data:
            return pd.DataFrame()
        
        df = pd.DataFrame(factor_data)
        df.set_index('symbol', inplace=True)
        
        return df
    
    async def generate_portfolio_recommendation(self) -> Dict:
        """Generate complete portfolio recommendation"""
        logger.info("Generating portfolio recommendation...")
        
        regime_data = await self.macro_detector.update_regime()
        logger.info(f"Macro regime: {regime_data['regime']} (confidence: {regime_data['confidence']:.2f})")
        
        factor_exposures = await self.compute_all_factor_exposures()
        
        if factor_exposures.empty:
            logger.warning("No factor exposures computed")
            return {}
        
        logger.info(f"Computed factor exposures for {len(factor_exposures)} assets")
        
        smart_beta_scores = self.factor_model.compute_smart_beta_scores(factor_exposures)
        
        market_data = {'trend_scores': smart_beta_scores.to_dict()}
        playbook_results = self.playbook.run_all_playbooks(factor_exposures, market_data)
        
        playbook_recommendations = self.playbook.get_playbook_recommendations(
            playbook_results,
            regime_data['regime'],
            risk_tolerance='moderate'
        )
        
        expected_returns = smart_beta_scores / 100  # Scale to reasonable return range
        
        volatilities = pd.Series(0.5, index=expected_returns.index)  # 50% annual vol default
        
        correlations = pd.DataFrame(
            np.eye(len(expected_returns)),
            index=expected_returns.index,
            columns=expected_returns.index
        )
        
        regime_multiplier = self.macro_detector.get_crypto_exposure_multiplier()
        
        portfolio_weights = self.risk_allocator.allocate_portfolio(
            expected_returns,
            volatilities,
            correlations,
            regime_multiplier
        )
        
        weights_series = pd.Series(portfolio_weights).reindex(expected_returns.index, fill_value=0.0)
        portfolio_metrics = self.risk_allocator.compute_portfolio_metrics(
            weights_series,
            expected_returns.reindex(weights_series.index),
            volatilities.reindex(weights_series.index),
            correlations.reindex(index=weights_series.index, columns=weights_series.index)
        )
        
        narratives = generate_mock_narratives(10)
        narrative_summary = self.narrative_analyzer.generate_narrative_summary(narratives, hours=24)
        
        return {
            'timestamp': datetime.now().isoformat(),
            'macro_regime': regime_data,
            'portfolio_weights': portfolio_weights,
            'portfolio_metrics': portfolio_metrics,
            'smart_beta_scores': smart_beta_scores.to_dict(),
            'playbook_results': playbook_results,
            'playbook_recommendations': playbook_recommendations,
            'narrative_summary': narrative_summary,
            'top_picks': self._get_top_picks(portfolio_weights, smart_beta_scores, 5)
        }
    
    def _get_top_picks(self, 
                      weights: Dict[str, float],
                      scores: pd.Series,
                      n: int = 5) -> List[Dict]:
        """Get top portfolio picks with rationale"""
        sorted_weights = sorted(weights.items(), key=lambda x: x[1], reverse=True)
        
        top_picks = []
        for symbol, weight in sorted_weights[:n]:
            score = scores.get(symbol, 0)
            
            top_picks.append({
                'symbol': symbol,
                'weight': weight,
                'smart_beta_score': score,
                'rationale': f"Strong factor scores with {weight:.1%} allocation"
            })
        
        return top_picks
    
    async def get_summary(self) -> Dict:
        """Get AlphaBrain summary"""
        recommendation = await self.generate_portfolio_recommendation()
        
        return {
            'service': 'AlphaBrain',
            'version': '0.1.0',
            'timestamp': datetime.now().isoformat(),
            'regime': recommendation.get('macro_regime', {}),
            'portfolio': {
                'weights': recommendation.get('portfolio_weights', {}),
                'metrics': recommendation.get('portfolio_metrics', {}),
                'top_picks': recommendation.get('top_picks', [])
            },
            'playbook_recommendation': recommendation.get('playbook_recommendations', {}),
            'narrative': recommendation.get('narrative_summary', {})
        }
    
    async def run_periodic_update(self, interval_seconds: int = 3600):
        """Run periodic updates"""
        logger.info(f"Starting periodic updates every {interval_seconds}s")
        
        while True:
            try:
                summary = await self.get_summary()
                logger.info(f"Update complete: {summary['regime']['regime']}")
                
                
            except Exception as e:
                logger.error(f"Error in periodic update: {e}")
            
            await asyncio.sleep(interval_seconds)


async def main():
    """Main entry point"""
    service = AlphaBrainService()
    
    try:
        await service.connect_db()
        
        logger.info("Generating initial portfolio recommendation...")
        summary = await service.get_summary()
        
        logger.info("\n" + "="*60)
        logger.info("ALPHABRAIN SUMMARY")
        logger.info("="*60)
        logger.info(f"Regime: {summary['regime']['regime']} ({summary['regime']['confidence']:.2f})")
        logger.info(f"Exposure Multiplier: {summary['regime'].get('exposure_multiplier', 1.0):.2f}")
        logger.info(f"\nTop Picks:")
        for pick in summary['portfolio']['top_picks']:
            logger.info(f"  {pick['symbol']}: {pick['weight']:.1%} (score: {pick['smart_beta_score']:.2f})")
        logger.info("="*60)
        
        
    finally:
        await service.close_db()


if __name__ == "__main__":
    asyncio.run(main())
