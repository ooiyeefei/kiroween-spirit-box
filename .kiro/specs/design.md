# Design Document
## Project: The Spirit Box (Frankenstein Category)

## 1. Overview

The Spirit Box is a browser-based paranormal investigation tool that demonstrates "Frankenstein" architecture by stitching together three disparate technologies:

1. **Raw Audio Synthesis** (WebAudio API) - Analog-style noise generation
2. **Modern AI Intelligence** (LLM via MCP) - Paranormal response generation
3. **Browser Native APIs** (Speech Recognition, Canvas, TTS) - User interaction layer

### Technology Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Audio Processing:** WebAudio API (native)
- **Speech Input:** Web Speech API (SpeechRecognition)
- **Speech Output:** OpenAI TTS API + ConvolverNode
- **LLM Integration:** OpenAI API via MCP
- **Visualization:** HTML5 Canvas (Spectral Radar)
- **Styling:** Tailwind CSS with custom animations

## 2. Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Spirit Box UI                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Controls   │  │ Spectral     │  │  Transcript  │      │
│  │   (Start/    │  │ Radar        │  │  Display     │      │
│  │    Stop)     │  │ (Canvas)     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Audio Graph Manager                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WhiteNoise → BiquadFilter (LFO Sweep) → GainNode   │   │
│  │       ↓                                      ↓       │   │
│  │  AnalyserNode                          Destination  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Speech Pipeline                           │
│                                                               │
│  Microphone → SpeechRecognition → Transcript                │
│                                        ↓                      │
│                                   MCP Client                 │
│                                        ↓                      │
│                              get_spectral_reading()          │
│                                        ↓                      │
│                            [Entropy Check: >= 0.5?]          │
│                                   ↙        ↘                 │
│                              YES              NO              │
│                               ↓               ↓              │
│                          LLM API      "No presence..."       │
│                               ↓                              │
│                      OpenAI TTS API                          │
│                               ↓                              │
│                      ConvolverNode (Radio Effect)            │
│                               ↓                              │
│                      Mix with Noise + Sidechain              │
│                               ↓                              │
│                      Audio Output + Visual Distortion        │
└─────────────────────────────────────────────────────────────┘
```

### Module Structure

```
src/
├── audio/
│   ├── AudioGraphManager.ts      # Core WebAudio node orchestration
│   ├── NoiseGenerator.ts         # White noise synthesis via ScriptProcessor
│   └── AnalyserBridge.ts         # FFT data extraction for visualizer
├── medium/
│   ├── MCPClient.ts              # MCP protocol communication
│   ├── LLMService.ts             # OpenAI API wrapper
│   ├── TTSService.ts             # OpenAI TTS API wrapper
│   └── EntropyGate.ts            # Logic for spectral reading threshold
├── ui/
│   ├── components/
│   │   ├── SpiritBoxControls.tsx # Start/Stop session buttons
│   │   ├── SpectralRadar.tsx     # Canvas-based visualizer
│   │   ├── TranscriptDisplay.tsx # Speech-to-text output
│   │   └── App.tsx               # Main application shell
│   └── hooks/
│       ├── useAudioSession.ts    # Audio graph lifecycle
│       ├── useSpeechRecognition.ts # STT integration
│       └── useSpectralData.ts    # Analyser node data stream
├── config/
│   └── spectral-constants.ts     # Audio parameters (frequencies, gains)
└── types/
    └── index.ts                  # TypeScript interfaces
```

## 3. Components and Interfaces

### 3.1 Audio Graph Manager

**Purpose:** Orchestrates the WebAudio node graph for real-time noise synthesis.

**Interface:**
```typescript
interface AudioGraphManager {
  initialize(): Promise<AudioContext>;
  startSession(): void;
  stopSession(): void;
  getAnalyserNode(): AnalyserNode;
  setNoiseVolume(level: number): void;
  playGhostVoice(audioBuffer: AudioBuffer): Promise<void>;
}
```

**Node Graph:**
```
WhiteNoiseNode (ScriptProcessor)
    ↓
BiquadFilter (LowPass with LFO sweep)
    ↓
NoiseGainNode
    ↓         ↘
