TREND_SCORE_WEIGHTS = {
    'mom_1h': 0.15,
    'mom_24h': 0.20,
    'accel_1h': 0.10,
    'vol_regime': 0.05,
    'volume_z': 0.10,
    'funding_flip': 0.10,
    'oi_shift': 0.10,
    'tvl_accel': 0.10,
    'flow_score': 0.10
}

PRETREND_COEFFICIENTS = {
    'intercept': 0.5,
    'mom_1h': 0.3,
    'mom_24h': 0.2,
    'accel_1h': 0.15,
    'volume_z': 0.1,
    'funding_flip': 0.05,
    'oi_shift': 0.1,
    'tvl_accel': 0.05,
    'flow_score': 0.05
}

ACTION_THRESHOLDS = {
    'buy_trend_score': 70,
    'buy_pretrend_prob': 0.6,
    'trim_trend_score': 60,
    'exit_trend_score': 40
}
