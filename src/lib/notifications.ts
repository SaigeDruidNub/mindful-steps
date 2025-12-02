export class NotificationManager {
  private static audioContext: AudioContext | null = null;
  private static isAudioInitialized = false;

  // Initialize audio context (must be done after user interaction)
  static initAudio() {
    if (typeof window !== 'undefined' && !this.isAudioInitialized) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.isAudioInitialized = true;
      } catch (error) {
        console.warn('Audio not supported:', error);
      }
    }
  }

  // Play two gentle, simple tones
  static async playMindfulMomentSound() {
    if (!this.audioContext) {
      this.initAudio();
    }

    if (!this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      
      // Two simple, gentle tones that harmonize well
      const tone1Freq = 440; // A4 - clear and pure
      const tone2Freq = 523.25; // C5 - soothing fifth above

      // First tone - main gentle note
      const osc1 = this.audioContext.createOscillator();
      const gain1 = this.audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(this.audioContext.destination);
      osc1.frequency.value = tone1Freq;
      osc1.type = 'sine';

      // Second tone - harmonious complement
      const osc2 = this.audioContext.createOscillator();
      const gain2 = this.audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(this.audioContext.destination);
      osc2.frequency.value = tone2Freq;
      osc2.type = 'sine';

      // Gentle envelope for both tones
      const envelope = {
        attack: 0.1,    // Gentle fade in
        sustain: 0.15,  // Moderate volume
        decay: 1.5     // Gentle fade out
      };

      // First tone envelope
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(envelope.sustain, now + envelope.attack);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + envelope.attack + envelope.decay);

      // Second tone starts slightly later and is quieter
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(envelope.sustain * 0.7, now + envelope.attack + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + envelope.attack + 0.05 + envelope.decay);

      // Start both oscillators
      osc1.start(now);
      osc2.start(now + 0.05); // Slight delay for gentleness

      // Stop oscillators
      osc1.stop(now + envelope.attack + envelope.decay + 0.5);
      osc2.stop(now + envelope.attack + 0.05 + envelope.decay + 0.5);

    } catch (error) {
      console.warn('Could not play gentle tones:', error);
    }
  }

  // Vibrate the device with a more robust pattern
  static vibrate() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        // More robust vibration pattern: longer pulses with more rhythm
        // Pattern: short-long-short-long pause (more attention-getting)
        navigator.vibrate([
          150,  // First pulse - strong attention getter
          100,  // Short pause
          300,  // Second pulse - longer, more noticeable
          100,  // Short pause  
          150,  // Third pulse - matches first
          200   // Longer pause before ending
        ]);
      } catch (error) {
        console.warn('Vibration failed:', error);
      }
    }
  }

  // Combined notification with sound and vibration
  static async notifyMindfulMoment() {
    // Play sound
    this.playMindfulMomentSound();
    
    // Vibrate
    this.vibrate();
  }

  // Play step count milestone sound (different tone)
  static async playMilestoneSound() {
    if (!this.audioContext) {
      this.initAudio();
    }

    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // More celebratory sound for milestones
      oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.6);

    } catch (error) {
      console.warn('Could not play milestone sound:', error);
    }
  }

  // Test notification system
  static async test() {
    console.log('🔔 Testing notification system...');
    await this.playMindfulMomentSound();
    this.vibrate();
    console.log('✅ Notification test complete');
  }
}