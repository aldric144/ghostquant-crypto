'use client';

/**
 * LanguageSelector - UI Component for GhostQuant Voice Copilot Language Selection
 * 
 * Allows users to select their preferred language for voice interactions.
 * Supports auto-detection mode and manual language selection.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  type LanguageCode,
  SUPPORTED_LANGUAGES,
  getActiveLanguage,
  setActiveLanguage,
  getUserPreference,
  setUserPreference,
} from '../../voice_copilot/language';

export interface LanguageSelectorProps {
  className?: string;
  compact?: boolean;
  showNativeNames?: boolean;
  onChange?: (language: LanguageCode | 'auto') => void;
}

// Language options with display info
const LANGUAGE_OPTIONS: { code: LanguageCode | 'auto'; name: string; nativeName: string; flag: string }[] = [
  { code: 'auto', name: 'Auto Detect', nativeName: 'Auto', flag: '🌐' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Francais', flag: '🇫🇷' },
  { code: 'zh', name: 'Mandarin', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugues', flag: '🇧🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

export function LanguageSelector({
  className = '',
  compact = false,
  showNativeNames = true,
  onChange,
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | 'auto'>('auto');
  const [isOpen, setIsOpen] = useState(false);

  // Initialize from stored preference
  useEffect(() => {
    const preference = getUserPreference();
    setSelectedLanguage(preference);
  }, []);

  // Handle language selection
  const handleSelect = useCallback((code: LanguageCode | 'auto') => {
    setSelectedLanguage(code);
    setUserPreference(code);
    if (code !== 'auto') {
      setActiveLanguage(code);
    }
    setIsOpen(false);
    onChange?.(code);
  }, [onChange]);

  // Get display text for selected language
  const getDisplayText = useCallback(() => {
    const option = LANGUAGE_OPTIONS.find(opt => opt.code === selectedLanguage);
    if (!option) return 'Select Language';
    
    if (compact) {
      return option.flag;
    }
    
    return showNativeNames && option.code !== 'auto'
      ? `${option.flag} ${option.nativeName}`
      : `${option.flag} ${option.name}`;
  }, [selectedLanguage, compact, showNativeNames]);

  // Compact dropdown style
  if (compact) {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 transition-colors"
          title="Select Language"
        >
          <span className="text-lg">{getDisplayText()}</span>
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.code}
                onClick={() => handleSelect(option.code)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center gap-2 ${
                  selectedLanguage === option.code ? 'bg-gray-800 text-cyan-400' : 'text-gray-300'
                }`}
              >
                <span>{option.flag}</span>
                <span className="flex-1">{option.name}</span>
                {showNativeNames && option.code !== 'auto' && (
                  <span className="text-xs text-gray-500">{option.nativeName}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full dropdown style
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-400 mb-1">
        Voice Language
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 rounded-lg transition-colors"
      >
        <span className="text-gray-200">{getDisplayText()}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.code}
              onClick={() => handleSelect(option.code)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center gap-2 ${
                selectedLanguage === option.code ? 'bg-gray-800 text-cyan-400' : 'text-gray-300'
              }`}
            >
              <span>{option.flag}</span>
              <span className="flex-1">{option.name}</span>
              {showNativeNames && option.code !== 'auto' && (
                <span className="text-xs text-gray-500">{option.nativeName}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
