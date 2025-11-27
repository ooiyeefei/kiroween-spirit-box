/**
 * FRANKENSTEIN STITCHING POINT #3: Audio Effect Chain
 * 
 * We take modern TTS output and run it through vintage-style
 * audio processors (convolution reverb, distortion) to make it
 * sound like it's coming from a 1970s radio or EVP device.
 */

import { AUDIO_CONFIG } from '../config/spectral-constants';

export class TTSService {
  private baseUrl = '/api/tts'; // Use our secure API route

  /**
   * Convert text to speech using OpenAI TTS API
   * Returns an AudioBuffer that can be processed through WebAudio
   */
  async synthesize(text: string, audioContext: AudioContext): Promise<AudioBuffer> {
    // DEBUG: Log AudioContext state
    console.log('[Spirit Box DEBUG] TTS synthesize called with AudioContext state:', audioContext.state);

    try {
      console.log('[Spirit Box DEBUG] 🌐 Fetching TTS from secure API route...');
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: 'onyx', // Deep, gravelly voice for the ghost
          speed: 0.75, // Much slower for eerie effect
        }),
      });

      console.log('[Spirit Box DEBUG] TTS API response status:', response.status);

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('[Spirit Box DEBUG] TTS ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log('[Spirit Box DEBUG] ✅ AudioBuffer decoded - Duration:', audioBuffer.duration.toFixed(2), 's, Channels:', audioBuffer.numberOfChannels);
      
      return audioBuffer;
    } catch (error) {
      console.error('[Spirit Box DEBUG] ❌ TTS error:', error);
      return this.browserTTSFallback(text, audioContext);
    }
  }

  /**
   * Fallback using browser's SpeechSynthesis
   * Returns a short silence buffer (browser TTS can't be captured into WebAudio)
   */
  private async browserTTSFallback(text: string, audioContext: AudioContext): Promise<AudioBuffer> {
    // Speak using browser TTS (won't go through effects, but at least audible)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 0.7;
      window.speechSynthesis.speak(utterance);
    }
    
    // Return a short silence buffer for timing
    const sampleRate = audioContext.sampleRate;
    const duration = 2; // 2 seconds
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    return buffer;
  }

  /**
   * Apply radio-like effects to the audio buffer
   */
  async applyGhostEffects(
    audioBuffer: AudioBuffer,
    audioContext: AudioContext
  ): Promise<{ source: AudioBufferSourceNode; duration: number }> {
    console.log('[Spirit Box DEBUG] 📻 Applying ghost effects to audio...');
    
    // Create source node
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Lower the playback rate to make voice deeper and slower
    source.playbackRate.value = 0.85; // Deeper, slower voice

    // Create a low-pass filter to muffle the voice (radio effect)
    const lowPassFilter = audioContext.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.value = 2000; // Cut high frequencies
    lowPassFilter.Q.value = 1;

    // Create distortion curve for that "radio static" feel
    const distortion = audioContext.createWaveShaper();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    distortion.curve = this.makeDistortionCurve(AUDIO_CONFIG.SPEECH.DISTORTION_AMOUNT * 400) as any;
    distortion.oversample = '4x';

    // Create convolver for reverb (we'll use a simple impulse response)
    const convolver = audioContext.createConvolver();
    convolver.buffer = this.createReverbImpulse(audioContext);

    // Create gain for the processed signal (more wet for ghostly effect)
    const wetGain = audioContext.createGain();
    wetGain.gain.value = 0.85; // More reverb

    const dryGain = audioContext.createGain();
    dryGain.gain.value = 0.15; // Less dry signal

    // Connect: Source → LowPass → Distortion → Convolver → Wet Gain → Destination
    //          Source → LowPass → Dry Gain → Destination
    source.connect(lowPassFilter);
    lowPassFilter.connect(distortion);
    distortion.connect(convolver);
    convolver.connect(wetGain);
    wetGain.connect(audioContext.destination);

    lowPassFilter.connect(dryGain);
    dryGain.connect(audioContext.destination);

    console.log('[Spirit Box DEBUG] ✅ Ghost effects applied (lowpass, distortion, reverb)');

    return { source, duration: audioBuffer.duration / source.playbackRate.value };
  }

  /**
   * Create a distortion curve for the WaveShaperNode
   */
  private makeDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }

    return curve;
  }

  /**
   * Create a simple reverb impulse response
   */
  private createReverbImpulse(audioContext: AudioContext): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * AUDIO_CONFIG.SPEECH.REVERB_DECAY;
    const impulse = audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponential decay with random noise
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    return impulse;
  }
}

export const ttsService = new TTSService();
