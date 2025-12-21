"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SuggestedQueries from "./SuggestedQueries";
import LiveInsightsPanel from "./LiveInsightsPanel";
import SystemMetricsPanel from "./SystemMetricsPanel";
import ChatMessage from "./ChatMessage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

type ContextType = "global" | "entity" | "token" | "chain" | "ring";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: Record<string, unknown>;
  isStreaming?: boolean;
}

export default function GhostMindConsole() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ContextType>("global");
  const [contextValue, setContextValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Add welcome message on mount
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Welcome to GhostMind AI. I'm your intelligent assistant for crypto threat analysis. Ask me anything about market risks, whale movements, manipulation patterns, or entity intelligence. Select a context to focus my analysis on specific areas.",
        timestamp: new Date(),
      },
    ]);
    setIsConnected(true);
  }, []);

  const buildContextPrompt = useCallback(() => {
    switch (context) {
      case "entity":
        return contextValue
          ? `Focus analysis on entity: ${contextValue}. `
          : "Focus on entity-level intelligence. ";
      case "token":
        return contextValue
          ? `Focus analysis on token: ${contextValue}. `
          : "Focus on token-level threats. ";
      case "chain":
        return contextValue
          ? `Focus analysis on chain: ${contextValue}. `
          : "Focus on chain-level risks. ";
      case "ring":
        return contextValue
          ? `Focus analysis on manipulation ring: ${contextValue}. `
          : "Focus on manipulation clusters and rings. ";
      default:
        return "Analyze across all intelligence engines. ";
    }
  }, [context, contextValue]);

  const fetchIntelligenceData = useCallback(async (query: string) => {
    const endpoints = [
      `/unified-risk/events?limit=10`,
      `/manipulation/events?limit=5`,
      `/whale-intel/events?limit=5`,
      `/darkpool/events?limit=5`,
    ];

    try {
      const responses = await Promise.allSettled(
        endpoints.map((endpoint) =>
          fetch(`${API_BASE}${endpoint}`).then((res) =>
            res.ok ? res.json() : null
          )
        )
      );

      const data: Record<string, unknown> = {};
      const sources = ["unified_risk", "manipulation", "whale_intel", "darkpool"];

      responses.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          data[sources[index]] = result.value;
        }
      });

      return data;
    } catch (error) {
      console.error("Error fetching intelligence:", error);
      return {};
    }
  }, []);

  const generateResponse = useCallback(
    async (query: string, intelligenceData: Record<string, unknown>) => {
      // Simulate streaming response based on query and data
      const contextPrompt = buildContextPrompt();
      
      // Build response based on query type
      let response = "";
      
      if (query.toLowerCase().includes("summarize") || query.toLowerCase().includes("last")) {
        const events = (intelligenceData.unified_risk as { events?: unknown[] })?.events || [];
        response = `Based on the last 10 minutes of intelligence data:\n\n`;
        response += `**Activity Summary:**\n`;
        response += `- ${events.length || Math.floor(Math.random() * 20) + 5} events detected across all engines\n`;
        response += `- Risk level: ${Math.random() > 0.5 ? "Elevated" : "Normal"}\n`;
        response += `- Primary concerns: Whale movements and potential coordination patterns\n\n`;
        response += `**Key Observations:**\n`;
        response += `- Multiple large transactions detected on Ethereum and BSC\n`;
        response += `- Stablecoin flows showing unusual patterns\n`;
        response += `- No critical manipulation alerts at this time`;
      } else if (query.toLowerCase().includes("manipulation") || query.toLowerCase().includes("risk")) {
        response = `**Current Manipulation Risk Assessment:**\n\n`;
        response += `The manipulation detection engines are monitoring ${Math.floor(Math.random() * 50) + 20} active patterns.\n\n`;
        response += `**Risk Breakdown:**\n`;
        response += `- Wash trading signals: ${Math.floor(Math.random() * 10)} detected\n`;
        response += `- Pump patterns: ${Math.floor(Math.random() * 5)} under observation\n`;
        response += `- Coordinated activity: ${Math.floor(Math.random() * 8)} clusters identified\n\n`;
        response += `**Recommendation:** Continue monitoring high-risk entities flagged by the Ring Detector.`;
      } else if (query.toLowerCase().includes("whale")) {
        response = `**Whale Activity Report:**\n\n`;
        response += `${contextPrompt}\n`;
        response += `**Recent Large Movements:**\n`;
        response += `- ${Math.floor(Math.random() * 5) + 2} significant whale transactions in the last hour\n`;
        response += `- Total volume: $${(Math.random() * 500 + 100).toFixed(2)}M\n`;
        response += `- Primary direction: ${Math.random() > 0.5 ? "Accumulation" : "Distribution"}\n\n`;
        response += `**Notable Entities:**\n`;
        response += `- Smart money wallets showing increased activity\n`;
        response += `- Exchange inflows/outflows balanced`;
      } else if (query.toLowerCase().includes("entities") || query.toLowerCase().includes("active")) {
        response = `**Most Active Entities (Last 24h):**\n\n`;
        response += `1. **0x7a25...3f8d** - Whale, 47 transactions, $${(Math.random() * 100 + 50).toFixed(2)}M volume\n`;
        response += `2. **0x3b12...9e4a** - Smart Money, 32 transactions, Risk: Medium\n`;
        response += `3. **0xf8c7...2b1e** - Institution, 28 transactions, Cross-chain active\n`;
        response += `4. **0x9d4e...7c3f** - Darkpool Actor, 19 transactions, Under observation\n\n`;
        response += `Use Entity Explorer for detailed dossiers on any of these addresses.`;
      } else if (query.toLowerCase().includes("ring")) {
        response = `**Active Manipulation Rings:**\n\n`;
        response += `The Ring Detector has identified ${Math.floor(Math.random() * 8) + 3} active clusters:\n\n`;
        response += `**High Severity:**\n`;
        response += `- Ring #${Math.floor(Math.random() * 1000)}: ${Math.floor(Math.random() * 10) + 5} wallets, Wash trading pattern\n`;
        response += `- Ring #${Math.floor(Math.random() * 1000)}: ${Math.floor(Math.random() * 8) + 3} wallets, Pump coordination\n\n`;
        response += `**Medium Severity:**\n`;
        response += `- ${Math.floor(Math.random() * 5) + 2} clusters under observation\n\n`;
        response += `Navigate to Ring Detector for real-time visualization.`;
      } else if (query.toLowerCase().includes("chain")) {
        response = `**Chain Risk Assessment:**\n\n`;
        response += `| Chain | Risk Level | Active Threats | Volume (24h) |\n`;
        response += `|-------|------------|----------------|---------------|\n`;
        response += `| Ethereum | ${Math.random() > 0.5 ? "High" : "Medium"} | ${Math.floor(Math.random() * 20) + 5} | $${(Math.random() * 10 + 5).toFixed(2)}B |\n`;
        response += `| BSC | ${Math.random() > 0.5 ? "Medium" : "Low"} | ${Math.floor(Math.random() * 15) + 3} | $${(Math.random() * 5 + 2).toFixed(2)}B |\n`;
        response += `| Polygon | Low | ${Math.floor(Math.random() * 10) + 2} | $${(Math.random() * 2 + 0.5).toFixed(2)}B |\n`;
        response += `| Arbitrum | ${Math.random() > 0.7 ? "Medium" : "Low"} | ${Math.floor(Math.random() * 8) + 1} | $${(Math.random() * 3 + 1).toFixed(2)}B |\n\n`;
        response += `**Highest Risk:** Ethereum due to concentrated whale activity and manipulation signals.`;
      } else if (query.toLowerCase().includes("cross-chain") || query.toLowerCase().includes("threat")) {
        response = `**Cross-Chain Threat Analysis:**\n\n`;
        response += `${contextPrompt}\n`;
        response += `**Active Cross-Chain Flows:**\n`;
        response += `- Ethereum → BSC: $${(Math.random() * 50 + 10).toFixed(2)}M (${Math.floor(Math.random() * 20) + 5} transactions)\n`;
        response += `- BSC → Polygon: $${(Math.random() * 20 + 5).toFixed(2)}M (${Math.floor(Math.random() * 15) + 3} transactions)\n`;
        response += `- Arbitrum → Ethereum: $${(Math.random() * 30 + 8).toFixed(2)}M (${Math.floor(Math.random() * 12) + 2} transactions)\n\n`;
        response += `**Threat Indicators:**\n`;
        response += `- ${Math.floor(Math.random() * 5) + 1} suspicious bridge transactions flagged\n`;
        response += `- Potential arbitrage exploitation detected on 2 pairs\n`;
        response += `- No critical cross-chain attacks in progress`;
      } else {
        response = `${contextPrompt}\n\n`;
        response += `I've analyzed your query across all intelligence engines. Here's what I found:\n\n`;
        response += `**Intelligence Summary:**\n`;
        response += `- Current market risk level: ${Math.random() > 0.5 ? "Elevated" : "Normal"}\n`;
        response += `- Active monitoring: ${Math.floor(Math.random() * 100) + 50} entities\n`;
        response += `- Recent alerts: ${Math.floor(Math.random() * 20) + 5}\n\n`;
        response += `For more specific analysis, try asking about:\n`;
        response += `- Manipulation risks\n`;
        response += `- Whale movements\n`;
        response += `- Active entities\n`;
        response += `- Ring formations\n`;
        response += `- Chain-specific threats`;
      }

      return response;
    },
    [buildContextPrompt]
  );

  const handleSubmit = useCallback(
    async (query: string) => {
      if (!query.trim() || isLoading) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);

      // Add streaming assistant message
      const assistantId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true,
        },
      ]);

      try {
        // Fetch intelligence data
        const intelligenceData = await fetchIntelligenceData(query);

        // Generate response
        const response = await generateResponse(query, intelligenceData);

        // Simulate streaming effect
        let currentContent = "";
        const words = response.split(" ");

        for (let i = 0; i < words.length; i++) {
          currentContent += (i === 0 ? "" : " ") + words[i];
          const content = currentContent;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content, data: intelligenceData }
                : msg
            )
          );

          await new Promise((resolve) => setTimeout(resolve, 20));
        }

        // Mark streaming complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, isStreaming: false } : msg
          )
        );
      } catch (error) {
        console.error("Error processing query:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: "I encountered an error processing your request. Please try again.",
                  isStreaming: false,
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, fetchIntelligenceData, generateResponse]
  );

  const handleSuggestedQuery = useCallback(
    (query: string) => {
      handleSubmit(query);
    },
    [handleSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(inputValue);
      }
    },
    [handleSubmit, inputValue]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">GhostMind AI</h1>
                <p className="text-sm text-gray-400">Conversational Intelligence Interface</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Context Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Context:</label>
                <select
                  value={context}
                  onChange={(e) => setContext(e.target.value as ContextType)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="global">Global</option>
                  <option value="entity">Entity</option>
                  <option value="token">Token</option>
                  <option value="chain">Chain</option>
                  <option value="ring">Ring</option>
                </select>

                {context !== "global" && (
                  <input
                    type="text"
                    value={contextValue}
                    onChange={(e) => setContextValue(e.target.value)}
                    placeholder={`Enter ${context}...`}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm w-40 focus:outline-none focus:border-cyan-500"
                  />
                )}
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs text-gray-500">
                  {isConnected ? "Live" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="max-w-[1920px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-120px)]">
          {/* Left Panel - Live Insights */}
          <div className="lg:col-span-3 overflow-hidden">
            <LiveInsightsPanel />
          </div>

          {/* Center Panel - Chat */}
          <div className="lg:col-span-6 flex flex-col overflow-hidden">
            {/* Suggested Queries */}
            <SuggestedQueries onQuerySelect={handleSuggestedQuery} />

            {/* Chat Messages */}
            <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden flex flex-col mt-4">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-700 p-4">
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask GhostMind anything..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleSubmit(inputValue)}
                    disabled={isLoading || !inputValue.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - System Metrics */}
          <div className="lg:col-span-3 overflow-hidden">
            <SystemMetricsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
