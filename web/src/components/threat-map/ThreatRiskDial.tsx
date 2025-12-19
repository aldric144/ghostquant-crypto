"use client";

interface ThreatRiskDialProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export default function ThreatRiskDial({ score, label, size = "md" }: ThreatRiskDialProps) {
  const getColor = (score: number) => {
    if (score >= 80) return { stroke: "#ef4444", bg: "from-red-500/20 to-red-900/20" };
    if (score >= 60) return { stroke: "#f97316", bg: "from-orange-500/20 to-orange-900/20" };
    if (score >= 40) return { stroke: "#eab308", bg: "from-yellow-500/20 to-yellow-900/20" };
    if (score >= 20) return { stroke: "#22c55e", bg: "from-green-500/20 to-green-900/20" };
    return { stroke: "#3b82f6", bg: "from-blue-500/20 to-blue-900/20" };
  };

  const getThreatLevel = (score: number) => {
    if (score >= 80) return "CRITICAL";
    if (score >= 60) return "HIGH";
    if (score >= 40) return "MEDIUM";
    if (score >= 20) return "LOW";
    return "MINIMAL";
  };

  const colors = getColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40"
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.bg} blur-xl opacity-50`}></div>
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-700"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={colors.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${textSizes[size]} font-bold text-white`}>{Math.round(score)}</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider">{getThreatLevel(score)}</span>
        {label && <span className="text-xs text-gray-500 mt-1">{label}</span>}
      </div>
    </div>
  );
}
