"""
Correlation Statistics - Computes statistical metrics for correlation analysis.
"""

from typing import Dict, List, Any, Tuple


class CorrelationStats:
    """
    Computes statistical metrics for pair-level, group-level, and cluster-level correlations.
    Provides risk classification and synchronized behavior ratings.
    """
    
    def __init__(self):
        """Initialize the Correlation Stats module."""
        try:
            print("[CorrelationStats] Initializing")
            print("[CorrelationStats] Initialized successfully")
        except Exception as e:
            print(f"[CorrelationStats] Error in __init__: {e}")
    
    def compute_pair_stats(self, correlation_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compute statistics for pair-level correlation.
        
        Args:
            correlation_result: Result from compute_pair_correlation()
            
        Returns:
            Dictionary with pair statistics
        """
        try:
            print("[CorrelationStats] Computing pair statistics")
            
            if not correlation_result.get('success', False):
                return {
                    'success': False,
                    'error': 'Invalid correlation result'
                }
            
            score = correlation_result['correlation_score']
            components = correlation_result.get('components', {})
            
            normalized_score = score
            
            risk_level = self._classify_risk(score)
            
            sync_rating = self._rate_synchronization(score, components)
            
            coord_probability = self._estimate_coordination_probability(score, components)
            
            component_analysis = self._analyze_components(components)
            
            stats = {
                'success': True,
                'normalized_score': normalized_score,
                'risk_level': risk_level,
                'synchronized_behavior_rating': sync_rating,
                'coordinated_actor_probability': coord_probability,
                'component_analysis': component_analysis,
                'interpretation': self._interpret_pair_correlation(score, risk_level, sync_rating)
            }
            
            print(f"[CorrelationStats] Pair stats: risk={risk_level}, sync={sync_rating}")
            return stats
            
        except Exception as e:
            print(f"[CorrelationStats] Error computing pair stats: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def compute_group_stats(self, group_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compute statistics for group-level correlation.
        
        Args:
            group_result: Result from compute_group_correlation()
            
        Returns:
            Dictionary with group statistics
        """
        try:
            print("[CorrelationStats] Computing group statistics")
            
            if not group_result.get('success', False):
                return {
                    'success': False,
                    'error': 'Invalid group result'
                }
            
            avg_score = group_result['avg_correlation']
            max_score = group_result['max_correlation']
            min_score = group_result['min_correlation']
            group_size = group_result['group_size']
            
            normalized_avg = avg_score
            normalized_max = max_score
            normalized_min = min_score
            
            risk_level = self._classify_risk(avg_score)
            
            cohesion = self._compute_cohesion(avg_score, max_score, min_score)
            
            sync_rating = self._rate_group_synchronization(avg_score, cohesion, group_size)
            
            coord_probability = self._estimate_group_coordination_probability(
                avg_score, cohesion, group_size
            )
            
            cluster_risk = self._classify_cluster_risk(avg_score, group_size, cohesion)
            
            stats = {
                'success': True,
                'normalized_avg_score': normalized_avg,
                'normalized_max_score': normalized_max,
                'normalized_min_score': normalized_min,
                'risk_level': risk_level,
                'cohesion_score': cohesion,
                'synchronized_behavior_rating': sync_rating,
                'coordinated_actor_probability': coord_probability,
                'cluster_risk_classification': cluster_risk,
                'group_size': group_size,
                'interpretation': self._interpret_group_correlation(
                    avg_score, risk_level, sync_rating, group_size
                )
            }
            
            print(f"[CorrelationStats] Group stats: risk={risk_level}, cohesion={cohesion:.3f}")
            return stats
            
        except Exception as e:
            print(f"[CorrelationStats] Error computing group stats: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def compute_cluster_stats(self, clusters: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compute statistics for cluster-level analysis.
        
        Args:
            clusters: List of cluster dictionaries
            
        Returns:
            Dictionary with cluster statistics
        """
        try:
            print(f"[CorrelationStats] Computing cluster statistics for {len(clusters)} clusters")
            
            if not clusters:
                return {
                    'success': True,
                    'cluster_count': 0,
                    'message': 'No clusters to analyze'
                }
            
            total_members = sum(c.get('size', 0) for c in clusters)
            avg_cluster_size = total_members / len(clusters) if clusters else 0
            
            correlations = [c.get('avg_correlation', 0) for c in clusters]
            avg_correlation = sum(correlations) / len(correlations) if correlations else 0
            max_correlation = max(correlations) if correlations else 0
            min_correlation = min(correlations) if correlations else 0
            
            risk_distribution = self._compute_risk_distribution(clusters)
            
            cluster_summaries = []
            for cluster in clusters:
                summary = self._summarize_cluster(cluster)
                cluster_summaries.append(summary)
            
            cluster_summaries.sort(
                key=lambda x: (x['risk_priority'], -x['avg_correlation']),
                reverse=True
            )
            
            stats = {
                'success': True,
                'cluster_count': len(clusters),
                'total_members': total_members,
                'avg_cluster_size': avg_cluster_size,
                'avg_correlation': avg_correlation,
                'max_correlation': max_correlation,
                'min_correlation': min_correlation,
                'risk_distribution': risk_distribution,
                'cluster_summaries': cluster_summaries,
                'interpretation': self._interpret_cluster_analysis(
                    len(clusters), avg_correlation, risk_distribution
                )
            }
            
            print(f"[CorrelationStats] Cluster stats: {len(clusters)} clusters, avg_corr={avg_correlation:.3f}")
            return stats
            
        except Exception as e:
            print(f"[CorrelationStats] Error computing cluster stats: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    
    def _classify_risk(self, score: float) -> str:
        """Classify risk level based on correlation score."""
        if score >= 0.85:
            return 'CRITICAL'
        elif score >= 0.70:
            return 'HIGH'
        elif score >= 0.55:
            return 'MEDIUM'
        elif score >= 0.40:
            return 'LOW'
        else:
            return 'MINIMAL'
    
    def _rate_synchronization(self, score: float, components: Dict[str, float]) -> str:
        """Rate synchronized behavior."""
        timing = components.get('timing_similarity', 0)
        burst = components.get('burst_pattern_match', 0)
        
        sync_score = (score + timing + burst) / 3.0
        
        if sync_score >= 0.80:
            return 'HIGHLY_SYNCHRONIZED'
        elif sync_score >= 0.65:
            return 'SYNCHRONIZED'
        elif sync_score >= 0.50:
            return 'PARTIALLY_SYNCHRONIZED'
        else:
            return 'UNSYNCHRONIZED'
    
    def _estimate_coordination_probability(self, score: float, components: Dict[str, float]) -> float:
        """Estimate probability of coordinated behavior."""
        timing = components.get('timing_similarity', 0)
        burst = components.get('burst_pattern_match', 0)
        
        coord_score = (
            score * 0.4 +
            timing * 0.3 +
            burst * 0.3
        )
        
        return min(1.0, max(0.0, coord_score))
    
    def _analyze_components(self, components: Dict[str, float]) -> Dict[str, str]:
        """Analyze individual correlation components."""
        analysis = {}
        
        for component, value in components.items():
            if value >= 0.80:
                level = 'VERY_HIGH'
            elif value >= 0.65:
                level = 'HIGH'
            elif value >= 0.50:
                level = 'MODERATE'
            elif value >= 0.35:
                level = 'LOW'
            else:
                level = 'VERY_LOW'
            
            analysis[component] = level
        
        return analysis
    
    def _interpret_pair_correlation(self, score: float, risk_level: str, sync_rating: str) -> str:
        """Generate interpretation text for pair correlation."""
        if score >= 0.80:
            return f"Extremely high correlation ({score:.3f}). {risk_level} risk. {sync_rating} behavior detected. Strong evidence of coordinated activity."
        elif score >= 0.65:
            return f"High correlation ({score:.3f}). {risk_level} risk. {sync_rating} behavior. Likely coordinated actors."
        elif score >= 0.50:
            return f"Moderate correlation ({score:.3f}). {risk_level} risk. {sync_rating} behavior. Possible coordination."
        else:
            return f"Low correlation ({score:.3f}). {risk_level} risk. {sync_rating} behavior. Minimal coordination evidence."
    
    def _compute_cohesion(self, avg: float, max_val: float, min_val: float) -> float:
        """Compute group cohesion score."""
        if max_val == min_val:
            return 1.0
        
        variance = max_val - min_val
        cohesion = 1.0 - min(variance, 1.0)
        
        return max(0.0, min(1.0, cohesion))
    
    def _rate_group_synchronization(self, avg_score: float, cohesion: float, group_size: int) -> str:
        """Rate group synchronized behavior."""
        size_factor = min(group_size / 10.0, 1.0)
        sync_score = (avg_score + cohesion + size_factor) / 3.0
        
        if sync_score >= 0.80:
            return 'HIGHLY_SYNCHRONIZED_GROUP'
        elif sync_score >= 0.65:
            return 'SYNCHRONIZED_GROUP'
        elif sync_score >= 0.50:
            return 'PARTIALLY_SYNCHRONIZED_GROUP'
        else:
            return 'LOOSELY_COORDINATED_GROUP'
    
    def _estimate_group_coordination_probability(self, avg_score: float, cohesion: float, group_size: int) -> float:
        """Estimate probability of group coordination."""
        size_factor = min(group_size / 10.0, 1.0)
        
        coord_probability = (
            avg_score * 0.5 +
            cohesion * 0.3 +
            size_factor * 0.2
        )
        
        return min(1.0, max(0.0, coord_probability))
    
    def _classify_cluster_risk(self, avg_score: float, group_size: int, cohesion: float) -> str:
        """Classify cluster risk level."""
        risk_score = (
            avg_score * 0.5 +
            min(group_size / 20.0, 1.0) * 0.3 +
            cohesion * 0.2
        )
        
        if risk_score >= 0.80:
            return 'CRITICAL_THREAT'
        elif risk_score >= 0.65:
            return 'HIGH_RISK'
        elif risk_score >= 0.50:
            return 'MEDIUM_RISK'
        elif risk_score >= 0.35:
            return 'LOW_RISK'
        else:
            return 'MINIMAL_RISK'
    
    def _interpret_group_correlation(self, avg_score: float, risk_level: str, sync_rating: str, group_size: int) -> str:
        """Generate interpretation text for group correlation."""
        if avg_score >= 0.80:
            return f"Extremely high group correlation ({avg_score:.3f}) among {group_size} entities. {risk_level} risk. {sync_rating}. Strong evidence of coordinated swarm behavior."
        elif avg_score >= 0.65:
            return f"High group correlation ({avg_score:.3f}) among {group_size} entities. {risk_level} risk. {sync_rating}. Likely coordinated actor network."
        elif avg_score >= 0.50:
            return f"Moderate group correlation ({avg_score:.3f}) among {group_size} entities. {risk_level} risk. {sync_rating}. Possible coordination."
        else:
            return f"Low group correlation ({avg_score:.3f}) among {group_size} entities. {risk_level} risk. {sync_rating}. Minimal coordination evidence."
    
    def _compute_risk_distribution(self, clusters: List[Dict[str, Any]]) -> Dict[str, int]:
        """Compute distribution of risk levels across clusters."""
        distribution = {
            'CRITICAL': 0,
            'HIGH': 0,
            'MEDIUM': 0,
            'LOW': 0,
            'MINIMAL': 0
        }
        
        for cluster in clusters:
            risk_level = cluster.get('risk_level', 'MINIMAL')
            if risk_level in distribution:
                distribution[risk_level] += 1
        
        return distribution
    
    def _summarize_cluster(self, cluster: Dict[str, Any]) -> Dict[str, Any]:
        """Summarize a single cluster."""
        size = cluster.get('size', 0)
        avg_correlation = cluster.get('avg_correlation', 0)
        risk_level = cluster.get('risk_level', 'MINIMAL')
        
        risk_priorities = {
            'CRITICAL': 5,
            'HIGH': 4,
            'MEDIUM': 3,
            'LOW': 2,
            'MINIMAL': 1
        }
        
        summary = {
            'cluster_id': cluster.get('cluster_id', 'unknown'),
            'size': size,
            'avg_correlation': avg_correlation,
            'risk_level': risk_level,
            'risk_priority': risk_priorities.get(risk_level, 0),
            'coordinated_flag': cluster.get('coordinated_flag', False),
            'members': cluster.get('members', [])
        }
        
        return summary
    
    def _interpret_cluster_analysis(self, cluster_count: int, avg_correlation: float, risk_distribution: Dict[str, int]) -> str:
        """Generate interpretation text for cluster analysis."""
        critical_count = risk_distribution.get('CRITICAL', 0)
        high_count = risk_distribution.get('HIGH', 0)
        
        if critical_count > 0:
            return f"Detected {cluster_count} clusters with {critical_count} CRITICAL risk clusters. Average correlation: {avg_correlation:.3f}. Immediate investigation recommended."
        elif high_count > 0:
            return f"Detected {cluster_count} clusters with {high_count} HIGH risk clusters. Average correlation: {avg_correlation:.3f}. Investigation recommended."
        elif cluster_count > 0:
            return f"Detected {cluster_count} clusters. Average correlation: {avg_correlation:.3f}. Monitoring recommended."
        else:
            return "No significant clusters detected."
