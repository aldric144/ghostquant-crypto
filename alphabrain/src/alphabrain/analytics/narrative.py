"""
Narrative & News Context Analyzer

Uses LLM embeddings to read macro news, DeFi reports, and label
"funding catalysts" or "sentiment reversals."

Correlates narrative shifts with on-chain metrics.
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
from collections import defaultdict

logger = logging.getLogger(__name__)


class NarrativeAnalyzer:
    """
    Analyzes market narratives and sentiment from news and social media.
    
    In production, would integrate with:
    - News APIs (Bloomberg, Reuters, CoinDesk)
    - Social sentiment (Twitter, Reddit)
    - LLM embeddings for semantic analysis
    
    For demo, uses rule-based sentiment detection.
    """
    
    def __init__(self, enable_llm: bool = False):
        self.enable_llm = enable_llm
        self.narrative_history = []
        
        self.categories = [
            'macro_policy',      # Fed policy, regulations
            'institutional',     # Institutional adoption
            'defi_innovation',   # DeFi protocol launches
            'security_event',    # Hacks, exploits
            'market_structure',  # ETF approvals, derivatives
            'technology',        # Protocol upgrades
            'sentiment_shift'    # General sentiment changes
        ]
        
        self.bullish_keywords = [
            'adoption', 'institutional', 'etf', 'approval', 'upgrade',
            'partnership', 'integration', 'growth', 'bullish', 'rally'
        ]
        
        self.bearish_keywords = [
            'hack', 'exploit', 'regulation', 'ban', 'crash', 'selloff',
            'bearish', 'decline', 'concern', 'risk'
        ]
    
    def analyze_narrative(self, text: str, source: str = 'news') -> Dict:
        """
        Analyze narrative from text.
        
        Args:
            text: Text to analyze
            source: Source type (news, social, report)
        
        Returns:
            Dict with sentiment, category, keywords, impact_score
        """
        text_lower = text.lower()
        
        bullish_count = sum(1 for kw in self.bullish_keywords if kw in text_lower)
        bearish_count = sum(1 for kw in self.bearish_keywords if kw in text_lower)
        
        if bullish_count > bearish_count:
            sentiment = 'bullish'
            sentiment_score = min(1.0, bullish_count / 5)
        elif bearish_count > bullish_count:
            sentiment = 'bearish'
            sentiment_score = -min(1.0, bearish_count / 5)
        else:
            sentiment = 'neutral'
            sentiment_score = 0.0
        
        category = self._detect_category(text_lower)
        
        impact_score = self._compute_impact_score(text_lower, source)
        
        return {
            'sentiment': sentiment,
            'sentiment_score': sentiment_score,
            'category': category,
            'impact_score': impact_score,
            'source': source,
            'timestamp': datetime.now().isoformat()
        }
    
    def _detect_category(self, text: str) -> str:
        """Detect narrative category from text"""
        if any(kw in text for kw in ['fed', 'policy', 'regulation', 'sec']):
            return 'macro_policy'
        elif any(kw in text for kw in ['institutional', 'etf', 'blackrock', 'fidelity']):
            return 'institutional'
        elif any(kw in text for kw in ['defi', 'protocol', 'dex', 'lending']):
            return 'defi_innovation'
        elif any(kw in text for kw in ['hack', 'exploit', 'vulnerability', 'security']):
            return 'security_event'
        elif any(kw in text for kw in ['etf', 'futures', 'options', 'derivatives']):
            return 'market_structure'
        elif any(kw in text for kw in ['upgrade', 'fork', 'merge', 'technology']):
            return 'technology'
        else:
            return 'sentiment_shift'
    
    def _compute_impact_score(self, text: str, source: str) -> float:
        """
        Compute impact score based on text content and source.
        
        Higher impact = more likely to move markets
        """
        impact = 0.5  # Base impact
        
        if source == 'news':
            impact *= 1.2
        elif source == 'social':
            impact *= 0.8
        elif source == 'report':
            impact *= 1.5
        
        high_impact_keywords = [
            'etf', 'approval', 'ban', 'hack', 'billion',
            'institutional', 'regulation', 'sec', 'fed'
        ]
        
        impact_count = sum(1 for kw in high_impact_keywords if kw in text)
        impact += impact_count * 0.1
        
        return min(1.0, impact)
    
    def detect_narrative_shift(self, 
                              recent_narratives: List[Dict],
                              lookback_hours: int = 24) -> Optional[Dict]:
        """
        Detect significant narrative shifts.
        
        Args:
            recent_narratives: List of recent narrative analyses
            lookback_hours: Hours to look back for comparison
        
        Returns:
            Dict with shift details if detected, None otherwise
        """
        if len(recent_narratives) < 10:
            return None
        
        cutoff = datetime.now() - timedelta(hours=lookback_hours)
        
        recent = [n for n in recent_narratives 
                 if datetime.fromisoformat(n['timestamp']) > cutoff]
        historical = [n for n in recent_narratives 
                     if datetime.fromisoformat(n['timestamp']) <= cutoff]
        
        if not recent or not historical:
            return None
        
        recent_sentiment = np.mean([n['sentiment_score'] for n in recent])
        historical_sentiment = np.mean([n['sentiment_score'] for n in historical])
        
        sentiment_change = recent_sentiment - historical_sentiment
        
        if abs(sentiment_change) > 0.3:  # Significant shift
            return {
                'shift_detected': True,
                'direction': 'bullish' if sentiment_change > 0 else 'bearish',
                'magnitude': abs(sentiment_change),
                'recent_sentiment': recent_sentiment,
                'historical_sentiment': historical_sentiment,
                'n_recent_narratives': len(recent),
                'timestamp': datetime.now().isoformat()
            }
        
        return None
    
    def correlate_with_onchain(self,
                               narrative_sentiment: float,
                               onchain_metrics: Dict) -> Dict:
        """
        Correlate narrative sentiment with on-chain metrics.
        
        Args:
            narrative_sentiment: Sentiment score (-1 to 1)
            onchain_metrics: Dict with flow_score, tvl_change, etc.
        
        Returns:
            Dict with correlation analysis
        """
        flow_score = onchain_metrics.get('flow_score', 0)
        tvl_change = onchain_metrics.get('tvl_change', 0)
        
        narrative_bullish = narrative_sentiment > 0.2
        onchain_bullish = flow_score > 0.3 or tvl_change > 0.1
        
        narrative_bearish = narrative_sentiment < -0.2
        onchain_bearish = flow_score < -0.3 or tvl_change < -0.1
        
        if narrative_bullish and onchain_bullish:
            alignment = 'strong_bullish'
            confidence = 0.8
        elif narrative_bearish and onchain_bearish:
            alignment = 'strong_bearish'
            confidence = 0.8
        elif narrative_bullish and onchain_bearish:
            alignment = 'divergence_narrative_leads'
            confidence = 0.5
        elif narrative_bearish and onchain_bullish:
            alignment = 'divergence_onchain_leads'
            confidence = 0.5
        else:
            alignment = 'neutral'
            confidence = 0.3
        
        return {
            'alignment': alignment,
            'confidence': confidence,
            'narrative_sentiment': narrative_sentiment,
            'onchain_flow': flow_score,
            'onchain_tvl_change': tvl_change,
            'interpretation': self._interpret_correlation(alignment)
        }
    
    def _interpret_correlation(self, alignment: str) -> str:
        """Generate interpretation of narrative-onchain correlation"""
        interpretations = {
            'strong_bullish': (
                "Narrative and on-chain metrics both bullish. "
                "High confidence in upward momentum."
            ),
            'strong_bearish': (
                "Narrative and on-chain metrics both bearish. "
                "High confidence in downward pressure."
            ),
            'divergence_narrative_leads': (
                "Bullish narrative but bearish on-chain. "
                "Narrative may be leading, watch for on-chain confirmation."
            ),
            'divergence_onchain_leads': (
                "Bearish narrative but bullish on-chain. "
                "On-chain may be leading, narrative may catch up."
            ),
            'neutral': (
                "Mixed signals. No clear directional bias."
            )
        }
        
        return interpretations.get(alignment, "No interpretation available")
    
    def generate_narrative_summary(self, 
                                  recent_narratives: List[Dict],
                                  hours: int = 24) -> Dict:
        """
        Generate summary of recent narratives.
        
        Args:
            recent_narratives: List of narrative analyses
            hours: Hours to summarize
        
        Returns:
            Dict with summary statistics and key themes
        """
        cutoff = datetime.now() - timedelta(hours=hours)
        
        relevant = [n for n in recent_narratives 
                   if datetime.fromisoformat(n['timestamp']) > cutoff]
        
        if not relevant:
            return {
                'n_narratives': 0,
                'avg_sentiment': 0,
                'dominant_category': None,
                'key_themes': []
            }
        
        avg_sentiment = np.mean([n['sentiment_score'] for n in relevant])
        
        category_counts = defaultdict(int)
        for n in relevant:
            category_counts[n['category']] += 1
        
        dominant_category = max(category_counts.items(), key=lambda x: x[1])[0]
        
        bullish_count = sum(1 for n in relevant if n['sentiment'] == 'bullish')
        bearish_count = sum(1 for n in relevant if n['sentiment'] == 'bearish')
        neutral_count = len(relevant) - bullish_count - bearish_count
        
        return {
            'n_narratives': len(relevant),
            'avg_sentiment': avg_sentiment,
            'sentiment_distribution': {
                'bullish': bullish_count,
                'bearish': bearish_count,
                'neutral': neutral_count
            },
            'dominant_category': dominant_category,
            'category_distribution': dict(category_counts),
            'overall_tone': 'bullish' if avg_sentiment > 0.2 else 'bearish' if avg_sentiment < -0.2 else 'neutral'
        }
    
    def get_funding_catalysts(self, narratives: List[Dict]) -> List[Dict]:
        """
        Identify narratives that could be funding catalysts.
        
        Funding catalysts: events likely to drive capital flows
        """
        catalysts = []
        
        catalyst_categories = ['institutional', 'market_structure', 'macro_policy']
        
        for narrative in narratives:
            if narrative['category'] in catalyst_categories:
                if narrative['impact_score'] > 0.7:
                    catalysts.append({
                        'category': narrative['category'],
                        'sentiment': narrative['sentiment'],
                        'impact_score': narrative['impact_score'],
                        'timestamp': narrative['timestamp']
                    })
        
        catalysts.sort(key=lambda x: x['impact_score'], reverse=True)
        
        return catalysts
    
    def get_analyzer_summary(self) -> Dict:
        """Get summary of analyzer state"""
        return {
            'enable_llm': self.enable_llm,
            'categories': self.categories,
            'n_narratives_tracked': len(self.narrative_history)
        }


def generate_mock_narratives(n: int = 10) -> List[Dict]:
    """
    Generate mock narratives for demo purposes.
    
    Args:
        n: Number of narratives to generate
    
    Returns:
        List of narrative dicts
    """
    analyzer = NarrativeAnalyzer()
    
    sample_texts = [
        "Bitcoin ETF approval expected next week, institutional adoption accelerating",
        "Major DeFi protocol launches new lending feature with improved yields",
        "Fed signals potential rate cuts, risk-on sentiment returns to markets",
        "Security researchers discover vulnerability in popular DeFi protocol",
        "Ethereum upgrade successfully deployed, network capacity doubles",
        "Regulatory concerns emerge as SEC investigates major exchange",
        "Institutional investors increase crypto allocations amid inflation fears",
        "On-chain metrics show strong accumulation by long-term holders",
        "Market sentiment turns bearish as macro uncertainty increases",
        "New partnership announced between major bank and crypto infrastructure provider"
    ]
    
    narratives = []
    for i in range(min(n, len(sample_texts))):
        text = sample_texts[i]
        analysis = analyzer.analyze_narrative(text, source='news')
        narratives.append(analysis)
    
    return narratives
