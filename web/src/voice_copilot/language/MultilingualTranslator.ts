/**
 * MultilingualTranslator - Translation Layer for GhostQuant Voice Copilot
 * 
 * Provides translation capabilities for CopilotBrain responses.
 * Uses OpenAI for translation when target language differs from English.
 * Maintains personality tone consistency across languages.
 */

import { type LanguageCode, SUPPORTED_LANGUAGES, getLanguageDisplayName } from './LanguageDetector';
import { getActiveLanguage } from './LanguageRouter';

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  wasTranslated: boolean;
}

export interface TranslationConfig {
  preserveTone?: boolean;
  preserveTerminology?: boolean;
  targetLanguage?: LanguageCode;
}

// GhostQuant-specific terminology that should not be translated
export const PRESERVE_TERMS = [
  'GhostQuant',
  'Hydra',
  'Constellation',
  'WIDB',
  'EcoScan',
  'GhostMind',
  'Singularity Orb',
  'UltraFusion',
  'Valkyrie',
  'Sentinel',
];

// Localized greetings and common phrases
export const LOCALIZED_PHRASES: Record<LanguageCode, Record<string, string>> = {
  en: {
    greeting: "Hello! I'm GhostQuant, your AI trading assistant.",
    askMore: "Would you like to know more?",
    understood: "I understand.",
    processing: "Let me analyze that for you.",
    error: "I encountered an issue. Let me try again.",
  },
  es: {
    greeting: "Hola! Soy GhostQuant, tu asistente de trading con IA.",
    askMore: "Te gustaria saber mas?",
    understood: "Entendido.",
    processing: "Dejame analizar eso para ti.",
    error: "Encontre un problema. Dejame intentar de nuevo.",
  },
  fr: {
    greeting: "Bonjour! Je suis GhostQuant, votre assistant de trading IA.",
    askMore: "Voulez-vous en savoir plus?",
    understood: "Je comprends.",
    processing: "Laissez-moi analyser cela pour vous.",
    error: "J'ai rencontre un probleme. Laissez-moi reessayer.",
  },
  zh: {
    greeting: "你好！我是GhostQuant，您的AI交易助手。",
    askMore: "您想了解更多吗？",
    understood: "我明白了。",
    processing: "让我为您分析一下。",
    error: "我遇到了问题。让我再试一次。",
  },
  hi: {
    greeting: "नमस्ते! मैं GhostQuant हूं, आपका AI ट्रेडिंग सहायक।",
    askMore: "क्या आप और जानना चाहेंगे?",
    understood: "मैं समझ गया।",
    processing: "मुझे आपके लिए इसका विश्लेषण करने दें।",
    error: "मुझे एक समस्या आई। मुझे फिर से कोशिश करने दें।",
  },
  ja: {
    greeting: "こんにちは！私はGhostQuant、あなたのAIトレーディングアシスタントです。",
    askMore: "もっと知りたいですか？",
    understood: "わかりました。",
    processing: "分析させてください。",
    error: "問題が発生しました。もう一度試させてください。",
  },
  ko: {
    greeting: "안녕하세요! 저는 GhostQuant, 당신의 AI 트레이딩 어시스턴트입니다.",
    askMore: "더 알고 싶으신가요?",
    understood: "이해했습니다.",
    processing: "분석해 드리겠습니다.",
    error: "문제가 발생했습니다. 다시 시도하겠습니다.",
  },
  ar: {
    greeting: "مرحبا! أنا GhostQuant، مساعدك للتداول بالذكاء الاصطناعي.",
    askMore: "هل تريد معرفة المزيد؟",
    understood: "فهمت.",
    processing: "دعني أحلل ذلك لك.",
    error: "واجهت مشكلة. دعني أحاول مرة أخرى.",
  },
  pt: {
    greeting: "Ola! Sou o GhostQuant, seu assistente de trading com IA.",
    askMore: "Gostaria de saber mais?",
    understood: "Entendi.",
    processing: "Deixe-me analisar isso para voce.",
    error: "Encontrei um problema. Deixe-me tentar novamente.",
  },
  de: {
    greeting: "Hallo! Ich bin GhostQuant, Ihr KI-Trading-Assistent.",
    askMore: "Mochten Sie mehr erfahren?",
    understood: "Verstanden.",
    processing: "Lassen Sie mich das fur Sie analysieren.",
    error: "Ich bin auf ein Problem gestossen. Lassen Sie mich es erneut versuchen.",
  },
  it: {
    greeting: "Ciao! Sono GhostQuant, il tuo assistente di trading AI.",
    askMore: "Vorresti saperne di piu?",
    understood: "Capito.",
    processing: "Lasciami analizzare questo per te.",
    error: "Ho riscontrato un problema. Lasciami riprovare.",
  },
};

