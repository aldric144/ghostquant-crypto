"""
Behavioral DNA™ Engine - Core Intelligence Module
Extracts behavioral features, classifies archetypes, and generates DNA codes.
"""

from typing import Dict, List, Any
from datetime import datetime


def safe_float(value: Any, default: float = 0.0) -> float:
    """Safely convert value to float."""
    try:
        return float(value) if value is not None else default
    except (ValueError, TypeError):
        return default


def safe_int(value: Any, default: int = 0) -> int:
    """Safely convert value to int."""
    try:
        return int(value) if value is not None else default
    except (ValueError, TypeError):
        return default


def extract_behavioral_features(entity_history: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Extract 40-60 behavioral features from entity transaction history.
    
    Args:
        entity_history: List of transaction/event dictionaries
        
    Returns:
        Dictionary of behavioral features
    """
    try:
        print("[BehavioralDNA] Extracting behavioral features...")
        
        if not entity_history or len(entity_history) == 0:
            print("[BehavioralDNA] Empty history, returning default features")
            return _get_default_features()
        
        n = len(entity_history)
        
        timestamps = []
        values = []
        chains = []
        tokens = []
        
        for event in entity_history:
            timestamps.append(safe_int(event.get('timestamp', 0)))
            values.append(safe_float(event.get('value', 0)))
            chains.append(str(event.get('chain', 'unknown')))
            tokens.append(str(event.get('token', 'unknown')))
        
        sorted_indices = sorted(range(n), key=lambda i: timestamps[i])
        timestamps = [timestamps[i] for i in sorted_indices]
        values = [values[i] for i in sorted_indices]
        chains = [chains[i] for i in sorted_indices]
        tokens = [tokens[i] for i in sorted_indices]
        
        features = {}
        
        
        if n > 1 and timestamps[-1] > timestamps[0]:
            time_span_hours = (timestamps[-1] - timestamps[0]) / 3600.0
            features['activity_velocity'] = n / max(time_span_hours, 0.1)
        else:
            features['activity_velocity'] = 0.0
        
        if n > 2:
            intervals = [timestamps[i+1] - timestamps[i] for i in range(n-1)]
            mean_interval = sum(intervals) / len(intervals) if intervals else 1.0
            variance = sum((x - mean_interval) ** 2 for x in intervals) / len(intervals) if intervals else 0.0
            features['burstiness_index'] = variance / (mean_interval ** 2 + 1.0)
        else:
            features['burstiness_index'] = 0.0
        
        if timestamps:
            hours = [(ts % 86400) / 3600.0 for ts in timestamps]
            mean_hour = sum(hours) / len(hours)
            features['circadian_offset'] = abs(mean_hour - 12.0) / 12.0
        else:
            features['circadian_offset'] = 0.0
        
        if values:
            mean_value = sum(values) / len(values)
            variance_value = sum((v - mean_value) ** 2 for v in values) / len(values)
            features['volatility_score'] = min(variance_value / (mean_value ** 2 + 1.0), 1.0)
        else:
            features['volatility_score'] = 0.0
        
        features['time_consistency'] = 1.0 - min(features['burstiness_index'], 1.0)
        
        if n > 5:
            day_counts = {}
            for ts in timestamps:
                day = ts // 86400
                day_counts[day] = day_counts.get(day, 0) + 1
            if day_counts:
                mean_daily = sum(day_counts.values()) / len(day_counts)
                variance_daily = sum((c - mean_daily) ** 2 for c in day_counts.values()) / len(day_counts)
                features['activity_rhythm'] = 1.0 - min(variance_daily / (mean_daily ** 2 + 1.0), 1.0)
            else:
                features['activity_rhythm'] = 0.5
        else:
            features['activity_rhythm'] = 0.5
        
        
        unique_chains = len(set(chains))
        features['chain_hopping_rate'] = min(unique_chains / max(n, 1), 1.0)
        
        chain_counts = {}
        for chain in chains:
            chain_counts[chain] = chain_counts.get(chain, 0) + 1
        
        entropy = 0.0
        for count in chain_counts.values():
            p = count / n
            if p > 0:
                entropy -= p * (p ** 0.5)  # Modified entropy
        features['cross_chain_entropy'] = min(entropy, 1.0)
        
        features['multi_chain_complexity'] = min(unique_chains / 10.0, 1.0)
        
        if n > 1:
            switches = sum(1 for i in range(n-1) if chains[i] != chains[i+1])
            features['chain_switching_frequency'] = switches / (n - 1)
        else:
            features['chain_switching_frequency'] = 0.0
        
        features['chain_diversity'] = min(len(chain_counts) / 5.0, 1.0)
        
        
        if n > 2:
            value_increases = sum(1 for i in range(n-1) if values[i+1] > values[i])
            features['profit_seeking_score'] = value_increases / (n - 1)
        else:
            features['profit_seeking_score'] = 0.5
        
        if values:
            mean_val = sum(values) / len(values)
            large_spikes = sum(1 for v in values if v > mean_val * 3)
            features['manipulation_bias'] = min(large_spikes / max(n, 1), 1.0)
        else:
            features['manipulation_bias'] = 0.0
        
        if values:
            mean_val = sum(values) / len(values)
            low_value_txs = sum(1 for v in values if v < mean_val * 0.5)
            features['stealth_factor'] = low_value_txs / max(n, 1)
        else:
            features['stealth_factor'] = 0.0
        
        features['opportunistic_index'] = min(features['activity_velocity'] * features['burstiness_index'], 1.0)
        
        if values:
            sorted_values = sorted(values, reverse=True)
            top_10_pct = max(1, n // 10)
            top_value_sum = sum(sorted_values[:top_10_pct])
            total_value = sum(values)
            features['value_concentration'] = top_value_sum / max(total_value, 1.0)
        else:
            features['value_concentration'] = 0.0
        
        
        if n > 3:
            first_half = values[:n//2]
            second_half = values[n//2:]
            mean_first = sum(first_half) / len(first_half) if first_half else 0
            mean_second = sum(second_half) / len(second_half) if second_half else 0
            features['risk_trend_slope'] = (mean_second - mean_first) / max(mean_first, 1.0)
            features['risk_trend_slope'] = max(-1.0, min(1.0, features['risk_trend_slope']))
        else:
            features['risk_trend_slope'] = 0.0
        
        if values and len(values) > 3:
            mean_val = sum(values) / len(values)
            std_val = (sum((v - mean_val) ** 2 for v in values) / len(values)) ** 0.5
            anomalies = sum(1 for v in values if abs(v - mean_val) > 2 * std_val)
            features['anomaly_frequency'] = anomalies / len(values)
        else:
            features['anomaly_frequency'] = 0.0
        
        features['stress_reactivity'] = min(features['volatility_score'] * features['burstiness_index'], 1.0)
        
        if n > 4:
            recent = values[-n//4:]
            older = values[:n//4]
            recent_mean = sum(recent) / len(recent) if recent else 0
            older_mean = sum(older) / len(older) if older else 0
            features['risk_acceleration'] = (recent_mean - older_mean) / max(older_mean, 1.0)
            features['risk_acceleration'] = max(-1.0, min(1.0, features['risk_acceleration']))
        else:
            features['risk_acceleration'] = 0.0
        
        features['risk_volatility'] = features['volatility_score']
        
        
        features['behavioral_consistency'] = 1.0 - min(features['volatility_score'] + features['burstiness_index'], 1.0) / 2.0
        
        unique_tokens = len(set(tokens))
        features['identity_stability'] = 1.0 - min((unique_chains + unique_tokens) / 20.0, 1.0)
        
        features['predictability_score'] = (features['behavioral_consistency'] + features['time_consistency']) / 2.0
        
        features['pattern_regularity'] = 1.0 - features['anomaly_frequency']
        
        features['stability_index'] = (features['identity_stability'] + features['behavioral_consistency']) / 2.0
        
        
        features['token_diversity'] = min(unique_tokens / 10.0, 1.0)
        
        if values:
            features['tx_size_variance'] = features['volatility_score']
        else:
            features['tx_size_variance'] = 0.0
        
        if n > 3:
            clusters = 0
            cluster_threshold = 3600  # 1 hour
            for i in range(n-1):
                if timestamps[i+1] - timestamps[i] < cluster_threshold:
                    clusters += 1
            features['temporal_clustering'] = clusters / (n - 1)
        else:
            features['temporal_clustering'] = 0.0
        
        if n > 2:
            recent_values = values[-min(5, n):]
            momentum = (recent_values[-1] - recent_values[0]) / max(recent_values[0], 1.0)
            features['value_momentum'] = max(-1.0, min(1.0, momentum))
        else:
            features['value_momentum'] = 0.0
        
        if timestamps and timestamps[-1] > timestamps[0]:
            time_span = timestamps[-1] - timestamps[0]
            features['activity_density'] = n / max(time_span / 86400.0, 0.1)  # per day
        else:
            features['activity_density'] = 0.0
        
        if n > 3:
            intervals = [timestamps[i+1] - timestamps[i] for i in range(n-1)]
            if intervals:
                mean_interval = sum(intervals) / len(intervals)
                regular_intervals = sum(1 for iv in intervals if abs(iv - mean_interval) < mean_interval * 0.2)
                features['coordination_signal'] = regular_intervals / len(intervals)
            else:
                features['coordination_signal'] = 0.0
        else:
            features['coordination_signal'] = 0.0
        
        features['stealth_mode'] = features['stealth_factor'] * (1.0 - features['activity_velocity'] / 10.0)
        
        features['bot_like_score'] = (features['coordination_signal'] + features['pattern_regularity']) / 2.0
        
        features['manipulation_signal'] = (features['manipulation_bias'] + features['anomaly_frequency']) / 2.0
        
        features['ghost_score'] = (features['stealth_factor'] + features['identity_stability']) / 2.0
        
        features['predator_score'] = (features['manipulation_bias'] + features['profit_seeking_score'] + features['risk_acceleration']) / 3.0
        
        features['opportunist_score'] = features['opportunistic_index']
        
        features['agent_score'] = features['bot_like_score']
        
        features['coordinated_actor_score'] = (features['coordination_signal'] + features['temporal_clustering']) / 2.0
        
        features['network_effect'] = min(features['chain_diversity'] * features['token_diversity'], 1.0)
        
        features['complexity_score'] = (features['multi_chain_complexity'] + features['token_diversity']) / 2.0
        
        features['aggression_index'] = (features['manipulation_bias'] + features['value_momentum']) / 2.0
        
        features['patience_score'] = 1.0 - features['opportunistic_index']
        
        features['sophistication_level'] = (features['complexity_score'] + features['stealth_factor']) / 2.0
        
        print(f"[BehavioralDNA] Extracted {len(features)} features")
        return features
        
    except Exception as e:
        print(f"[BehavioralDNA] Error extracting features: {e}")
        return _get_default_features()


def _get_default_features() -> Dict[str, float]:
    """Return default features when history is empty or invalid."""
    return {
        'activity_velocity': 0.0,
        'burstiness_index': 0.0,
        'circadian_offset': 0.5,
        'volatility_score': 0.0,
        'time_consistency': 0.5,
        'activity_rhythm': 0.5,
        'chain_hopping_rate': 0.0,
        'cross_chain_entropy': 0.0,
        'multi_chain_complexity': 0.0,
        'chain_switching_frequency': 0.0,
        'chain_diversity': 0.0,
        'profit_seeking_score': 0.5,
        'manipulation_bias': 0.0,
        'stealth_factor': 0.0,
        'opportunistic_index': 0.0,
        'value_concentration': 0.0,
        'risk_trend_slope': 0.0,
        'anomaly_frequency': 0.0,
        'stress_reactivity': 0.0,
        'risk_acceleration': 0.0,
        'risk_volatility': 0.0,
        'behavioral_consistency': 0.5,
        'identity_stability': 0.5,
        'predictability_score': 0.5,
        'pattern_regularity': 0.5,
        'stability_index': 0.5,
        'token_diversity': 0.0,
        'tx_size_variance': 0.0,
        'temporal_clustering': 0.0,
        'value_momentum': 0.0,
        'activity_density': 0.0,
        'coordination_signal': 0.0,
        'stealth_mode': 0.0,
        'bot_like_score': 0.0,
        'manipulation_signal': 0.0,
        'ghost_score': 0.0,
        'predator_score': 0.0,
        'opportunist_score': 0.0,
        'agent_score': 0.0,
        'coordinated_actor_score': 0.0,
        'network_effect': 0.0,
        'complexity_score': 0.0,
        'aggression_index': 0.0,
        'patience_score': 0.5,
        'sophistication_level': 0.0
    }


def classify_archetype(features: Dict[str, float]) -> Dict[str, Any]:
    """
    Classify behavioral archetype based on extracted features.
    
    Args:
        features: Dictionary of behavioral features
        
    Returns:
        Dictionary with classification results
    """
    try:
        print("[BehavioralDNA] Classifying archetype...")
        
        archetypes = {
            'PREDATOR': features.get('predator_score', 0.0),
            'OPPORTUNIST': features.get('opportunist_score', 0.0),
            'COORDINATED_ACTOR': features.get('coordinated_actor_score', 0.0),
            'GHOST': features.get('ghost_score', 0.0),
            'AGENT': features.get('agent_score', 0.0),
            'MANIPULATOR': features.get('manipulation_signal', 0.0)
        }
        
        dominant = max(archetypes.items(), key=lambda x: x[1])
        archetype_name = dominant[0]
        archetype_score = dominant[1]
        
        top_signals = _get_top_signals(archetype_name, features)
        
        supporting_features = _get_supporting_features(archetype_name, features)
        
        result = {
            'classification_name': archetype_name,
            'classification_score': archetype_score,
            'top_signals': top_signals,
            'supporting_features': supporting_features,
            'all_scores': archetypes
        }
        
        print(f"[BehavioralDNA] Classified as {archetype_name} (score: {archetype_score:.3f})")
        return result
        
    except Exception as e:
        print(f"[BehavioralDNA] Error classifying archetype: {e}")
        return {
            'classification_name': 'UNKNOWN',
            'classification_score': 0.0,
            'top_signals': ['Error in classification'],
            'supporting_features': {},
            'all_scores': {}
        }


def _get_top_signals(archetype: str, features: Dict[str, float]) -> List[str]:
    """Get top 3-5 signals for the given archetype."""
    signals = {
        'PREDATOR': [
            f"High manipulation bias ({features.get('manipulation_bias', 0):.2f})",
            f"Strong profit seeking ({features.get('profit_seeking_score', 0):.2f})",
            f"Aggressive risk acceleration ({features.get('risk_acceleration', 0):.2f})",
            f"High aggression index ({features.get('aggression_index', 0):.2f})"
        ],
        'OPPORTUNIST': [
            f"High opportunistic index ({features.get('opportunistic_index', 0):.2f})",
            f"Rapid activity velocity ({features.get('activity_velocity', 0):.2f})",
            f"High burstiness ({features.get('burstiness_index', 0):.2f})",
            f"Strong value momentum ({features.get('value_momentum', 0):.2f})"
        ],
        'COORDINATED_ACTOR': [
            f"Strong coordination signal ({features.get('coordination_signal', 0):.2f})",
            f"High temporal clustering ({features.get('temporal_clustering', 0):.2f})",
            f"Pattern regularity ({features.get('pattern_regularity', 0):.2f})",
            f"Network effect present ({features.get('network_effect', 0):.2f})"
        ],
        'GHOST': [
            f"High stealth factor ({features.get('stealth_factor', 0):.2f})",
            f"Strong identity stability ({features.get('identity_stability', 0):.2f})",
            f"Low activity density ({features.get('activity_density', 0):.2f})",
            f"Stealth mode active ({features.get('stealth_mode', 0):.2f})"
        ],
        'AGENT': [
            f"High bot-like score ({features.get('bot_like_score', 0):.2f})",
            f"Strong coordination signal ({features.get('coordination_signal', 0):.2f})",
            f"Pattern regularity ({features.get('pattern_regularity', 0):.2f})",
            f"High predictability ({features.get('predictability_score', 0):.2f})"
        ],
        'MANIPULATOR': [
            f"High manipulation signal ({features.get('manipulation_signal', 0):.2f})",
            f"Frequent anomalies ({features.get('anomaly_frequency', 0):.2f})",
            f"High volatility ({features.get('volatility_score', 0):.2f})",
            f"Value concentration ({features.get('value_concentration', 0):.2f})"
        ]
    }
    
    return signals.get(archetype, ['Unknown archetype'])[:5]


def _get_supporting_features(archetype: str, features: Dict[str, float]) -> Dict[str, float]:
    """Get supporting features for the given archetype."""
    feature_sets = {
        'PREDATOR': ['manipulation_bias', 'profit_seeking_score', 'risk_acceleration', 'aggression_index', 'value_momentum'],
        'OPPORTUNIST': ['opportunistic_index', 'activity_velocity', 'burstiness_index', 'value_momentum', 'stress_reactivity'],
        'COORDINATED_ACTOR': ['coordination_signal', 'temporal_clustering', 'pattern_regularity', 'network_effect', 'bot_like_score'],
        'GHOST': ['stealth_factor', 'identity_stability', 'stealth_mode', 'ghost_score', 'sophistication_level'],
        'AGENT': ['bot_like_score', 'coordination_signal', 'pattern_regularity', 'predictability_score', 'agent_score'],
        'MANIPULATOR': ['manipulation_signal', 'anomaly_frequency', 'volatility_score', 'value_concentration', 'manipulation_bias']
    }
    
    feature_list = feature_sets.get(archetype, [])
    return {k: features.get(k, 0.0) for k in feature_list}


def generate_dna_code(features: Dict[str, float], archetype: str) -> str:
    """
    Generate Behavioral DNA code.
    
    Format: Q7-AX4-ARCHETYPE
    - First block: Stability cluster (Q1-Q9)
    - Second block: Signature hash fragment
    - Third block: Archetype name
    
    Args:
        features: Dictionary of behavioral features
        archetype: Classified archetype name
        
    Returns:
        DNA code string
    """
    try:
        print("[BehavioralDNA] Generating DNA code...")
        
        stability = features.get('stability_index', 0.5)
        cluster = int(stability * 9) + 1
        cluster = max(1, min(9, cluster))
        
        key_features = [
            features.get('activity_velocity', 0),
            features.get('chain_diversity', 0),
            features.get('volatility_score', 0),
            features.get('manipulation_bias', 0)
        ]
        
        hash_val = sum(int(f * 1000) for f in key_features) % 1296  # 36^2
        hash_chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        hash_fragment = hash_chars[hash_val // 36] + hash_chars[hash_val % 36]
        
        hash_val2 = int(features.get('complexity_score', 0) * 36)
        hash_fragment += hash_chars[hash_val2 % 36]
        
        dna_code = f"Q{cluster}-{hash_fragment}-{archetype}"
        
        print(f"[BehavioralDNA] Generated DNA code: {dna_code}")
        return dna_code
        
    except Exception as e:
        print(f"[BehavioralDNA] Error generating DNA code: {e}")
        return f"Q5-XXX-{archetype}"
