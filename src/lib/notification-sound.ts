// Notification sound utility using Web Audio API
// Generates a pleasant notification chime without needing external audio files

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function playNotificationSound(type: 'message' | 'sent' | 'error' = 'message') {
  try {
    const ctx = getAudioContext();
    
    // Resume context if suspended (required after user interaction)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    switch (type) {
      case 'message':
        playMessageChime(ctx, now);
        break;
      case 'sent':
        playSentSound(ctx, now);
        break;
      case 'error':
        playErrorSound(ctx, now);
        break;
    }
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
}

function playMessageChime(ctx: AudioContext, now: number) {
  // Pleasant two-tone chime for incoming messages
  const frequencies = [830, 1046]; // G5 and C6 notes
  
  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    const startTime = now + index * 0.1;
    const duration = 0.15;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  });
}

function playSentSound(ctx: AudioContext, now: number) {
  // Subtle whoosh/pop for sent messages
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(600, now);
  oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.08);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.15, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  oscillator.start(now);
  oscillator.stop(now + 0.1);
}

function playErrorSound(ctx: AudioContext, now: number) {
  // Low buzz for errors
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.value = 200;
  oscillator.type = 'sawtooth';
  
  gainNode.gain.setValueAtTime(0.1, now);
  gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

// Pre-warm audio context on first user interaction
export function initializeAudioContext() {
  try {
    getAudioContext();
  } catch (error) {
    console.warn('Could not initialize audio context:', error);
  }
}
