/**
 * TextToSpeechEngine - Converts text to speech using Web Speech API
 * Provides voice selection and playback controls
 */

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  isDefault: boolean;
}

export interface TTSCallbacks {
  onStart: () => void;
  onEnd: () => void;
  onError: (error: string) => void;
  onVoicesLoaded: (voices: VoiceOption[]) => void;
}

export interface TextToSpeechEngine {
  supported: boolean;
  isSpeaking: boolean;
  voices: VoiceOption[];
  selectedVoiceId: string | null;
  speak: (text: string) => void;
  stop: () => void;
  setVoice: (voiceId: string) => void;
  setCallbacks: (callbacks: Partial<TTSCallbacks>) => void;
  loadVoices: () => void;
}

export function createTextToSpeechEngine(): TextToSpeechEngine {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  let voices: VoiceOption[] = [];
  let selectedVoiceId: string | null = null;
  let isSpeaking = false;
  
  let callbacks: TTSCallbacks = {
    onStart: () => {},
    onEnd: () => {},
    onError: () => {},
    onVoicesLoaded: () => {},
  };

  // Convert browser voice to our VoiceOption format
  const mapVoice = (voice: SpeechSynthesisVoice, index: number): VoiceOption => ({
    id: `${voice.name}-${index}`,
    name: voice.name,
    lang: voice.lang,
    isDefault: voice.default,
  });

  // Find the best default voice (prefer English, natural-sounding voices)
  const selectBestVoice = (voiceList: VoiceOption[]): string | null => {
    // Prefer voices with these keywords (usually higher quality)
    const preferredKeywords = ['natural', 'premium', 'enhanced', 'neural'];
    
    // First, try to find a high-quality English voice
    for (const keyword of preferredKeywords) {
      const match = voiceList.find(v => 
        v.lang.startsWith('en') && 
        v.name.toLowerCase().includes(keyword)
      );
      if (match) return match.id;
    }
    
    // Fall back to any English voice
    const englishVoice = voiceList.find(v => v.lang.startsWith('en'));
    if (englishVoice) return englishVoice.id;
    
    // Fall back to default voice
    const defaultVoice = voiceList.find(v => v.isDefault);
    if (defaultVoice) return defaultVoice.id;
    
    // Fall back to first voice
    return voiceList[0]?.id || null;
  };

  return {
    get supported() {
      return supported;
    },

    get isSpeaking() {
      return isSpeaking;
    },

    get voices() {
      return voices;
    },

    get selectedVoiceId() {
      return selectedVoiceId;
    },

    setCallbacks(newCallbacks: Partial<TTSCallbacks>) {
      callbacks = { ...callbacks, ...newCallbacks };
    },

    loadVoices() {
      if (!supported) return;

      const loadVoiceList = () => {
        const browserVoices = speechSynthesis.getVoices();
        voices = browserVoices.map(mapVoice);
        
        if (voices.length > 0 && !selectedVoiceId) {
          selectedVoiceId = selectBestVoice(voices);
        }
        
        callbacks.onVoicesLoaded(voices);
      };

      // Voices may not be immediately available
      loadVoiceList();
      
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoiceList;
      }
    },

    setVoice(voiceId: string) {
      const voice = voices.find(v => v.id === voiceId);
      if (voice) {
        selectedVoiceId = voiceId;
        // Save preference to localStorage
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('ghostquant-copilot-voice', voiceId);
        }
      }
    },

    speak(text: string) {
      if (!supported) {
        callbacks.onError('Text-to-speech not supported in this browser');
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice if selected
      if (selectedVoiceId) {
        const browserVoices = speechSynthesis.getVoices();
        const voiceIndex = voices.findIndex(v => v.id === selectedVoiceId);
        if (voiceIndex >= 0 && browserVoices[voiceIndex]) {
          utterance.voice = browserVoices[voiceIndex];
        }
      }

      // Configure speech parameters
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        isSpeaking = true;
        callbacks.onStart();
      };

      utterance.onend = () => {
        isSpeaking = false;
        callbacks.onEnd();
      };

      utterance.onerror = (event) => {
        isSpeaking = false;
        callbacks.onError(event.error || 'Speech synthesis error');
      };

      speechSynthesis.speak(utterance);
    },

    stop() {
      if (supported) {
        speechSynthesis.cancel();
        isSpeaking = false;
        callbacks.onEnd();
      }
    },
  };
}

export default createTextToSpeechEngine;
