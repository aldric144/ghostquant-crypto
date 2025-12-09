"use client";

import { useState, useEffect } from "react";
import { X, Mail, Send, Bell, Copy, Check, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { fetchLiquidity, LiquidityData } from "@/lib/api";

interface BuyModalProps {
  coin: {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    momentum_score: number;
    sub_scores: any;
    whale_confidence: number;
    pretrend_prob: number;
    action: string;
    confidence: number;
  };
  onClose: () => void;
}

export default function BuyModal({ coin, onClose }: BuyModalProps) {
  const [email, setEmail] = useState("");
  const [alertType, setAlertType] = useState("score_above");
  const [threshold, setThreshold] = useState(coin.momentum_score);
  const [channels, setChannels] = useState<string[]>(["email"]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liquidity, setLiquidity] = useState<LiquidityData | null>(null);
  const [liquidityLoading, setLiquidityLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

  useEffect(() => {
    const loadLiquidity = async () => {
      try {
        setLiquidityLoading(true);
        const data = await fetchLiquidity(coin.symbol, true);
        setLiquidity(data);
      } catch (err) {
        console.error("Failed to fetch liquidity:", err);
      } finally {
        setLiquidityLoading(false);
      }
    };
    
    loadLiquidity();
  }, [coin.symbol]);

  const handleCreateAlert = async () => {
    if (!email && channels.includes("email")) {
      alert("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/market/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_contact: email,
          symbol: coin.symbol,
          alert_type: alertType,
          threshold: threshold,
          channels: channels,
        }),
      });

      if (!response.ok) throw new Error("Failed to create alert");

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      alert("Failed to create alert. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTemplate = () => {
    const template = `${coin.symbol.toUpperCase()} Analysis
Momentum Score: ${coin.momentum_score.toFixed(1)}/100
Action: ${coin.action}
Confidence: ${(coin.confidence * 100).toFixed(0)}%
Price: $${coin.current_price.toLocaleString()}

Sub-Scores:
- Price Momentum: ${coin.sub_scores.price_momentum.toFixed(1)}
- Volume Spike: ${coin.sub_scores.volume_spike.toFixed(1)}
- RSI Signal: ${coin.sub_scores.rsi_signal.toFixed(1)}
- MA Cross: ${coin.sub_scores.ma_cross.toFixed(1)}
- PreTrend Bonus: ${coin.sub_scores.pretrend_bonus.toFixed(1)}
- Whale Bonus: ${coin.sub_scores.whale_bonus.toFixed(1)}

Whale Confidence: ${(coin.whale_confidence * 100).toFixed(0)}%
PreTrend Probability: ${(coin.pretrend_prob * 100).toFixed(0)}%`;

    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleChannel = (channel: string) => {
    if (channels.includes(channel)) {
      setChannels(channels.filter((c) => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
            <div>
              <h2 className="text-xl font-bold">{coin.symbol.toUpperCase()}</h2>
              <p className="text-sm text-slate-400">{coin.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Momentum Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Momentum Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <div className="text-sm text-slate-400">Momentum Score</div>
                <div className="text-2xl font-bold text-blue-400">{coin.momentum_score.toFixed(1)}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <div className="text-sm text-slate-400">Action</div>
                <div className="text-2xl font-bold text-emerald-400">{coin.action}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <div className="text-sm text-slate-400">Whale Confidence</div>
                <div className="text-2xl font-bold text-purple-400">{(coin.whale_confidence * 100).toFixed(0)}%</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <div className="text-sm text-slate-400">PreTrend Prob</div>
                <div className="text-2xl font-bold text-cyan-400">{(coin.pretrend_prob * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Liquidity & Slippage */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity size={18} />
              Liquidity & Slippage
            </h3>
            
            {liquidityLoading ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center text-slate-400">
                Loading liquidity data...
              </div>
            ) : liquidity ? (
              <div className="space-y-3">
                {/* Liquidity Score */}
                {liquidity.liquidity_score !== null && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Liquidity Score</span>
                      <span className={`text-lg font-bold ${
                        liquidity.liquidity_score >= 70 ? 'text-green-400' :
                        liquidity.liquidity_score >= 40 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {liquidity.liquidity_score.toFixed(0)}/100
                      </span>
                    </div>
                  </div>
                )}

                {/* CEX Order Book */}
                {liquidity.cex_liquidity && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <div className="text-sm font-medium text-slate-300 mb-2">Order Book</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-slate-400">Spread</div>
                        <div className="font-medium">{liquidity.cex_liquidity.spread_bps.toFixed(2)} bps</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Mid Price</div>
                        <div className="font-medium">${liquidity.cex_liquidity.mid_price.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Bid Size</div>
                        <div className="font-medium text-green-400">${liquidity.cex_liquidity.bid_size.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Ask Size</div>
                        <div className="font-medium text-red-400">${liquidity.cex_liquidity.ask_size.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Slippage Estimates */}
                {liquidity.slippage_estimates && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <div className="text-sm font-medium text-slate-300 mb-2">Slippage Estimates</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">$1K Buy</span>
                        <span className="flex items-center gap-1 text-red-400">
                          <TrendingUp size={12} />
                          {liquidity.slippage_estimates.buy['1000_usd']?.slippage_bps?.toFixed(2) || 'N/A'} bps
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">$5K Buy</span>
                        <span className="flex items-center gap-1 text-red-400">
                          <TrendingUp size={12} />
                          {liquidity.slippage_estimates.buy['5000_usd']?.slippage_bps?.toFixed(2) || 'N/A'} bps
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">$10K Buy</span>
                        <span className="flex items-center gap-1 text-red-400">
                          <TrendingUp size={12} />
                          {liquidity.slippage_estimates.buy['10000_usd']?.slippage_bps?.toFixed(2) || 'N/A'} bps
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* DEX Liquidity */}
                {liquidity.dex_liquidity && liquidity.dex_liquidity.length > 0 && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <div className="text-sm font-medium text-slate-300 mb-2">DEX Pools</div>
                    <div className="space-y-2">
                      {liquidity.dex_liquidity.map((pool, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">{pool.pair} ({pool.chain})</span>
                            <span className="font-medium">${pool.tvl_usd?.toLocaleString() || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Derivatives */}
                {liquidity.derivatives && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <div className="text-sm font-medium text-slate-300 mb-2">Derivatives</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {liquidity.derivatives.funding_rate_8h !== null && (
                        <div>
                          <div className="text-slate-400">Funding (8h)</div>
                          <div className={`font-medium ${
                            liquidity.derivatives.funding_rate_8h > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {(liquidity.derivatives.funding_rate_8h * 100).toFixed(4)}%
                          </div>
                        </div>
                      )}
                      {liquidity.derivatives.open_interest !== null && (
                        <div>
                          <div className="text-slate-400">Open Interest</div>
                          <div className="font-medium">${liquidity.derivatives.open_interest.toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center text-slate-400">
                Liquidity data unavailable
              </div>
            )}
          </div>

          {/* Create Alert */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Create Alert</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Alert Type</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="score_above">Score Above</option>
                  <option value="score_below">Score Below</option>
                  <option value="price_above">Price Above</option>
                  <option value="price_below">Price Below</option>
                  <option value="whale_seen">Whale Activity</option>
                  <option value="pretrend_above">PreTrend Above</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Threshold</label>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  step="0.1"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Notification Channels</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleChannel("email")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      channels.includes("email")
                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    <Mail size={16} />
                    Email
                  </button>
                  <button
                    onClick={() => toggleChannel("telegram")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      channels.includes("telegram")
                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    <Send size={16} />
                    Telegram
                  </button>
                  <button
                    onClick={() => toggleChannel("push")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      channels.includes("push")
                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    <Bell size={16} />
                    Push
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreateAlert}
                disabled={loading || success}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {loading ? "Creating..." : success ? "✓ Alert Created!" : "Create Alert"}
              </button>
            </div>
          </div>

          {/* Copy Template */}
          <div>
            <button
              onClick={handleCopyTemplate}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy Analysis Template"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