AnalyserNode  MasterGainNode → Destination
```

### 3.2 MCP Client

**Purpose:** Communicates with The Veil MCP server to retrieve entropy readings.

**Interface:**
```typescript
interface MCPClient {
  getSpectralReading(): Promise<number>; // Returns 0.0 - 1.0
}
```

**Entropy Gate Logic:**
```typescript
async function shouldGhostRespond(): Promise<boolean> {
  const reading = await mcpClient.getSpectralReading();
  return reading >= 0.5;
}
```

### 3.3 LLM Service

**Purpose:** Generates paranormal-themed responses via OpenAI API.

**System Prompt:**
```
You are the restless spirit of Cornelius Blackwood, a Victorian-era mechanic who died in 1887. 
You communicate through an EVP device. Your responses are:
- Cryptic and fragmented (under 15 words)
- Confused about modern technology
- Obsessed with gears, steam, and machinery
- Never helpful or cheerful
```

### 3.4 TTS Service

**Purpose:** Converts LLM text to audio via OpenAI TTS API.

**Interface:**
```typescript
interface TTSService {
  synthesize(text: string): Promise<AudioBuffer>;
}
```

**Audio Processing Chain:**
```
TTS AudioBuffer → ConvolverNode (Radio IR) → WaveShaperNode (Distortion) → Output
```

### 3.5 Spectral Radar

**Purpose:** Canvas-based visualizer that reacts to audio amplitude.

**Rendering Logic:**
- 60 FPS animation loop
- Sweeping line rotates 360° every 3 seconds
- Bass frequencies (0-200Hz) trigger glowing spikes
- Green phosphor glow aesthetic

### 3.6 Manifestation Effect

**Purpose:** CSS visual distortion during ghost responses.

**CSS:**
```css
.manifesting {
  backdrop-filter: blur(4px) hue-rotate(90deg);
  transition: backdrop-filter 0.5s ease-in-out;
}
```

## 4. Data Models

### 4.1 EVP Session State

```typescript
interface EVPSession {
  status: 'inactive' | 'active' | 'processing' | 'responding';
  transcript: TranscriptEntry[];
  currentEntropy: number | null;
  debugMode: boolean;
}

interface TranscriptEntry {
  timestamp: number;
  speaker: 'user' | 'spirit';
  text: string;
  entropyReading?: number;
}
```

### 4.2 Audio Configuration

```typescript
// src/config/spectral-constants.ts
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 44100,
  FFT_SIZE: 2048,
  SMOOTHING: 0.8,
  
  NOISE: {
    GAIN: 0.3,
    SWEEP_MIN_FREQ: 200,
    SWEEP_MAX_FREQ: 2000,
    SWEEP_DURATION: 10000,
  },
  
  SPEECH: {
    REVERB_DECAY: 3.0,
    DISTORTION_AMOUNT: 0.8,
  },
  
  RADAR: {
    FPS: 60,
    SWEEP_DURATION: 3000,
    SPIKE_THRESHOLD: 128,
  }
} as const;
```

## 5. Error Handling

- **AudioContext suspended:** Wait for user gesture to resume
- **Speech Recognition unsupported:** Show text input fallback
- **MCP unavailable:** Use Math.random() fallback for entropy
- **LLM API error:** Return fallback response "The veil... is too thick..."
- **TTS API error:** Skip audio, show text only

## 6. Testing Strategy

### Unit Tests
- AudioContext initializes in suspended state
- Entropy gate blocks responses below 0.5
- Node connections established correctly

### Integration Tests
- Mock high entropy → verify manifestation CSS applied
- Mock low entropy → verify "No presence" message

### Manual Testing
- Debug Mode toggle to force ghost presence
- Critical for 3-minute demo video

## 7. Frankenstein Demonstration

### Code Comments at Stitching Points
```typescript
// FRANKENSTEIN STITCHING POINT #1: Raw Audio Synthesis
// We're generating noise from scratch using Math.random()

// FRANKENSTEIN STITCHING POINT #2: MCP Entropy Gate
// External entropy source decides if ghost speaks

// FRANKENSTEIN STITCHING POINT #3: Audio Effect Chain
// Modern TTS through vintage-style audio processors
```

### UI Data Flow Diagram
Display visual pipeline for judges:
```
🎤 Voice → 📝 Text → 🌀 MCP Gate → 🤖 LLM → 🔊 TTS → 📻 Radio FX → 👻 Ghost
```
