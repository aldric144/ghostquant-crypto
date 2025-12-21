"use client";

import { useEffect, useRef, useCallback } from "react";

interface NetworkNode {
  id: string;
  label: string;
  type: string;
  riskScore?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface NetworkEdge {
  source: string;
  target: string;
  type: string;
  weight?: number;
}

interface EntityNetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export default function EntityNetworkGraph({ nodes, edges }: EntityNetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const nodesRef = useRef<NetworkNode[]>([]);

  const getNodeColor = (type: string, riskScore?: number) => {
    if (type === "target") return "#06b6d4"; // cyan
    if (type === "manipulation") return "#ef4444"; // red
    if (type === "whale") return "#8b5cf6"; // purple
    if (type === "darkpool") return "#f59e0b"; // amber
    if (riskScore && riskScore >= 0.8) return "#ef4444";
    if (riskScore && riskScore >= 0.5) return "#eab308";
    return "#22c55e"; // green
  };

  const getEdgeColor = (type: string) => {
    if (type === "manipulation") return "rgba(239, 68, 68, 0.5)";
    if (type === "whale") return "rgba(139, 92, 246, 0.5)";
    if (type === "darkpool") return "rgba(245, 158, 11, 0.5)";
    return "rgba(100, 116, 139, 0.5)";
  };

  const initializeNodes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    nodesRef.current = nodes.map((node, index) => {
      if (node.type === "target") {
        return { ...node, x: centerX, y: centerY, vx: 0, vy: 0 };
      }

      const angle = (index / (nodes.length - 1)) * Math.PI * 2;
      const distance = radius * (0.6 + Math.random() * 0.4);

      return {
        ...node,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
      };
    });
  }, [nodes]);

  const applyForces = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const damping = 0.9;
    const repulsion = 5000;
    const attraction = 0.01;
    const centerForce = 0.005;

    nodesRef.current.forEach((node) => {
      if (node.type === "target") return;

      // Repulsion from other nodes
      nodesRef.current.forEach((other) => {
        if (node.id === other.id) return;

        const dx = (node.x || 0) - (other.x || 0);
        const dy = (node.y || 0) - (other.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (distance * distance);

        node.vx = (node.vx || 0) + (dx / distance) * force;
        node.vy = (node.vy || 0) + (dy / distance) * force;
      });

      // Attraction to connected nodes
      edges.forEach((edge) => {
        let other: NetworkNode | undefined;
        if (edge.source === node.id) {
          other = nodesRef.current.find((n) => n.id === edge.target);
        } else if (edge.target === node.id) {
          other = nodesRef.current.find((n) => n.id === edge.source);
        }

        if (other) {
          const dx = (other.x || 0) - (node.x || 0);
          const dy = (other.y || 0) - (node.y || 0);
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          node.vx = (node.vx || 0) + dx * attraction;
          node.vy = (node.vy || 0) + dy * attraction;
        }
      });

      // Center gravity
      const dx = centerX - (node.x || 0);
      const dy = centerY - (node.y || 0);
      node.vx = (node.vx || 0) + dx * centerForce;
      node.vy = (node.vy || 0) + dy * centerForce;

      // Apply velocity with damping
      node.vx = (node.vx || 0) * damping;
      node.vy = (node.vy || 0) * damping;
      node.x = (node.x || 0) + (node.vx || 0);
      node.y = (node.y || 0) + (node.vy || 0);

      // Boundary constraints
      const padding = 50;
      node.x = Math.max(padding, Math.min(canvas.width - padding, node.x || 0));
      node.y = Math.max(padding, Math.min(canvas.height - padding, node.y || 0));
    });
  }, [edges]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = "rgba(15, 23, 42, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(51, 65, 85, 0.3)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw edges
    edges.forEach((edge) => {
      const sourceNode = nodesRef.current.find((n) => n.id === edge.source);
      const targetNode = nodesRef.current.find((n) => n.id === edge.target);

      if (sourceNode && targetNode && sourceNode.x && sourceNode.y && targetNode.x && targetNode.y) {
        ctx.beginPath();
        ctx.strokeStyle = getEdgeColor(edge.type);
        ctx.lineWidth = (edge.weight || 0.5) * 3;
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
        const arrowLength = 10;
        const arrowX = targetNode.x - Math.cos(angle) * 25;
        const arrowY = targetNode.y - Math.sin(angle) * 25;

        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
          arrowY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
          arrowY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = getEdgeColor(edge.type);
        ctx.fill();
      }
    });

    // Draw nodes
    nodesRef.current.forEach((node) => {
      if (!node.x || !node.y) return;

      const color = getNodeColor(node.type, node.riskScore);
      const radius = node.type === "target" ? 30 : 20;

      // Glow effect
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color.replace(")", ", 0.3)").replace("rgb", "rgba"));
      gradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node label
      ctx.fillStyle = "#ffffff";
      ctx.font = node.type === "target" ? "bold 12px sans-serif" : "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, node.x, node.y + radius + 15);

      // Risk score badge
      if (node.riskScore !== undefined && node.type !== "target") {
        const badgeX = node.x + radius * 0.7;
        const badgeY = node.y - radius * 0.7;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, 10, 0, Math.PI * 2);
        ctx.fillStyle = node.riskScore >= 0.8 ? "#ef4444" : node.riskScore >= 0.5 ? "#eab308" : "#22c55e";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 8px sans-serif";
        ctx.fillText(Math.round(node.riskScore * 100).toString(), badgeX, badgeY);
      }
    });

    // Apply forces and continue animation
    applyForces();
    animationRef.current = requestAnimationFrame(render);
  }, [edges, applyForces]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        initializeNodes();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeNodes]);

  useEffect(() => {
    initializeNodes();
    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, edges, initializeNodes, render]);

  if (nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <p>No network connections found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: "400px" }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 rounded-lg p-3 border border-slate-700">
        <div className="text-xs text-gray-500 mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span className="text-xs text-gray-400">Target Entity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-400">Manipulation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-400">Whale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-gray-400">Darkpool</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 bg-slate-900/90 rounded-lg p-3 border border-slate-700">
        <div className="text-xs text-gray-500 mb-2">Network Stats</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-xs text-gray-400">Nodes:</span>
          <span className="text-xs text-white">{nodes.length}</span>
          <span className="text-xs text-gray-400">Edges:</span>
          <span className="text-xs text-white">{edges.length}</span>
        </div>
      </div>
    </div>
  );
}
