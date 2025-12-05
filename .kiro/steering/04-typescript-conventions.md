---
inclusion: always
---

# TypeScript Conventions

## Type Definitions

### Centralized Types

All shared types must be defined in `src/types/index.ts`:

```typescript
// src/types/index.ts
export interface EVPSession {
  status: 'inactive' | 'active' | 'processing' | 'responding';
  transcript: TranscriptEntry[];
  currentEntropy: number | null;
  debugMode: boolean;
}

export interface TranscriptEntry {
  id: string;
  timestamp: number;
  speaker: 'user' | 'spirit';
  text: string;
  entropyReading?: number;
}

export interface SpectralReading {
  value: number;
  source: 'nasa' | 'fallback';
  timestamp: number;
}

export interface EntropyGateResult {
  respond: boolean;
  reading: SpectralReading;
}
```

**Rule:** Never define shared types inline in components.

## Strict Type Safety

### tsconfig.json Settings

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Null Safety

```typescript
// CORRECT: Check for null
if (audioContext) {
  audioContext.resume();
}

// CORRECT: Optional chaining
audioContext?.resume();

// WRONG: Assume non-null
audioContext.resume(); // ❌ May be null
```

### Type Guards

```typescript
function isSpectralReading(obj: unknown): obj is SpectralReading {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'value' in obj &&
    typeof obj.value === 'number'
  );
}

// Usage
if (isSpectralReading(data)) {
  console.log(data.value); // TypeScript knows data is SpectralReading
}
```

## API Response Types

### OpenAI API

```typescript
interface OpenAIChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Usage
const data: OpenAIChatResponse = await response.json();
const ghostResponse = data.choices[0]?.message?.content || fallback;
```

### NASA DONKI API

```typescript
interface GeomagneticStorm {
  gstID: string;
  startTime: string;
  kpIndex?: number;
  link: string;
}

type GeomagneticStormResponse = GeomagneticStorm[];
```

## WebAudio API Types

### Node Types

```typescript
// CORRECT: Explicit types
private audioContext: AudioContext | null = null;
private noiseNode: ScriptProcessorNode | null = null;
private filterNode: BiquadFilterNode | null = null;
private analyserNode: AnalyserNode | null = null;

// WRONG: Implicit any
private audioContext; // ❌ Type is 'any'
```

### Return Types

```typescript
// CORRECT: Explicit return type
getAnalyserNode(): AnalyserNode | null {
  return this.analyserNode;
}

// CORRECT: Promise return type
async initialize(): Promise<AudioContext> {
  // ...
  return this.audioContext;
}
```

## React Component Types

### Props Interface

```typescript
interface SpectralRadarProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
  size?: number; // Optional with default
}

export function SpectralRadar({ 
  analyserNode, 
  isActive, 
  size = 300 
}: SpectralRadarProps) {
  // ...
}
```

### Event Handlers

```typescript
interface SpiritBoxControlsProps {
  status: EVPSession['status'];
  onStart: () => void;
  onStop: () => void;
}

// Usage
<button onClick={onStart}>START</button>
```

### Ref Types

```typescript
const canvasRef = useRef<HTMLCanvasElement>(null);
const recognitionRef = useRef<SpeechRecognition | null>(null);

// Usage
if (canvasRef.current) {
  const ctx = canvasRef.current.getContext('2d');
}
```

## Hook Return Types

### Custom Hook

```typescript
interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  // ...
  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
```

## Const Assertions

### Audio Config

```typescript
// CORRECT: Use 'as const' for immutable config
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 44100,
  FFT_SIZE: 2048,
  NOISE: {
    GAIN: 0.3,
  },
} as const;

// Type is: { readonly SAMPLE_RATE: 44100, ... }

// WRONG: Mutable config
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 44100, // Type is: number (can be changed)
};
```

## Enum vs Union Types

### Prefer Union Types

```typescript
// CORRECT: Union type (more flexible)
type SessionStatus = 'inactive' | 'active' | 'processing' | 'responding';

// AVOID: Enum (adds runtime code)
enum SessionStatus {
  Inactive = 'inactive',
  Active = 'active',
  Processing = 'processing',
  Responding = 'responding',
}
```

**Exception:** Use enums when you need reverse mapping.

## Generic Types

### Service Classes

```typescript
class APIService<TRequest, TResponse> {
  async call(request: TRequest): Promise<TResponse> {
    // ...
  }
}

// Usage
const llmService = new APIService<ChatRequest, ChatResponse>();
```

## Type Utilities

### Partial Updates

```typescript
// Update session with partial data
setSession((prev) => ({
  ...prev,
  ...updates, // Partial<EVPSession>
}));
```

### Pick and Omit

```typescript
// Extract subset of type
type TranscriptMetadata = Pick<TranscriptEntry, 'id' | 'timestamp'>;

// Exclude properties
type TranscriptWithoutId = Omit<TranscriptEntry, 'id'>;
```

## Error Types

### Custom Error Classes

```typescript
class AudioInitializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AudioInitializationError';
  }
}

// Usage
throw new AudioInitializationError('Failed to create AudioContext');
```

### Error Handling

```typescript
try {
  await audioContext.resume();
} catch (error) {
  if (error instanceof DOMException) {
    console.error('[Spirit Box] Browser blocked audio:', error.message);
  } else {
    console.error('[Spirit Box] Unknown error:', error);
  }
}
```

## Type Assertions

### Use Sparingly

```typescript
// CORRECT: When you know more than TypeScript
const recognition = new (window as any).webkitSpeechRecognition();

// CORRECT: Non-null assertion when guaranteed
const ctx = canvasRef.current!.getContext('2d')!;

// WRONG: Overuse of 'any'
const data: any = await response.json(); // ❌ Loses type safety
```

## Documentation Comments

### JSDoc for Public APIs

```typescript
/**
 * Generate a paranormal response from Cornelius Blackwood
 * 
 * @param userQuestion - The question from the living
 * @param entropyLevel - Spectral energy level (0.0 - 1.0)
 * @returns Ghost response (under 15 words)
 * @throws {Error} If API call fails
 */
async generateResponse(
  userQuestion: string, 
  entropyLevel: number
): Promise<string> {
  // ...
}
```

## Import Organization

### Order

```typescript
// 1. React imports
import { useState, useCallback, useEffect } from 'react';

// 2. Third-party imports
import { someLibrary } from 'some-library';

// 3. Local components
import { SpectralRadar } from './ui/components/SpectralRadar';

// 4. Local services
import { audioGraphManager } from './audio/AudioGraphManager';

// 5. Types
import type { EVPSession, TranscriptEntry } from './types';

// 6. Constants
import { AUDIO_CONFIG } from './config/spectral-constants';
```

## Avoid Type Pollution

```typescript
// CORRECT: Scoped types
namespace Audio {
  export interface Config {
    sampleRate: number;
  }
}

// WRONG: Global type pollution
interface Config { // ❌ Too generic, conflicts with other Config types
  sampleRate: number;
}
```

## Type-Safe Event Emitters

```typescript
type EventMap = {
  'session-start': void;
  'session-stop': void;
  'ghost-response': { text: string; entropy: number };
};

class EventEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    // ...
  }
}

// Usage
const emitter = new EventEmitter<EventMap>();
emitter.on('ghost-response', (data) => {
  console.log(data.text); // TypeScript knows data has 'text' and 'entropy'
});
```
