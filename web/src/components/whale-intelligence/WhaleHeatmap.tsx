"use client";

import { useRef, useEffect, memo, useState } from "react";
import type { WhaleData } from "./index";

interface WhaleHeatmapProps {
  whales: WhaleData[];
}

interface HeatmapNode {
  x: number;
  y: number;
  radius: number;
  whale: WhaleData;
  vx: number;
  vy: number;
}

function WhaleHeatmap({ whales }: WhaleHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredWhale, setHoveredWhale] = useState<WhaleData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const nodesRef = useRef<HeatmapNode[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    // Initialize nodes
    const maxVolume = Math.max(...whales.map((w) => w.volume));
    nodesRef.current = whales.map((whale) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 20 + (whale.volume / maxVolume) * 40,
      whale,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodesRef.current.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x - node.radius < 0 || node.x + node.radius > canvas.width) {
          node.vx *= -1;
          node.x = Math.max(node.radius, Math.min(canvas.width - node.radius, node.x));
        }
        if (node.y - node.radius < 0 || node.y + node.radius > canvas.height) {
          node.vy *= -1;
          node.y = Math.max(node.radius, Math.min(canvas.height - node.radius, node.y));
        }

        // Draw connections to nearby nodes
        nodesRef.current.slice(i + 1).forEach((other) => {
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.3 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });

        // Draw node glow
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius * 1.5
        );
        
        const riskColor = node.whale.risk === "high" 
          ? "239, 68, 68" 
          : node.whale.risk === "medium" 
          ? "234, 179, 8" 
          : "34, 197, 94";
        
        gradient.addColorStop(0, `rgba(${riskColor}, 0.8)`);
        gradient.addColorStop(0.5, `rgba(${riskColor}, 0.3)`);
        gradient.addColorStop(1, `rgba(${riskColor}, 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(node.x, node.y, node.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw node
        ctx.beginPath();
        ctx.fillStyle = node.whale.risk === "high" 
          ? "#ef4444" 
          : node.whale.risk === "medium" 
          ? "#eab308" 
          : "#22c55e";
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw border
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw influence score
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.whale.influenceScore.toFixed(0), node.x, node.y);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [whales]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x: e.clientX, y: e.clientY });

    // Check if hovering over a node
    const hoveredNode = nodesRef.current.find((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    setHoveredWhale(hoveredNode?.whale || null);
  };

  const formatVolume = (vol: number): string => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`;
    return `$${vol.toFixed(2)}`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Whale Influence Heatmap</h3>
          <p className="text-sm text-gray-500">Top 20 whales by volume and influence</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-400">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-400">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-400">Low Risk</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="relative h-[500px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredWhale(null)}
          className="w-full h-full cursor-crosshair"
        />

        {/* Tooltip */}
        {hoveredWhale && (
          <div
            className="fixed z-50 bg-slate-800 border border-cyan-500/30 rounded-lg p-3 shadow-xl pointer-events-none"
            style={{
              left: mousePos.x + 15,
              top: mousePos.y + 15,
            }}
          >
            <div className="text-cyan-400 font-mono text-sm mb-1">
              {hoveredWhale.address}
            </div>
            {hoveredWhale.label && (
              <div className="text-gray-400 text-xs mb-2">{hoveredWhale.label}</div>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-gray-500">Volume:</span>
              <span className="text-green-400">{formatVolume(hoveredWhale.volume)}</span>
              <span className="text-gray-500">Influence:</span>
              <span className="text-cyan-400">{hoveredWhale.influenceScore.toFixed(1)}</span>
              <span className="text-gray-500">Chain:</span>
              <span className="text-white">{hoveredWhale.chain}</span>
              <span className="text-gray-500">Risk:</span>
              <span
                className={
                  hoveredWhale.risk === "high"
                    ? "text-red-400"
                    : hoveredWhale.risk === "medium"
                    ? "text-yellow-400"
                    : "text-green-400"
                }
              >
                {hoveredWhale.risk.toUpperCase()}
              </span>
            </div>
            {hoveredWhale.exchanges && hoveredWhale.exchanges.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-700">
                <span className="text-gray-500 text-xs">Exchanges: </span>
                <span className="text-white text-xs">{hoveredWhale.exchanges.join(", ")}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(WhaleHeatmap);
