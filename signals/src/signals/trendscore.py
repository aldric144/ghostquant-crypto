import math
from typing import Dict, Any, List, Tuple
from signals.config import TREND_SCORE_WEIGHTS, PRETREND_COEFFICIENTS, ACTION_THRESHOLDS

def normalize_factor(value: float, min_val: float, max_val: float) -> float:
    if max_val == min_val:
        return 0.5
    
    normalized = (value - min_val) / (max_val - min_val)
    return max(0.0, min(1.0, normalized))

def calculate_trend_score(factors: Dict[str, Any]) -> float:
    mom_1h_norm = normalize_factor(factors.get('mom_1h', 0), -10, 10)
    mom_24h_norm = normalize_factor(factors.get('mom_24h', 0), -50, 50)
    accel_1h_norm = normalize_factor(factors.get('accel_1h', 0), -5, 5)
    vol_regime_norm = 1 - normalize_factor(factors.get('vol_regime', 0), 0, 0.1)
    volume_z_norm = normalize_factor(factors.get('volume_z', 0), -3, 3)
    funding_flip_val = 1.0 if factors.get('funding_flip', False) else 0.0
    oi_shift_norm = normalize_factor(factors.get('oi_shift', 0), -20, 20)
    tvl_accel_norm = normalize_factor(factors.get('tvl_accel', 0), -1000000, 1000000)
    flow_score_norm = normalize_factor(factors.get('flow_score', 0), -10, 10)
    
    score = (
        TREND_SCORE_WEIGHTS['mom_1h'] * mom_1h_norm +
        TREND_SCORE_WEIGHTS['mom_24h'] * mom_24h_norm +
        TREND_SCORE_WEIGHTS['accel_1h'] * accel_1h_norm +
        TREND_SCORE_WEIGHTS['vol_regime'] * vol_regime_norm +
        TREND_SCORE_WEIGHTS['volume_z'] * volume_z_norm +
        TREND_SCORE_WEIGHTS['funding_flip'] * funding_flip_val +
        TREND_SCORE_WEIGHTS['oi_shift'] * oi_shift_norm +
        TREND_SCORE_WEIGHTS['tvl_accel'] * tvl_accel_norm +
        TREND_SCORE_WEIGHTS['flow_score'] * flow_score_norm
    )
    
    return score * 100

def sigmoid(x: float) -> float:
    return 1 / (1 + math.exp(-x))

def calculate_pretrend_prob(factors: Dict[str, Any]) -> float:
    z = PRETREND_COEFFICIENTS['intercept']
    z += PRETREND_COEFFICIENTS['mom_1h'] * factors.get('mom_1h', 0) / 10
    z += PRETREND_COEFFICIENTS['mom_24h'] * factors.get('mom_24h', 0) / 50
    z += PRETREND_COEFFICIENTS['accel_1h'] * factors.get('accel_1h', 0) / 5
    z += PRETREND_COEFFICIENTS['volume_z'] * factors.get('volume_z', 0) / 3
    z += PRETREND_COEFFICIENTS['funding_flip'] * (1.0 if factors.get('funding_flip', False) else 0.0)
    z += PRETREND_COEFFICIENTS['oi_shift'] * factors.get('oi_shift', 0) / 20
    z += PRETREND_COEFFICIENTS['tvl_accel'] * factors.get('tvl_accel', 0) / 1000000
    z += PRETREND_COEFFICIENTS['flow_score'] * factors.get('flow_score', 0) / 10
    
    return sigmoid(z)

def get_top_drivers(factors: Dict[str, Any], trend_score: float) -> List[Tuple[str, float]]:
    contributions = []
    
    mom_1h_norm = normalize_factor(factors.get('mom_1h', 0), -10, 10)
    contributions.append(('MOM_1H', TREND_SCORE_WEIGHTS['mom_1h'] * mom_1h_norm * 100))
    
    mom_24h_norm = normalize_factor(factors.get('mom_24h', 0), -50, 50)
    contributions.append(('MOM_24H', TREND_SCORE_WEIGHTS['mom_24h'] * mom_24h_norm * 100))
    
    accel_1h_norm = normalize_factor(factors.get('accel_1h', 0), -5, 5)
    contributions.append(('ACCEL_1H', TREND_SCORE_WEIGHTS['accel_1h'] * accel_1h_norm * 100))
    
    volume_z_norm = normalize_factor(factors.get('volume_z', 0), -3, 3)
    contributions.append(('VOLUME_Z', TREND_SCORE_WEIGHTS['volume_z'] * volume_z_norm * 100))
    
    funding_flip_val = 1.0 if factors.get('funding_flip', False) else 0.0
    contributions.append(('FUNDING_FLIP', TREND_SCORE_WEIGHTS['funding_flip'] * funding_flip_val * 100))
    
    oi_shift_norm = normalize_factor(factors.get('oi_shift', 0), -20, 20)
    contributions.append(('OI_SHIFT', TREND_SCORE_WEIGHTS['oi_shift'] * oi_shift_norm * 100))
    
    flow_score_norm = normalize_factor(factors.get('flow_score', 0), -10, 10)
    contributions.append(('FLOW_SCORE', TREND_SCORE_WEIGHTS['flow_score'] * flow_score_norm * 100))
    
    contributions.sort(key=lambda x: abs(x[1]), reverse=True)
    
    return contributions[:3]

def determine_action(trend_score: float, pretrend_prob: float, factors: Dict[str, Any]) -> str:
    if trend_score >= ACTION_THRESHOLDS['buy_trend_score'] and pretrend_prob >= ACTION_THRESHOLDS['buy_pretrend_prob']:
        return 'BUY'
    elif trend_score < ACTION_THRESHOLDS['trim_trend_score'] and (factors.get('funding_flip', False) or factors.get('oi_shift', 0) < -10):
        return 'TRIM'
    elif trend_score <= ACTION_THRESHOLDS['exit_trend_score']:
        return 'EXIT'
    else:
        return 'HOLD'

def generate_signal(factors: Dict[str, Any]) -> Dict[str, Any]:
    trend_score = calculate_trend_score(factors)
    pretrend_prob = calculate_pretrend_prob(factors)
    action = determine_action(trend_score, pretrend_prob, factors)
    top_drivers = get_top_drivers(factors, trend_score)
    
    confidence = min(abs(trend_score - 50) / 50, 1.0)
    
    rationale = {
        'top_drivers': [{'name': name, 'contribution': round(contrib, 2)} for name, contrib in top_drivers],
        'trend_score': round(trend_score, 2),
        'pretrend_prob': round(pretrend_prob, 3)
    }
    
    return {
        'asset_id': factors['asset_id'],
        'ts': factors['ts'],
        'trend_score': trend_score,
        'pretrend_prob': pretrend_prob,
        'action': action,
        'confidence': confidence,
        'rationale': rationale
    }