/**
 * Get a localized phrase
 */
export function getLocalizedPhrase(
  phraseKey: keyof typeof LOCALIZED_PHRASES['en'],
  language?: LanguageCode
): string {
  const targetLang = language || getActiveLanguage();
  return LOCALIZED_PHRASES[targetLang]?.[phraseKey] || LOCALIZED_PHRASES.en[phraseKey];
}

/**
 * Translate text to target language using OpenAI API
 * Falls back to original text if translation fails
 */
export async function translateText(
  text: string,
  targetLanguage: LanguageCode,
  config?: TranslationConfig
): Promise<TranslationResult> {
  // If target is English or same as source, no translation needed
  if (targetLanguage === 'en') {
    return {
      originalText: text,
      translatedText: text,
      sourceLanguage: 'en',
      targetLanguage: 'en',
      wasTranslated: false,
    };
  }

  // Check if OpenAI API is available
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[MultilingualTranslator] OpenAI API key not configured, returning original text');
    return {
      originalText: text,
      translatedText: text,
      sourceLanguage: 'en',
      targetLanguage,
      wasTranslated: false,
    };
  }

  try {
    const targetLanguageName = getLanguageDisplayName(targetLanguage);
    
    // Build translation prompt
    const preserveTermsNote = config?.preserveTerminology !== false
      ? `Keep these terms untranslated: ${PRESERVE_TERMS.join(', ')}.`
      : '';
    
    const toneNote = config?.preserveTone !== false
      ? 'Maintain a professional yet friendly tone, as if speaking to a trading professional.'
      : '';

    const prompt = `Translate the following text to ${targetLanguageName}. ${preserveTermsNote} ${toneNote}

Text to translate:
${text}

Translation:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator specializing in financial and cryptocurrency terminology. Translate accurately while maintaining the original tone and meaning.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim() || text;

    return {
      originalText: text,
      translatedText,
      sourceLanguage: 'en',
      targetLanguage,
      wasTranslated: true,
    };

  } catch (error) {
    console.error('[MultilingualTranslator] Translation error:', error);
    return {
      originalText: text,
      translatedText: text,
      sourceLanguage: 'en',
      targetLanguage,
      wasTranslated: false,
    };
  }
}

/**
 * Translate CopilotBrain response to active language
 */
export async function translateResponse(
  responseText: string,
  targetLanguage?: LanguageCode
): Promise<string> {
  const targetLang = targetLanguage || getActiveLanguage();
  
  // No translation needed for English
  if (targetLang === 'en') {
    return responseText;
  }

  const result = await translateText(responseText, targetLang, {
    preserveTone: true,
    preserveTerminology: true,
  });

  return result.translatedText;
}

/**
 * Check if translation is needed for the active language
 */
export function needsTranslation(targetLanguage?: LanguageCode): boolean {
  const targetLang = targetLanguage || getActiveLanguage();
  return targetLang !== 'en';
}

/**
 * Get supported languages for translation
 */
export function getTranslationLanguages(): { code: LanguageCode; name: string; nativeName: string }[] {
  return Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
    code: code as LanguageCode,
    name: info.name,
    nativeName: info.nativeName,
  }));
}

export default {
  translateText,
  translateResponse,
  getLocalizedPhrase,
  needsTranslation,
  getTranslationLanguages,
  PRESERVE_TERMS,
  LOCALIZED_PHRASES,
};
