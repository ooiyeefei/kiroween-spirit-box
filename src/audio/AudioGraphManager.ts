/**
 * FRANKENSTEIN STITCHING POINT #1: Raw Audio Synthesis
 * 
 * This is where we generate noise from SCRATCH using Math.random().
 * No pre-recorded MP3s - pure mathematical chaos transformed into
 * analog-feeling static. This is the "monster's heartbeat."
 */

import { AUDIO_CONFIG } from '../config/spectral-constants';

export class AudioGraphManager {
  private audioContext: AudioContext | null = null;
  private noiseNode: ScriptProcessorNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private lfoGainNode: GainNode | null = null;
  private noiseGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isRunning = false;

  /**
   * Initialize the AudioContext (starts in suspended state per browser policy)
   */
  async initialize(): Promise<AudioContext> {
    if (this.audioContext) {
      return this.audioContext;
    }

    this.audioContext = new AudioContext();
    
    // Browser autoplay policy: context starts suspended
    if (this.audioContext.state === 'suspended') {
      console.log('[Spirit Box] AudioContext suspended, waiting for user gesture...');
    }

    this.setupNodes();
    return this.audioContext;
  }

  /**
   * Set up the audio node graph
   * 
   * Graph: WhiteNoise → BiquadFilter (with LFO) → GainNode → Analyser → Destination
   */
  private setupNodes(): void {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const { NOISE, FFT_SIZE, SMOOTHING } = AUDIO_CONFIG;

    // FRANKENSTEIN: Raw white noise from Math.random()
    // This is the "electricity" that brings our monster to life
    this.noiseNode = ctx.createScriptProcessor(NOISE.BUFFER_SIZE, 1, 1);
    this.noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
        // Pure chaos: random values between -1 and 1
        output[i] = Math.random() * 2 - 1;
      }
    };

    // LowPass filter for that "radio static" feel
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = NOISE.SWEEP_MIN_FREQ;
    this.filterNode.Q.value = 1;

    // LFO to sweep the filter frequency (breathing effect)
    this.lfoNode = ctx.createOscillator();
    this.lfoNode.type = 'sine';
    this.lfoNode.frequency.value = 1000 / NOISE.SWEEP_DURATION; // Hz based on sweep duration

    // LFO gain to control sweep range
    this.lfoGainNode = ctx.createGain();
    const sweepRange = (NOISE.SWEEP_MAX_FREQ - NOISE.SWEEP_MIN_FREQ) / 2;
    this.lfoGainNode.gain.value = sweepRange;

    // Noise volume control
    this.noiseGainNode = ctx.createGain();
    this.noiseGainNode.gain.value = NOISE.GAIN;

    // Master output
    this.masterGainNode = ctx.createGain();
    this.masterGainNode.gain.value = 1;

    // Analyser for the Spectral Radar
    this.analyserNode = ctx.createAnalyser();
    this.analyserNode.fftSize = FFT_SIZE;
    this.analyserNode.smoothingTimeConstant = SMOOTHING;

    // Connect the graph
    // LFO → LFO Gain → Filter Frequency
    this.lfoNode.connect(this.lfoGainNode);
    this.lfoGainNode.connect(this.filterNode.frequency);

    // Noise → Filter → Noise Gain → Master → Analyser → Destination
    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.noiseGainNode);
    this.noiseGainNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.analyserNode);
    this.analyserNode.connect(ctx.destination);

    // Set filter center frequency
    const centerFreq = (NOISE.SWEEP_MAX_FREQ + NOISE.SWEEP_MIN_FREQ) / 2;
    this.filterNode.frequency.value = centerFreq;
  }

  /**
   * Start the EVP session (resume context and start LFO)
   */
  async startSession(): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }

    // DEBUG: Log AudioContext state before resume
    console.log('[Spirit Box DEBUG] AudioContext state BEFORE resume:', this.audioContext?.state);

    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
      console.log('[Spirit Box DEBUG] AudioContext state AFTER resume:', this.audioContext.state);
    }

    // DEBUG: Force master gain to 0.8 immediately
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = 0.8;
      console.log('[Spirit Box DEBUG] Master gain forced to 0.8');
    }

    if (this.lfoNode && !this.isRunning) {
      this.lfoNode.start();
      this.isRunning = true;
      console.log('[Spirit Box] Session started - the static awakens...');
      
      // DEBUG: Verify audio graph connection
      if (this.analyserNode && this.audioContext) {
        console.log('[Spirit Box DEBUG] ✅ Audio Graph Connected to Destination');
        console.log('[Spirit Box DEBUG] Graph: Noise → Filter → NoiseGain → MasterGain → Analyser → Destination');
      }
    }
  }

  /**
   * Stop the session and clean up
   */
  stopSession(): void {
    if (this.lfoNode && this.isRunning) {
      this.lfoNode.stop();
      this.isRunning = false;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.noiseNode = null;
    this.filterNode = null;
    this.lfoNode = null;
    this.lfoGainNode = null;
    this.noiseGainNode = null;
    this.masterGainNode = null;
    this.analyserNode = null;

    console.log('[Spirit Box] Session ended - silence returns...');
  }

  /**
   * Get the analyser node for the Spectral Radar
   */
  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  /**
   * Set noise volume (0.0 - 1.0)
   */
  setNoiseVolume(level: number): void {
    if (this.noiseGainNode) {
      this.noiseGainNode.gain.value = Math.max(0, Math.min(1, level));
    }
  }

  /**
   * Duck the noise for sidechaining when ghost speaks
   */
  duckNoise(duck: boolean): void {
    if (this.noiseGainNode) {
      const targetGain = duck ? AUDIO_CONFIG.SPEECH.SIDECHAIN_AMOUNT : AUDIO_CONFIG.NOISE.GAIN;
      this.noiseGainNode.gain.linearRampToValueAtTime(
        targetGain,
        (this.audioContext?.currentTime || 0) + 0.1
      );
    }
  }

  /**
   * Get the AudioContext for external use (TTS playback)
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Get master gain node for mixing ghost voice
   */
  getMasterGainNode(): GainNode | null {
    return this.masterGainNode;
  }

  /**
   * DEBUG: Play a test beep to verify audio graph is alive
   */
  playTestBeep(): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const beepGain = this.audioContext.createGain();
    
    oscillator.frequency.value = 440; // A4 note
    beepGain.gain.value = 0.3;
    
    oscillator.connect(beepGain);
    beepGain.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2);
    
    console.log('[Spirit Box DEBUG] 🔊 Test beep played (440Hz, 0.2s)');
  }

  /**
   * Get current audio context state for debugging
   */
  getDebugInfo(): { state: string; sampleRate: number; currentTime: number } | null {
    if (!this.audioContext) return null;
    
    return {
      state: this.audioContext.state,
      sampleRate: this.audioContext.sampleRate,
      currentTime: this.audioContext.currentTime,
    };
  }
}

// Singleton instance
export const audioGraphManager = new AudioGraphManager();
