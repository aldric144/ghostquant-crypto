"""
Unit tests for CompositeScorer service.
Tests the 9-feature scoring logic with various inputs.
"""
import pytest
from app.services.composite_scorer import CompositeScorer


class TestCompositeScorer:
    """Test suite for CompositeScorer."""
    
    @pytest.fixture
    def scorer(self):
        """Create a CompositeScorer instance."""
        return CompositeScorer()
    
    def test_perfect_score(self, scorer):
        """Test scoring with perfect features."""
        features = {
            "symbol": "BTC",
            "short_return_1h": 10.0,
            "med_return_4h": 20.0,
            "long_return_24h": 30.0,
            "vol_ratio_30m_vs_24h": 3.0,
            "orderbook_imbalance": 1.0,
            "liquidity_depth_at_1pct": 10_000_000,
            "onchain_inflow_30m_usd": 1_000_000,
            "cross_exchange_confirmation_count": 10,
            "pretrend_prob": 1.0,
            "market_cap": 100_000_000,
            "total_volume": 50_000_000,
            "liquidity_score": 95
        }
        
        result = scorer.compute_score(features)
        
        assert result["symbol"] == "BTC"
        assert 80 <= result["score"] <= 100
        assert result["confidence"] >= 90
        assert len(result["top_features"]) == 3
        assert len(result["risk_flags"]) == 0
        assert result["why"] != ""
    
    def test_poor_score(self, scorer):
        """Test scoring with poor features."""
        features = {
            "symbol": "POOR",
            "short_return_1h": -10.0,
            "med_return_4h": -20.0,
            "long_return_24h": -30.0,
            "vol_ratio_30m_vs_24h": 0.5,
            "orderbook_imbalance": -1.0,
            "liquidity_depth_at_1pct": 0,
            "onchain_inflow_30m_usd": 0,
            "cross_exchange_confirmation_count": 1,
            "pretrend_prob": 0.0,
            "market_cap": 1_000_000,
            "total_volume": 10_000,
            "liquidity_score": 30
        }
        
        result = scorer.compute_score(features)
        
        assert result["symbol"] == "POOR"
        assert 0 <= result["score"] <= 40
        assert result["confidence"] < 100
        assert len(result["risk_flags"]) > 0
    
    def test_missing_features(self, scorer):
        """Test scoring with missing features."""
        features = {
            "symbol": "MISSING",
            "short_return_1h": 0.0,
            "med_return_4h": 0.0,
            "long_return_24h": 0.0,
            "vol_ratio_30m_vs_24h": 1.0,
            "orderbook_imbalance": 0.0,
            "liquidity_depth_at_1pct": 0.0,
            "onchain_inflow_30m_usd": 0.0,
            "cross_exchange_confirmation_count": 1,
            "pretrend_prob": 0.0,
            "market_cap": 1_000_000,
            "total_volume": 100_000,
            "liquidity_score": 50
        }
        
        result = scorer.compute_score(features)
        
        assert result["confidence"] < 100
        assert "liquidity_low" in result["risk_flags"] or "low_cross_confirm" in result["risk_flags"]
    
    def test_score_bounds(self, scorer):
        """Test that scores are always within 0-100 range."""
        test_cases = [
            {"short_return_1h": 100.0, "med_return_4h": 100.0, "long_return_24h": 100.0},
            {"short_return_1h": -100.0, "med_return_4h": -100.0, "long_return_24h": -100.0},
            {"short_return_1h": 0.0, "med_return_4h": 0.0, "long_return_24h": 0.0},
        ]
        
        for test_features in test_cases:
            features = {
                "symbol": "TEST",
                "vol_ratio_30m_vs_24h": 1.0,
                "orderbook_imbalance": 0.0,
                "liquidity_depth_at_1pct": 1_000_000,
                "onchain_inflow_30m_usd": 0.0,
                "cross_exchange_confirmation_count": 2,
                "pretrend_prob": 0.5,
                "market_cap": 10_000_000,
                "total_volume": 1_000_000,
                "liquidity_score": 70,
                **test_features
            }
            
            result = scorer.compute_score(features)
            
            assert 0 <= result["score"] <= 100
            assert 0 <= result["confidence"] <= 100
    
    def test_top_features_count(self, scorer):
        """Test that exactly 3 top features are returned."""
        features = {
            "symbol": "ETH",
            "short_return_1h": 5.0,
            "med_return_4h": 10.0,
            "long_return_24h": 15.0,
            "vol_ratio_30m_vs_24h": 2.0,
            "orderbook_imbalance": 0.5,
            "liquidity_depth_at_1pct": 5_000_000,
            "onchain_inflow_30m_usd": 500_000,
            "cross_exchange_confirmation_count": 5,
            "pretrend_prob": 0.7,
            "market_cap": 50_000_000,
            "total_volume": 25_000_000,
            "liquidity_score": 85
        }
        
        result = scorer.compute_score(features)
        
        assert len(result["top_features"]) == 3
        for feature in result["top_features"]:
            assert "feature" in feature
            assert "contribution" in feature
            assert "note" in feature
    
    def test_explain_mode(self, scorer):
        """Test scoring with explain=True."""
        features = {
            "symbol": "SOL",
            "short_return_1h": 3.0,
            "med_return_4h": 6.0,
            "long_return_24h": 12.0,
            "vol_ratio_30m_vs_24h": 1.5,
            "orderbook_imbalance": 0.2,
            "liquidity_depth_at_1pct": 2_000_000,
            "onchain_inflow_30m_usd": 100_000,
            "cross_exchange_confirmation_count": 3,
            "pretrend_prob": 0.6,
            "market_cap": 20_000_000,
            "total_volume": 10_000_000,
            "liquidity_score": 75
        }
        
        result = scorer.compute_score(features, explain=True)
        
        assert "explain" in result
        assert "formula" in result["explain"]
        assert "score_raw" in result["explain"]
        assert "all_contributions" in result["explain"]
        assert len(result["explain"]["all_contributions"]) == 9
    
    def test_mock_features_generation(self, scorer):
        """Test mock feature generation."""
        coin_data = {
            "symbol": "MOCK",
            "market_cap": 10_000_000,
            "total_volume": 5_000_000,
            "price_change_percentage_1h": 2.0,
            "price_change_percentage_24h": 5.0
        }
        
        features = scorer.generate_mock_features("MOCK", coin_data)
        
        assert features["symbol"] == "MOCK"
        assert "short_return_1h" in features
        assert "med_return_4h" in features
        assert "long_return_24h" in features
        assert "cross_exchange_confirmation_count" in features
        assert features["cross_exchange_confirmation_count"] >= 1
    
    def test_confidence_penalty_for_missing_data(self, scorer):
        """Test that confidence decreases with missing features."""
        complete_features = {
            "symbol": "COMPLETE",
            "short_return_1h": 5.0,
            "med_return_4h": 10.0,
            "long_return_24h": 15.0,
            "vol_ratio_30m_vs_24h": 2.0,
            "orderbook_imbalance": 0.5,
            "liquidity_depth_at_1pct": 5_000_000,
            "onchain_inflow_30m_usd": 500_000,
            "cross_exchange_confirmation_count": 5,
            "pretrend_prob": 0.7,
            "market_cap": 50_000_000,
            "total_volume": 25_000_000,
            "liquidity_score": 85
        }
        
        incomplete_features = {
            **complete_features,
            "symbol": "INCOMPLETE",
            "orderbook_imbalance": 0.0,
            "liquidity_depth_at_1pct": 0.0,
            "onchain_inflow_30m_usd": 0.0,
            "liquidity_score": 60
        }
        
        complete_result = scorer.compute_score(complete_features)
        incomplete_result = scorer.compute_score(incomplete_features)
        
        assert incomplete_result["confidence"] < complete_result["confidence"]
        assert len(incomplete_result["risk_flags"]) > len(complete_result["risk_flags"])
