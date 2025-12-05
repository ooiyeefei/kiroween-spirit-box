---
inclusion: manual
---

# Testing Strategy

## Testing Philosophy

The Spirit Box uses a pragmatic testing approach:

1. **Unit Tests** - Core logic and utilities
2. **Integration Tests** - Component interactions
3. **Manual Testing** - Audio and visual effects (hard to automate)

**Note:** Property-based testing is not applicable for this project (no complex data transformations or parsers).

## Unit Testing

### Audio Graph Manager

```typescript
// AudioGraphManager.test.ts
describe('AudioGraphManager', () => {
  let manager: AudioGraphManager;

  beforeEach(() => {
    manager = new AudioGraphManager();
  });

  test('AudioContext starts in suspended state', async () => {
    const ctx = await manager.initialize();
    expect(ctx.state).toBe('suspended');
  });

  test('startSession resumes AudioContext', async () => {
    await manager.initialize();
    await manager.startSession();
    
    const ctx = manager.getAudioContext();
    expect(ctx?.state).toBe('running');
  });

  test('getAnalyserNode returns null before initialization', () => {
    expect(manager.getAnalyserNode()).toBeNull();
  });

  test('getAnalyserNode returns AnalyserNode after initialization', async () => {
    await manager.initialize();
    const analyser = manager.getAnalyserNode();
    expect(analyser).toBeInstanceOf(AnalyserNode);
  });

  test('stopSession cleans up resources', async () => {
    await manager.initialize();
    await manager.startSession();
    manager.stopSession();
    
    expect(manager.getAudioContext()).toBeNull();
    expect(manager.getAnalyserNode()).toBeNull();
  });
});
```

### Entropy Gate

```typescript
// SpectralEntropyService.test.ts
describe('SpectralEntropyService', () => {
  let service: SpectralEntropyService;

  beforeEach(() => {
    service = new SpectralEntropyService();
  });

  test('shouldGhostRespond returns false for low entropy', async () => {
    // Mock low entropy
    jest.spyOn(service as any, 'getSpectralReading').mockResolvedValue({
      value: 0.3,
      source: 'nasa',
      timestamp: Date.now(),
    });

    const result = await service.shouldGhostRespond();
    expect(result.respond).toBe(false);
  });

  test('shouldGhostRespond returns true for high entropy', async () => {
    // Mock high entropy
    jest.spyOn(service as any, 'getSpectralReading').mockResolvedValue({
      value: 0.8,
      source: 'nasa',
      timestamp: Date.now(),
    });

    const result = await service.shouldGhostRespond();
    expect(result.respond).toBe(true);
  });

  test('threshold is exactly 0.5', async () => {
    jest.spyOn(service as any, 'getSpectralReading').mockResolvedValue({
      value: 0.5,
      source: 'nasa',
      timestamp: Date.now(),
    });

    const result = await service.shouldGhostRespond();
    expect(result.respond).toBe(true); // >= 0.5
  });

  test('uses fallback when NASA API fails', async () => {
    jest.spyOn(service as any, 'fetchGeomagneticStorms').mockRejectedValue(
      new Error('API error')
    );

    const result = await service.shouldGhostRespond();
    expect(result.reading.source).toBe('fallback');
  });
});
```

### LLM Service

```typescript
// LLMService.test.ts
describe('LLMService', () => {
  let service: LLMService;

  beforeEach(() => {
    service = new LLMService();
  });

  test('generateResponse returns fallback on API error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const response = await service.generateResponse('test question', 0.8);
    expect(response).toMatch(/veil|gears|steam|cold|machine/i);
  });

  test('generateResponse includes entropy in prompt', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Test response' } }],
      }),
    });
    global.fetch = mockFetch;

    await service.generateResponse('test', 0.75);

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.messages[1].content).toContain('0.75');
  });
});
```

## Integration Testing

### Pipeline Flow

```typescript
// Pipeline.test.ts
describe('Question Processing Pipeline', () => {
  test('low entropy blocks LLM call', async () => {
    const mockEntropyGate = {
      shouldGhostRespond: jest.fn().mockResolvedValue({
        respond: false,
        reading: { value: 0.3, source: 'nasa', timestamp: Date.now() },
      }),
    };

    const mockLLMService = {
      generateResponse: jest.fn(),
    };

    // Process question
    const result = await processQuestion('test', mockEntropyGate, mockLLMService);

    expect(mockEntropyGate.shouldGhostRespond).toHaveBeenCalled();
    expect(mockLLMService.generateResponse).not.toHaveBeenCalled();
    expect(result.text).toBe('No presence detected...');
  });

  test('high entropy triggers LLM call', async () => {
    const mockEntropyGate = {
      shouldGhostRespond: jest.fn().mockResolvedValue({
        respond: true,
        reading: { value: 0.8, source: 'nasa', timestamp: Date.now() },
      }),
    };

    const mockLLMService = {
      generateResponse: jest.fn().mockResolvedValue('The gears turn...'),
    };

    const result = await processQuestion('test', mockEntropyGate, mockLLMService);

    expect(mockLLMService.generateResponse).toHaveBeenCalledWith('test', 0.8);
    expect(result.text).toBe('The gears turn...');
  });
});
```

### Component Integration

