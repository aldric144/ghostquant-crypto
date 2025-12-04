/**
 * Constellation Engine - Visual Model Builder
 * Transforms constellation data into renderable 3D visualization
 */

import type { ConstellationNode, ConstellationEdge } from './globalConstellationClient';

interface NormalizedNode extends ConstellationNode {
  normalizedX: number;
  normalizedY: number;
  normalizedZ: number;
}

interface Supernova {
  node: ConstellationNode;
  intensity: number;
  pulseSpeed: number;
}

interface Wormhole {
  edge: ConstellationEdge;
  flow: number;
  color: string;
}

interface Galaxy {
  id: string;
  nodes: ConstellationNode[];
  center: { x: number; y: number; z: number };
  radius: number;
  risk: number;
}

interface Starfield {
  stars: Array<{ x: number; y: number; z: number; brightness: number }>;
  count: number;
}

interface ConstellationVisual {
  nodes: NormalizedNode[];
  edges: ConstellationEdge[];
  supernovas: Supernova[];
  wormholes: Wormhole[];
  galaxies: Galaxy[];
  starfield: Starfield;
}

export class ConstellationEngine {
  /**
   * Normalize coordinates to viewport range
   * Converts backend coordinates [-100, 100] to viewport coordinates
   */
  static normalizeCoordinates(
    nodes: ConstellationNode[],
    viewportWidth: number = 800,
    viewportHeight: number = 600
  ): NormalizedNode[] {
    if (!nodes || nodes.length === 0) {
      return [];
    }

    try {
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;

      for (const node of nodes) {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
        minZ = Math.min(minZ, node.z);
        maxZ = Math.max(maxZ, node.z);
      }

      const rangeX = maxX - minX || 1;
      const rangeY = maxY - minY || 1;
      const rangeZ = maxZ - minZ || 1;

      const normalized: NormalizedNode[] = nodes.map(node => {
        const normalizedX = ((node.x - minX) / rangeX) * viewportWidth;
        const normalizedY = ((node.y - minY) / rangeY) * viewportHeight;
        const normalizedZ = ((node.z - minZ) / rangeZ) * 200 - 100; // Keep z in [-100, 100]

        return {
          ...node,
          normalizedX,
          normalizedY,
          normalizedZ,
        };
      });

      return normalized;
    } catch (error) {
      console.error('[ConstellationEngine] Error normalizing coordinates:', error);
      return nodes.map(node => ({
        ...node,
        normalizedX: 0,
        normalizedY: 0,
        normalizedZ: 0,
      }));
    }
  }

  /**
   * Compute risk color from risk level
   * Red (high) → Yellow (medium) → Green (low)
   */
  static computeRiskColor(riskLevel: number): string {
    try {
      if (riskLevel >= 0.80) {
        return '#ff0000'; // Bright red (critical)
      } else if (riskLevel >= 0.65) {
        return '#ff4444'; // Red (high)
      } else if (riskLevel >= 0.50) {
        return '#ff8800'; // Orange (elevated)
      } else if (riskLevel >= 0.35) {
        return '#ffcc00'; // Yellow (moderate)
      } else if (riskLevel >= 0.20) {
        return '#88ff88'; // Light green (low)
      } else {
        return '#00ff00'; // Green (minimal)
      }
    } catch (error) {
      return '#ffffff';
    }
  }

  /**
   * Compute node size based on type and risk level
   */
  static computeNodeSize(type: string, riskLevel: number): number {
    try {
      const baseSizes: Record<string, number> = {
        hydra_head: 12,
        cluster: 10,
        entity: 6,
        token: 5,
        chain: 4,
      };

      const baseSize = baseSizes[type] || 6;

      const riskMultiplier = 1.0 + riskLevel;

      return baseSize * riskMultiplier;
    } catch (error) {
      return 6;
    }
  }

