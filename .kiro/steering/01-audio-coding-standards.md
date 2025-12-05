---
inclusion: fileMatch
fileMatchPattern: 'src/audio/**/*.ts'
---

# Audio Coding Standards

## WebAudio API Best Practices

### Node Graph Architecture

All audio processing must follow this pattern:

```typescript
Source → Processing → Gain → Analyser → Destination
```

**Rules:**
1. Always create nodes from `AudioContext`, never instantiate directly
2. Connect nodes in order before starting any sources
3. Use `GainNode` for volume control, never modify source directly
4. Always include an `AnalyserNode` for visualization
5. Clean up nodes on session end to prevent memory leaks

### AudioContext Lifecycle

```typescript
// CORRECT: Check state before operations
if (audioContext.state === 'suspended') {
  await audioContext.resume();
}

// CORRECT: Close context on cleanup
audioContext.close();
audioContext = null;
```

**Browser Autoplay Policy:**
- AudioContext starts in `suspended` state
- Must call `resume()` after user gesture (click/tap)
- Never assume context is running

### Noise Generation

**FRANKENSTEIN REQUIREMENT:** All noise must be synthesized from `Math.random()`, no pre-recorded audio.

```typescript
// CORRECT: Real-time synthesis
scriptProcessor.onaudioprocess = (e) => {
  const output = e.outputBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i++) {
    output[i] = Math.random() * 2 - 1; // White noise
  }
};

// WRONG: Using pre-recorded audio
const audio = new Audio('static.mp3'); // ❌ Violates Frankenstein concept
```

### Audio Constants

All audio parameters must be defined in `src/config/spectral-constants.ts`:

```typescript
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 44100,
  FFT_SIZE: 2048,
  SMOOTHING: 0.8,
  
  NOISE: {
    GAIN: 0.3,
    SWEEP_MIN_FREQ: 200,
    SWEEP_MAX_FREQ: 2000,
    SWEEP_DURATION: 10000,
    BUFFER_SIZE: 4096,
  },
  
  SPEECH: {
    REVERB_DECAY: 3.0,
    DISTORTION_AMOUNT: 0.8,
    SIDECHAIN_AMOUNT: 0.1,
  },
} as const;
```

**Never hardcode audio values in component files.**

### Sidechaining (Ducking)

When ghost speaks, duck the noise:

```typescript
// CORRECT: Smooth ramp to avoid clicks
noiseGainNode.gain.linearRampToValueAtTime(
  targetGain,
  audioContext.currentTime + 0.1
);

// WRONG: Instant change causes audio artifacts
noiseGainNode.gain.value = targetGain; // ❌ Causes clicks
```

### Analyser Node Usage

For visualizations (Spectral Radar, VU Meter):

```typescript
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048; // Must be power of 2
analyser.smoothingTimeConstant = 0.8; // 0-1, higher = smoother

const dataArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(dataArray); // Call in animation loop
```

### Error Handling

```typescript
try {
  await audioContext.resume();
} catch (error) {
  console.error('[Spirit Box] Audio error:', error);
  // Provide fallback or user feedback
}
```

### Debugging Audio Issues

Add debug methods to audio managers:

```typescript
getDebugInfo(): { state: string; sampleRate: number } {
  return {
    state: this.audioContext.state,
    sampleRate: this.audioContext.sampleRate,
  };
}
```

### Performance Considerations

1. Use `ScriptProcessorNode` for simple noise (deprecated but widely supported)
2. Consider `AudioWorklet` for production (requires separate file)
3. Limit FFT size to 2048 for real-time visualization
4. Disconnect unused nodes to free resources

## Frankenstein Stitching Comments

Mark audio stitching points with comments:

```typescript
// FRANKENSTEIN STITCHING POINT #1: Raw Audio Synthesis
// We're generating noise from scratch using Math.random()
```

This helps judges understand the "monster assembly" concept.
