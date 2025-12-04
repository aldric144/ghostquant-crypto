"""
Correlation Graph Builder - Builds and analyzes correlation graphs for entity networks.
"""

from typing import Dict, List, Any, Set, Tuple


class CorrelationGraphBuilder:
    """
    Builds and analyzes correlation graphs from entity correlation matrices.
    Provides graph metrics and cluster analysis.
    """
    
    def __init__(self):
        """Initialize the Correlation Graph Builder."""
        try:
            print("[CorrelationGraphBuilder] Initializing")
            self.threshold = 0.45  # Minimum correlation for edge creation
            print("[CorrelationGraphBuilder] Initialized successfully")
        except Exception as e:
            print(f"[CorrelationGraphBuilder] Error in __init__: {e}")
    
    def build_graph(self, correlation_matrix: Dict[Tuple[str, str], float]) -> Dict[str, Any]:
        """
        Build graph from correlation matrix.
        
        Args:
            correlation_matrix: Dictionary mapping (addrA, addrB) tuples to correlation scores
            
        Returns:
            Dictionary with graph structure (adjacency list with weights)
        """
        try:
            print(f"[CorrelationGraphBuilder] Building graph from {len(correlation_matrix)} correlations")
            
            if not correlation_matrix:
                return {
                    'success': False,
                    'error': 'Empty correlation matrix'
                }
            
            nodes = set()
            for (addrA, addrB) in correlation_matrix.keys():
                nodes.add(addrA)
                nodes.add(addrB)
            
            adjacency = {node: {} for node in nodes}
            edge_count = 0
            
            for (addrA, addrB), score in correlation_matrix.items():
                if score >= self.threshold:
                    adjacency[addrA][addrB] = score
                    adjacency[addrB][addrA] = score
                    edge_count += 1
            
            graph = {
                'success': True,
                'nodes': list(nodes),
                'node_count': len(nodes),
                'adjacency': adjacency,
                'edge_count': edge_count,
                'threshold': self.threshold
            }
            
            print(f"[CorrelationGraphBuilder] Graph built: {len(nodes)} nodes, {edge_count} edges")
            return graph
            
        except Exception as e:
            print(f"[CorrelationGraphBuilder] Error building graph: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def compute_graph_metrics(self, graph: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compute graph metrics and statistics.
        
        Args:
            graph: Graph dictionary from build_graph()
            
        Returns:
            Dictionary with graph metrics
        """
        try:
            print("[CorrelationGraphBuilder] Computing graph metrics")
            
            if not graph.get('success', False):
                return {
                    'success': False,
                    'error': 'Invalid graph'
                }
            
            adjacency = graph['adjacency']
            nodes = graph['nodes']
            
            clusters = self._find_connected_components(adjacency, nodes)
            cluster_count = len(clusters)
            
            largest_cluster_size = max(len(c) for c in clusters) if clusters else 0
            
            all_weights = []
            for node, neighbors in adjacency.items():
                all_weights.extend(neighbors.values())
            
            avg_edge_weight = sum(all_weights) / len(all_weights) if all_weights else 0.0
            
            n = len(nodes)
            max_edges = n * (n - 1) / 2 if n > 1 else 1
            density = graph['edge_count'] / max_edges if max_edges > 0 else 0.0
            
            anomalous_clusters = []
            for cluster in clusters:
                if len(cluster) >= 3:
                    cluster_weights = []
                    for node in cluster:
                        cluster_weights.extend(adjacency[node].values())
                    
                    if cluster_weights:
                        avg_cluster_weight = sum(cluster_weights) / len(cluster_weights)
                        if avg_cluster_weight >= 0.70:
                            anomalous_clusters.append({
                                'members': list(cluster),
                                'size': len(cluster),
                                'avg_correlation': avg_cluster_weight
                            })
            
            metrics = {
                'success': True,
                'cluster_count': cluster_count,
                'largest_cluster_size': largest_cluster_size,
                'average_edge_weight': avg_edge_weight,
                'density_score': density,
                'anomaly_clusters': anomalous_clusters,
                'anomaly_count': len(anomalous_clusters),
                'total_nodes': len(nodes),
                'total_edges': graph['edge_count']
            }
            
            print(f"[CorrelationGraphBuilder] Metrics: {cluster_count} clusters, density {density:.3f}")
            return metrics
            
        except Exception as e:
            print(f"[CorrelationGraphBuilder] Error computing metrics: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def export_graph(self, graph: Dict[str, Any]) -> Dict[str, Any]:
        """
        Export graph in JSON-safe format with deterministic ordering.
        
        Args:
            graph: Graph dictionary from build_graph()
            
        Returns:
            JSON-serializable graph dictionary
        """
        try:
            print("[CorrelationGraphBuilder] Exporting graph")
            
            if not graph.get('success', False):
                return {
                    'success': False,
                    'error': 'Invalid graph'
                }
            
            sorted_nodes = sorted(graph['nodes'])
            
            sorted_adjacency = {}
            for node in sorted_nodes:
                neighbors = graph['adjacency'].get(node, {})
                sorted_neighbors = {k: v for k, v in sorted(neighbors.items())}
                sorted_adjacency[node] = sorted_neighbors
            
            edges = []
            seen_pairs = set()
            
            for node in sorted_nodes:
                for neighbor, weight in sorted_adjacency[node].items():
                    pair = tuple(sorted([node, neighbor]))
                    if pair not in seen_pairs:
                        edges.append({
                            'source': node,
                            'target': neighbor,
                            'weight': weight
                        })
                        seen_pairs.add(pair)
            
            exported = {
                'success': True,
                'nodes': sorted_nodes,
                'node_count': len(sorted_nodes),
                'edges': edges,
                'edge_count': len(edges),
                'adjacency': sorted_adjacency,
                'threshold': graph.get('threshold', 0.45),
                'format': 'adjacency_list_with_weights'
            }
            
            print(f"[CorrelationGraphBuilder] Graph exported: {len(sorted_nodes)} nodes, {len(edges)} edges")
            return exported
            
        except Exception as e:
            print(f"[CorrelationGraphBuilder] Error exporting graph: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def find_high_correlation_subgraphs(self, graph: Dict[str, Any], min_correlation: float = 0.70) -> List[Dict[str, Any]]:
        """
        Find subgraphs with high average correlation.
        
        Args:
            graph: Graph dictionary from build_graph()
            min_correlation: Minimum average correlation for subgraph
            
        Returns:
            List of high-correlation subgraphs
        """
        try:
            print(f"[CorrelationGraphBuilder] Finding subgraphs with correlation >= {min_correlation}")
            
            if not graph.get('success', False):
                return []
            
            adjacency = graph['adjacency']
            nodes = graph['nodes']
            
            clusters = self._find_connected_components(adjacency, nodes)
            
            high_correlation_subgraphs = []
            
            for cluster in clusters:
                if len(cluster) >= 2:
                    weights = []
                    for node in cluster:
                        for neighbor, weight in adjacency[node].items():
                            if neighbor in cluster:
                                weights.append(weight)
                    
                    if weights:
                        avg_correlation = sum(weights) / len(weights)
                        
                        if avg_correlation >= min_correlation:
                            high_correlation_subgraphs.append({
                                'members': list(cluster),
                                'size': len(cluster),
                                'avg_correlation': avg_correlation,
                                'edge_count': len(weights) // 2  # Each edge counted twice
                            })
            
            high_correlation_subgraphs.sort(key=lambda x: x['avg_correlation'], reverse=True)
            
            print(f"[CorrelationGraphBuilder] Found {len(high_correlation_subgraphs)} high-correlation subgraphs")
            return high_correlation_subgraphs
            
        except Exception as e:
            print(f"[CorrelationGraphBuilder] Error finding subgraphs: {e}")
            return []
    
    def compute_node_centrality(self, graph: Dict[str, Any]) -> Dict[str, float]:
        """
        Compute degree centrality for each node.
        
        Args:
            graph: Graph dictionary from build_graph()
            
        Returns:
            Dictionary mapping node to centrality score
        """
        try:
            print("[CorrelationGraphBuilder] Computing node centrality")
            
            if not graph.get('success', False):
                return {}
            
            adjacency = graph['adjacency']
            nodes = graph['nodes']
            
            centrality = {}
            max_degree = len(nodes) - 1 if len(nodes) > 1 else 1
            
            for node in nodes:
                degree = len(adjacency.get(node, {}))
                centrality[node] = degree / max_degree if max_degree > 0 else 0.0
            
            print(f"[CorrelationGraphBuilder] Centrality computed for {len(centrality)} nodes")
            return centrality
            
        except Exception as e:
            print(f"[CorrelationGraphBuilder] Error computing centrality: {e}")
            return {}
    
    
    def _find_connected_components(self, adjacency: Dict[str, Dict], nodes: List[str]) -> List[Set[str]]:
        """Find connected components using DFS."""
        try:
            visited = set()
            components = []
            
            for node in nodes:
                if node not in visited:
                    component = self._dfs(node, adjacency, visited)
                    if component:
                        components.append(component)
            
            return components
            
        except Exception as e:
            print(f"[CorrelationGraphBuilder] Error finding components: {e}")
            return []
    
    def _dfs(self, start: str, adjacency: Dict[str, Dict], visited: Set[str]) -> Set[str]:
        """Depth-first search to find connected component."""
        component = set()
        stack = [start]
        
        while stack:
            node = stack.pop()
            if node not in visited:
                visited.add(node)
                component.add(node)
                
                neighbors = adjacency.get(node, {}).keys()
                for neighbor in neighbors:
                    if neighbor not in visited:
                        stack.append(neighbor)
        
        return component