  /**
   * Generate background starfield
   * Creates ambient stars for visual depth
   */
  static generateStarfield(nodes: ConstellationNode[], count: number = 200): Starfield {
    try {
      const stars: Array<{ x: number; y: number; z: number; brightness: number }> = [];

      const seed = nodes.length > 0 ? nodes[0].id : 'default';
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash = hash & hash;
      }

      for (let i = 0; i < count; i++) {
        const x = ((hash + i * 7919) % 1000) - 500;
        const y = ((hash + i * 7927) % 1000) - 500;
        const z = ((hash + i * 7933) % 1000) - 500;
        const brightness = ((hash + i * 7937) % 100) / 100;

        stars.push({ x, y, z, brightness });
      }

      return { stars, count };
    } catch (error) {
      console.error('[ConstellationEngine] Error generating starfield:', error);
      return { stars: [], count: 0 };
    }
  }

  /**
   * Generate constellation lines from edges
   * Creates visual connections between nodes
   */
  static generateConstellations(edges: ConstellationEdge[]): ConstellationEdge[] {
    try {
      return edges.filter(edge => edge.strength > 0.3).map(edge => ({
        ...edge,
        color: edge.color || this.computeEdgeColor(edge.strength),
      }));
    } catch (error) {
      console.error('[ConstellationEngine] Error generating constellations:', error);
      return [];
    }
  }

  /**
   * Detect supernova nodes (high-risk entities)
   * Critical nodes requiring immediate attention
   */
  static detectSupernovas(nodes: ConstellationNode[]): Supernova[] {
    try {
      const supernovas: Supernova[] = [];

      for (const node of nodes) {
        if (node.risk_level >= 0.70) {
          const intensity = node.risk_level;
          const pulseSpeed = 1.0 + (node.risk_level - 0.70) * 2.0; // Faster pulse for higher risk

          supernovas.push({
            node,
            intensity,
            pulseSpeed,
          });
        }
      }

      return supernovas;
    } catch (error) {
      console.error('[ConstellationEngine] Error detecting supernovas:', error);
      return [];
    }
  }

  /**
   * Detect wormholes (strong relay connections)
   * High-strength edges representing critical links
   */
  static detectWormholes(edges: ConstellationEdge[]): Wormhole[] {
    try {
      const wormholes: Wormhole[] = [];

      for (const edge of edges) {
        if (edge.strength >= 0.70) {
          const flow = edge.strength;
          const color = edge.color || this.computeEdgeColor(edge.strength);

          wormholes.push({
            edge,
            flow,
            color,
          });
        }
      }

      return wormholes;
    } catch (error) {
      console.error('[ConstellationEngine] Error detecting wormholes:', error);
      return [];
    }
  }

  /**
   * Detect galaxies (coordinated clusters)
   * Groups of connected nodes forming clusters
   */
  static detectGalaxies(nodes: ConstellationNode[], edges: ConstellationEdge[]): Galaxy[] {
    try {
      const galaxies: Galaxy[] = [];

      const clusterNodes = nodes.filter(node => node.type === 'cluster');

      for (const clusterNode of clusterNodes) {
        const connectedNodeIds = new Set<string>();
        connectedNodeIds.add(clusterNode.id);

        for (const edge of edges) {
          if (edge.source_id === clusterNode.id) {
            connectedNodeIds.add(edge.target_id);
          } else if (edge.target_id === clusterNode.id) {
            connectedNodeIds.add(edge.source_id);
          }
        }

        const galaxyNodes = nodes.filter(node => connectedNodeIds.has(node.id));

        if (galaxyNodes.length > 1) {
          let sumX = 0, sumY = 0, sumZ = 0;
          for (const node of galaxyNodes) {
            sumX += node.x;
            sumY += node.y;
            sumZ += node.z;
          }
          const center = {
            x: sumX / galaxyNodes.length,
            y: sumY / galaxyNodes.length,
            z: sumZ / galaxyNodes.length,
          };

          let maxRadius = 0;
          for (const node of galaxyNodes) {
            const dx = node.x - center.x;
            const dy = node.y - center.y;
            const dz = node.z - center.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            maxRadius = Math.max(maxRadius, distance);
          }

          const avgRisk = galaxyNodes.reduce((sum, node) => sum + node.risk_level, 0) / galaxyNodes.length;

          galaxies.push({
            id: clusterNode.id,
            nodes: galaxyNodes,
            center,
            radius: maxRadius,
            risk: avgRisk,
          });
        }
      }

      return galaxies;
    } catch (error) {
      console.error('[ConstellationEngine] Error detecting galaxies:', error);
      return [];
    }
  }

  /**
   * Build complete constellation visual model
   * Combines all visual elements for rendering
   */
  static buildVisualModel(
    nodes: ConstellationNode[],
    edges: ConstellationEdge[],
    viewportWidth: number = 800,
    viewportHeight: number = 600
  ): ConstellationVisual {
    try {
      const normalizedNodes = this.normalizeCoordinates(nodes, viewportWidth, viewportHeight);

      const supernovas = this.detectSupernovas(nodes);
      const wormholes = this.detectWormholes(edges);
      const galaxies = this.detectGalaxies(nodes, edges);
      const starfield = this.generateStarfield(nodes);
      const constellations = this.generateConstellations(edges);

      return {
        nodes: normalizedNodes,
        edges: constellations,
        supernovas,
        wormholes,
        galaxies,
        starfield,
      };
    } catch (error) {
      console.error('[ConstellationEngine] Error building visual model:', error);
      return {
        nodes: [],
        edges: [],
        supernovas: [],
        wormholes: [],
        galaxies: [],
        starfield: { stars: [], count: 0 },
      };
    }
  }

  /**
   * Helper: Compute edge color based on strength
   */
  private static computeEdgeColor(strength: number): string {
    try {
      if (strength >= 0.80) {
        return '#ff0000'; // Red (strong)
      } else if (strength >= 0.60) {
        return '#ff8800'; // Orange
      } else if (strength >= 0.40) {
        return '#ffcc00'; // Yellow
      } else {
        return '#88ccff'; // Light blue (weak)
      }
    } catch (error) {
      return '#ffffff';
    }
  }
}

export type {
  NormalizedNode,
  Supernova,
  Wormhole,
  Galaxy,
  Starfield,
  ConstellationVisual,
};
