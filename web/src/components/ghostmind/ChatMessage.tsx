"use client";

import { memo } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: Record<string, unknown>;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slideIn`}
    >
      <div
        className={`max-w-[80%] ${
          isUser
            ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-2xl rounded-br-md"
            : "bg-slate-800 border border-slate-700 text-gray-100 rounded-2xl rounded-bl-md"
        } px-4 py-3 shadow-lg`}
      >
        {/* Message Header */}
        <div className="flex items-center gap-2 mb-1">
          {!isUser && (
            <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
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
          )}
          <span className={`text-xs ${isUser ? "text-purple-200" : "text-gray-500"}`}>
            {isUser ? "You" : "GhostMind"}
          </span>
          <span className={`text-xs ${isUser ? "text-purple-300" : "text-gray-600"}`}>
            {formatTime(message.timestamp)}
          </span>
          {message.isStreaming && (
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-100"></span>
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-200"></span>
            </span>
          )}
        </div>

        {/* Message Content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content.split("\n").map((line, index) => {
            // Handle markdown-style formatting
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={index} className="font-semibold text-cyan-400 mt-2 mb-1">
                  {line.replace(/\*\*/g, "")}
                </p>
              );
            }
            if (line.startsWith("- ")) {
              return (
                <p key={index} className="ml-4 flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>{line.substring(2)}</span>
                </p>
              );
            }
            if (line.startsWith("| ")) {
              // Table row
              return (
                <p key={index} className="font-mono text-xs text-gray-400">
                  {line}
                </p>
              );
            }
            if (line.match(/^\d+\./)) {
              // Numbered list
              return (
                <p key={index} className="ml-2">
                  {line}
                </p>
              );
            }
            return line ? (
              <p key={index} className={index > 0 ? "mt-1" : ""}>
                {line}
              </p>
            ) : (
              <br key={index} />
            );
          })}
        </div>

        {/* Streaming cursor */}
        {message.isStreaming && (
          <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-blink"></span>
        )}
      </div>
    </div>
  );
}

export default memo(ChatMessage);
