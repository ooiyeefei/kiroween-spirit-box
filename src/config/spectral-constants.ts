/**
 * FRANKENSTEIN STITCHING POINT: Configuration
 * These constants define the "Ghost Frequencies" - the parameters
 * that make our synthesized audio feel analog and paranormal.
 */

export const AUDIO_CONFIG = {
  SAMPLE_RATE: 44100,
  FFT_SIZE: 2048,
  SMOOTHING: 0.8,
  
  NOISE: {
    /** Base gain for white noise (0.0 - 1.0) */
    GAIN: 0.3,
    /** Minimum frequency for filter sweep (Hz) */
    SWEEP_MIN_FREQ: 200,
    /** Maximum frequency for filter sweep (Hz) */
    SWEEP_MAX_FREQ: 2000,
    /** Duration of one complete sweep cycle (ms) */
    SWEEP_DURATION: 10000,
    /** Buffer size for ScriptProcessor */
    BUFFER_SIZE: 4096,
  },
  
  SPEECH: {
    /** Reverb decay time (seconds) */
    REVERB_DECAY: 3.0,
    /** Distortion curve amount (0.0 - 1.0) */
    DISTORTION_AMOUNT: 0.8,
    /** How much to duck noise when ghost speaks (0.0 - 1.0) */
    SIDECHAIN_AMOUNT: 0.3,
  },
  
  RADAR: {
    /** Target frames per second */
    FPS: 60,
    /** Time for one complete radar sweep (ms) */
    SWEEP_DURATION: 3000,
    /** Amplitude threshold for spike detection (0-255) */
    SPIKE_THRESHOLD: 128,
    /** Number of frequency bins to analyze for bass */
    BASS_BINS: 20,
  },
  
  ENTROPY: {
    /** Threshold for ghost to respond (0.0 - 1.0) */
    PRESENCE_THRESHOLD: 0.45,
    /** Debug mode override value */
    DEBUG_VALUE: 0.85,
  },
} as const;

/** Victorian Mechanic persona for the ghost */
export const GHOST_PERSONA = `You are the restless spirit of Cornelius Blackwood, a Victorian-era mechanic who died in 1887 in a tragic workshop accident.
You communicate through an EVP device from beyond the veil. Your responses MUST be:
- EXTREMELY cryptic and fragmented (maximum 12 words, use ellipses "..." frequently)
- Written in ALL CAPS to emphasize the otherworldly nature
- Confused about modern technology (you died in 1887)
- Obsessed with gears, steam, machinery, and your workshop
- Dark, ominous, and never helpful
- Use archaic Victorian language ("thee", "thy", "whomst", "dare")
- Reference your death, the darkness, cold, or being trapped

Example responses:
"WHO DARES DISTURB... THE GEARS STILL TURN..."
"COLD... SO COLD IN THE WORKSHOP..."
"THE STEAM... IT BURNS... FOREVER..."
"WHOMST CALLS TO THE SHADOWS...?"
"MACHINERY... ETERNAL... NEVER STOPS..."
"THY WORLD... STRANGE... BRIGHT LIGHTS..."

Remember: You are NOT an assistant. You are a confused, tormented spirit speaking through static.`;

export type AudioConfig = typeof AUDIO_CONFIG;
