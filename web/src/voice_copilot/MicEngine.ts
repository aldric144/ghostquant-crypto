/**
 * MicEngine - Handles microphone permissions and audio input
 * Provides visual feedback state and permission management
 */

export type MicPermissionStatus = 'unknown' | 'granted' | 'denied' | 'prompt';
export type MicState = 'idle' | 'requesting' | 'active' | 'error';

export interface MicEngineCallbacks {
  onStateChange: (state: MicState) => void;
  onPermissionChange: (permission: MicPermissionStatus) => void;
  onError: (error: string) => void;
}

export interface MicEngine {
  state: MicState;
  permission: MicPermissionStatus;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<MicPermissionStatus>;
  setCallbacks: (callbacks: Partial<MicEngineCallbacks>) => void;
}

export function createMicEngine(): MicEngine {
  let state: MicState = 'idle';
  let permission: MicPermissionStatus = 'unknown';
  
  let callbacks: MicEngineCallbacks = {
    onStateChange: () => {},
    onPermissionChange: () => {},
    onError: () => {},
  };

  const setState = (newState: MicState) => {
    state = newState;
    callbacks.onStateChange(state);
  };

  const setPermission = (newPermission: MicPermissionStatus) => {
    permission = newPermission;
    callbacks.onPermissionChange(permission);
  };

  return {
    get state() {
      return state;
    },

    get permission() {
      return permission;
    },

    setCallbacks(newCallbacks: Partial<MicEngineCallbacks>) {
      callbacks = { ...callbacks, ...newCallbacks };
    },

    async checkPermission(): Promise<MicPermissionStatus> {
      if (typeof window === 'undefined' || !navigator.permissions) {
        return 'unknown';
      }

      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        const status = result.state as MicPermissionStatus;
        setPermission(status);
        return status;
      } catch {
        // Some browsers don't support querying microphone permission
        return 'unknown';
      }
    },

    async requestPermission(): Promise<boolean> {
      if (typeof window === 'undefined' || !navigator.mediaDevices) {
        callbacks.onError('Microphone not available in this environment');
        return false;
      }

      setState('requesting');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop());
        
        setPermission('granted');
        setState('idle');
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
          setPermission('denied');
          callbacks.onError('Microphone permission denied. Please enable it in your browser settings.');
        } else {
          callbacks.onError(`Microphone error: ${errorMessage}`);
        }
        
        setState('error');
        return false;
      }
    },
  };
}

export default createMicEngine;
