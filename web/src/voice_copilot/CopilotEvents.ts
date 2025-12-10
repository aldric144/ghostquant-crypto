/**
 * CopilotEvents - Event bus for GhostQuant Voice Copilot UI
 * 
 * All UI elements subscribe to these events to update their state.
 * This provides a clean separation between the voice pipeline and UI components.
 */

export type CopilotEventType =
  | 'wake_word_detected'
  | 'mic_start'
  | 'mic_stop'
  | 'volume_change'
  | 'transcript'
  | 'thinking'
  | 'response'
  | 'speaking_start'
  | 'speaking_end'
  | 'insight_event'
  | 'error'
  | 'state_change';

export type CopilotUIState = 
  | 'idle'
  | 'wake_listening'
  | 'activated'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

export type InsightEventType = 'whale' | 'hydra' | 'ecoscan' | 'cluster';

export interface CopilotEvent {
  type: CopilotEventType;
  payload?: unknown;
  timestamp: number;
}

export interface WakeWordEvent extends CopilotEvent {
  type: 'wake_word_detected';
}

export interface MicStartEvent extends CopilotEvent {
  type: 'mic_start';
}

export interface MicStopEvent extends CopilotEvent {
  type: 'mic_stop';
}

export interface VolumeChangeEvent extends CopilotEvent {
  type: 'volume_change';
  payload: { volume: number };
}

export interface TranscriptEvent extends CopilotEvent {
  type: 'transcript';
  payload: { text: string; isFinal: boolean };
}

export interface ThinkingEvent extends CopilotEvent {
  type: 'thinking';
}

export interface ResponseEvent extends CopilotEvent {
  type: 'response';
  payload: { text: string; category: string };
}

export interface SpeakingStartEvent extends CopilotEvent {
  type: 'speaking_start';
}

export interface SpeakingEndEvent extends CopilotEvent {
  type: 'speaking_end';
}

export interface InsightEvent extends CopilotEvent {
  type: 'insight_event';
  payload: { insightType: InsightEventType };
}

export interface ErrorEvent extends CopilotEvent {
  type: 'error';
  payload: { message: string };
}

export interface StateChangeEvent extends CopilotEvent {
  type: 'state_change';
  payload: { state: CopilotUIState };
}

type EventCallback = (event: CopilotEvent) => void;

class CopilotEventBus {
  private listeners: Map<CopilotEventType, Set<EventCallback>> = new Map();
  private globalListeners: Set<EventCallback> = new Set();
  private currentState: CopilotUIState = 'idle';
  private eventHistory: CopilotEvent[] = [];
  private maxHistorySize = 100;

  /**
   * Subscribe to a specific event type
   */
  on(eventType: CopilotEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  /**
   * Subscribe to all events
   */
  onAll(callback: EventCallback): () => void {
    this.globalListeners.add(callback);
    return () => {
      this.globalListeners.delete(callback);
    };
  }

  /**
   * Emit an event
   */
  emit(event: Omit<CopilotEvent, 'timestamp'>): void {
    const fullEvent: CopilotEvent = {
      ...event,
      timestamp: Date.now(),
    };

    // Add to history
    this.eventHistory.push(fullEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify specific listeners
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(fullEvent);
        } catch (error) {
          console.error(`[CopilotEvents] Error in listener for ${event.type}:`, error);
        }
      });
    }

    // Notify global listeners
    this.globalListeners.forEach(callback => {
      try {
        callback(fullEvent);
      } catch (error) {
        console.error('[CopilotEvents] Error in global listener:', error);
      }
    });
  }

  /**
   * Convenience methods for common events
   */
  emitWakeWordDetected(): void {
    this.emit({ type: 'wake_word_detected' });
    this.setState('activated');
  }

  emitMicStart(): void {
    this.emit({ type: 'mic_start' });
    this.setState('listening');
  }

  emitMicStop(): void {
    this.emit({ type: 'mic_stop' });
  }

  emitVolumeChange(volume: number): void {
    this.emit({ type: 'volume_change', payload: { volume } });
  }

  emitTranscript(text: string, isFinal: boolean): void {
    this.emit({ type: 'transcript', payload: { text, isFinal } });
  }

  emitThinking(): void {
    this.emit({ type: 'thinking' });
    this.setState('processing');
  }

  emitResponse(text: string, category: string): void {
    this.emit({ type: 'response', payload: { text, category } });
  }

  emitSpeakingStart(): void {
    this.emit({ type: 'speaking_start' });
    this.setState('speaking');
  }

  emitSpeakingEnd(): void {
    this.emit({ type: 'speaking_end' });
    this.setState('idle');
  }

  emitInsightEvent(insightType: InsightEventType): void {
    this.emit({ type: 'insight_event', payload: { insightType } });
  }

  emitError(message: string): void {
    this.emit({ type: 'error', payload: { message } });
    this.setState('error');
  }

  /**
   * State management
   */
  setState(state: CopilotUIState): void {
    this.currentState = state;
    this.emit({ type: 'state_change', payload: { state } });
  }

  getState(): CopilotUIState {
    return this.currentState;
  }

  /**
   * Get event history
   */
  getHistory(): CopilotEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
    this.globalListeners.clear();
  }

  /**
   * Reset state
   */
  reset(): void {
    this.currentState = 'idle';
    this.eventHistory = [];
  }
}

// Singleton instance
export const copilotEvents = new CopilotEventBus();

// React hook for subscribing to events
export function useCopilotEvent(
  eventType: CopilotEventType,
  callback: EventCallback
): void {
  // This is a placeholder - actual implementation would use useEffect
  // The component using this should implement the useEffect pattern
}

// Export the class for testing
export { CopilotEventBus };

export default copilotEvents;
