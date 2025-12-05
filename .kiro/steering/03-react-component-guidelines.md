---
inclusion: fileMatch
fileMatchPattern: 'src/ui/**/*.tsx'
---

# React Component Guidelines

## Component Architecture

### Separation of Concerns

```
src/ui/
├── components/       # Presentational components
│   ├── SpectralRadar.tsx
│   ├── SpiritBoxControls.tsx
│   ├── TranscriptDisplay.tsx
│   └── VUMeter.tsx
└── hooks/           # Business logic hooks
    ├── useSpeechRecognition.ts
    └── useAudioSession.ts
```

**Rule:** Components handle rendering, hooks handle logic.

## State Management Pattern

### EVP Session State

```typescript
interface EVPSession {
  status: 'inactive' | 'active' | 'processing' | 'responding';
  transcript: TranscriptEntry[];
  currentEntropy: number | null;
  debugMode: boolean;
}

interface TranscriptEntry {
  id: string;
  timestamp: number;
  speaker: 'user' | 'spirit';
  text: string;
  entropyReading?: number;
}
```

**Use this exact structure** - it's designed for the pipeline flow.

### State Updates

```typescript
// CORRECT: Immutable updates
setSession((prev) => ({
  ...prev,
  status: 'processing',
  transcript: [...prev.transcript, newEntry],
}));

// WRONG: Direct mutation
session.transcript.push(newEntry); // ❌ Breaks React
```

## Manifestation Effect

**FRANKENSTEIN REQUIREMENT:** CSS distortion when ghost speaks.

```typescript
const [isManifesting, setIsManifesting] = useState(false);

// In JSX
<div className={`app-container ${isManifesting ? 'manifesting' : ''}`}>
  {/* content */}
</div>
```

```css
/* In CSS */
.manifesting {
  backdrop-filter: blur(4px) hue-rotate(90deg);
  transition: backdrop-filter 0.5s ease-in-out;
}
```

**Timing:**
- Set `isManifesting = true` when LLM responds
- Set `isManifesting = false` after TTS audio finishes

## Canvas Visualization Pattern

### Spectral Radar

```typescript
useEffect(() => {
  if (!analyserNode || !isActive) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

  let animationId: number;

  const draw = () => {
    analyserNode.getByteFrequencyData(dataArray);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw visualization
    // ... rendering logic ...
    
    animationId = requestAnimationFrame(draw);
  };

  draw();

  return () => cancelAnimationFrame(animationId);
}, [analyserNode, isActive]);
```

**Key Points:**
1. Check if `analyserNode` exists before drawing
2. Use `requestAnimationFrame` for smooth 60fps
3. Clean up animation on unmount
4. Create new `Uint8Array` per component, not per frame

## Speech Recognition Hook

### Pattern

```typescript
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('[Spirit Box] Speech Recognition not supported');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  }, []);

  const startListening = () => {
    recognitionRef.current?.start();
    setIsListening(true);
  };

  return { transcript, isListening, startListening };
}
```

**Browser Compatibility:**
- Chrome: `webkitSpeechRecognition`
- Firefox: Requires polyfill
- Safari: `webkitSpeechRecognition`

## Pipeline Processing Pattern

### Question → Entropy → LLM → TTS → Audio

```typescript
const processQuestion = useCallback(async (question: string) => {
  if (session.status !== 'active') return;

  // 1. Add user entry
  const userEntry: TranscriptEntry = {
    id: `user-${Date.now()}`,
    timestamp: Date.now(),
    speaker: 'user',
    text: question,
  };

  setSession((prev) => ({
    ...prev,
    status: 'processing',
    transcript: [...prev.transcript, userEntry],
  }));

  try {
    // 2. Check entropy gate
    const { respond, reading } = await entropyGate.shouldGhostRespond();
    
    if (!respond) {
      // No presence
      return;
    }

    // 3. Get LLM response
    setSession((prev) => ({ ...prev, status: 'responding' }));
    setIsManifesting(true);
    
    const ghostResponse = await llmService.generateResponse(question, reading.value);

    // 4. Synthesize speech
    const audioBuffer = await ttsService.synthesize(ghostResponse, audioContext);
    const { source, duration } = await ttsService.applyGhostEffects(audioBuffer, audioContext);
    
    source.start();
    await new Promise((resolve) => setTimeout(resolve, duration * 1000));

    // 5. Add ghost entry
    const spiritEntry: TranscriptEntry = {
      id: `spirit-${Date.now()}`,
      timestamp: Date.now(),
      speaker: 'spirit',
      text: ghostResponse,
      entropyReading: reading.value,
    };

    setSession((prev) => ({
      ...prev,
      status: 'active',
      transcript: [...prev.transcript, spiritEntry],
    }));
  } finally {
    setIsManifesting(false);
  }
}, [session.status]);
```

**Critical:** Always wrap in try/finally to reset `isManifesting`.

## Styling Guidelines

### Tailwind CSS Classes

```typescript
// CORRECT: Conditional classes
className={`base-class ${condition ? 'active-class' : 'inactive-class'}`}

// CORRECT: Multiple conditions
className={`
  base-class
  ${isActive && 'active-class'}
  ${isError && 'error-class'}
`}
```

### Paranormal Aesthetic

**Color Palette:**
- Background: `bg-neutral-900` (dark)
- Primary: `text-green-500` (phosphor green)
- Secondary: `text-gray-500`
- Accents: `text-green-400`

**Effects:**
- Glow: `drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]`
- Pulse: `animate-pulse`
- Transitions: `transition-all duration-500`

### Typography

```typescript
<h1 className="text-4xl font-creepster text-green-500">
  👻 THE SPIRIT BOX
</h1>
```

**Font:** Use `font-creepster` for titles (loaded via CDN in index.html)

## Performance Optimization

### Memoization

```typescript
// Memoize expensive callbacks
const processQuestion = useCallback(async (question: string) => {
  // ... processing logic ...
}, [session.status]); // Only recreate if status changes

// Memoize derived values
const activeTranscript = useMemo(
  () => session.transcript.filter((entry) => entry.speaker === 'spirit'),
  [session.transcript]
);
```

### Avoid Re-renders

```typescript
// CORRECT: Separate state for independent updates
const [isManifesting, setIsManifesting] = useState(false);
const [session, setSession] = useState<EVPSession>({ /* ... */ });

// WRONG: Nested state causes unnecessary re-renders
const [state, setState] = useState({ isManifesting: false, session: { /* ... */ } });
```

## Accessibility

### Keyboard Navigation

```typescript
<button
  onClick={handleStart}
  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
  aria-label="Start EVP session"
>
  START SESSION
</button>
```

### Screen Reader Support

```typescript
<div role="log" aria-live="polite" aria-atomic="false">
  {transcript.map((entry) => (
    <div key={entry.id} aria-label={`${entry.speaker}: ${entry.text}`}>
      {entry.text}
    </div>
  ))}
</div>
```

## Error Boundaries

Wrap main app in error boundary:

```typescript
<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

## Testing Considerations

### Component Testing

```typescript
// Test user interactions
fireEvent.click(screen.getByText('START SESSION'));
expect(audioGraphManager.startSession).toHaveBeenCalled();

// Test state updates
await waitFor(() => {
  expect(screen.getByText('No presence detected')).toBeInTheDocument();
});
```

### Mock Audio APIs

```typescript
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn(),
  createGain: jest.fn(),
  // ... other methods
}));
```