```typescript
// App.test.tsx
describe('App Integration', () => {
  test('clicking START initializes audio and starts listening', async () => {
    render(<App />);
    
    const startButton = screen.getByText('START SESSION');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(audioGraphManager.initialize).toHaveBeenCalled();
      expect(audioGraphManager.startSession).toHaveBeenCalled();
    });
  });

  test('manifestation effect applies during ghost response', async () => {
    render(<App />);
    
    // Start session
    fireEvent.click(screen.getByText('START SESSION'));

    // Trigger ghost response (mock high entropy)
    // ... test logic ...

    await waitFor(() => {
      const container = screen.getByTestId('app-container');
      expect(container).toHaveClass('manifesting');
    });
  });
});
```

## Mock Setup

### WebAudio API Mocks

```typescript
// setupTests.ts
global.AudioContext = jest.fn().mockImplementation(() => ({
  state: 'suspended',
  sampleRate: 44100,
  currentTime: 0,
  destination: {},
  
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0 },
  })),
  
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { value: 1, linearRampToValueAtTime: jest.fn() },
  })),
  
  createBiquadFilter: jest.fn(() => ({
    connect: jest.fn(),
    type: 'lowpass',
    frequency: { value: 0 },
    Q: { value: 1 },
  })),
  
  createAnalyser: jest.fn(() => ({
    connect: jest.fn(),
    fftSize: 2048,
    frequencyBinCount: 1024,
    smoothingTimeConstant: 0.8,
    getByteFrequencyData: jest.fn(),
  })),
  
  createScriptProcessor: jest.fn(() => ({
    connect: jest.fn(),
    onaudioprocess: null,
  })),
  
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  decodeAudioData: jest.fn().mockResolvedValue({}),
}));
```

### Speech Recognition Mock

```typescript
global.webkitSpeechRecognition = jest.fn().mockImplementation(() => ({
  continuous: false,
  interimResults: false,
  onresult: null,
  onend: null,
  onerror: null,
  start: jest.fn(),
  stop: jest.fn(),
}));
```

### Fetch Mock

```typescript
global.fetch = jest.fn((url) => {
  if (url.includes('/api/chat')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Mock response' } }],
      }),
    });
  }
  
  if (url.includes('nasa.gov')) {
    return Promise.resolve({
      ok: true,
      json: async () => ([
        {
          gstID: 'GST-001',
          startTime: '2024-12-05T00:00Z',
          allKpIndex: [{ kpIndex: 5, observedTime: '2024-12-05T00:00Z' }],
        },
      ]),
    });
  }
  
  return Promise.reject(new Error('Unknown URL'));
});
```

## Manual Testing Checklist

### Audio Testing

- [ ] White noise plays when session starts
- [ ] Noise has "analog" quality (not digital/harsh)
- [ ] Filter sweep is audible (frequency changes over time)
- [ ] Noise ducks when ghost speaks
- [ ] Ghost voice has reverb effect
- [ ] Ghost voice has distortion (radio quality)
- [ ] No audio clicks or pops during transitions

### Visual Testing

- [ ] Spectral Radar animates smoothly (60fps)
- [ ] Radar reacts to audio amplitude
- [ ] VU Meter shows audio levels
- [ ] Manifestation effect (blur + hue-rotate) triggers during ghost response
- [ ] Transcript scrolls automatically
- [ ] Listening indicator pulses when active

### Interaction Testing

- [ ] START button initializes session
- [ ] STOP button ends session and cleans up
- [ ] Speech recognition captures voice input
- [ ] Text input fallback works
- [ ] Low entropy shows "No presence detected"
- [ ] High entropy triggers ghost response
- [ ] Multiple questions work in sequence

### Browser Compatibility

- [ ] Chrome (recommended)
- [ ] Firefox (with speech polyfill)
- [ ] Safari (WebAudio + webkit speech)

### Error Scenarios

- [ ] NASA API failure → fallback entropy
- [ ] OpenAI API failure → fallback response
- [ ] No microphone → text input fallback
- [ ] AudioContext blocked → shows error message

## Performance Testing

### Metrics to Monitor

```typescript
// Performance logging
console.time('[Spirit Box] LLM Response');
const response = await llmService.generateResponse(question, entropy);
console.timeEnd('[Spirit Box] LLM Response');

console.time('[Spirit Box] TTS Synthesis');
const audioBuffer = await ttsService.synthesize(response, audioContext);
console.timeEnd('[Spirit Box] TTS Synthesis');
```

**Target Metrics:**
- LLM Response: < 2 seconds
- TTS Synthesis: < 3 seconds
- Total Pipeline: < 5 seconds

### Memory Leaks

```typescript
// Check for leaks after multiple sessions
for (let i = 0; i < 10; i++) {
  await audioGraphManager.initialize();
  await audioGraphManager.startSession();
  audioGraphManager.stopSession();
}

// Verify all nodes are cleaned up
expect(audioGraphManager.getAudioContext()).toBeNull();
```

## Test Coverage Goals

- **Audio Module:** 80%+ coverage
- **Medium Module:** 70%+ coverage (API mocking complexity)
- **UI Components:** 60%+ coverage (visual effects hard to test)

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test AudioGraphManager.test.ts

# Watch mode
npm test -- --watch
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

## Debugging Tests

### Verbose Logging

```typescript
// Enable debug logs in tests
process.env.DEBUG = 'spirit-box:*';
```

### Isolate Failing Tests

```typescript
// Run only this test
test.only('specific test', () => {
  // ...
});

// Skip this test
test.skip('flaky test', () => {
  // ...
});
```

### Inspect Mocks

```typescript
expect(mockFunction).toHaveBeenCalledTimes(1);
expect(mockFunction).toHaveBeenCalledWith('expected', 'args');
console.log(mockFunction.mock.calls); // See all calls
```
