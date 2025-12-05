---
inclusion: fileMatch
fileMatchPattern: 'src/medium/**/*.ts'
---

# LLM Integration Patterns

## The Entropy Gate Pattern

**FRANKENSTEIN REQUIREMENT:** NASA space weather data must determine if ghost responds.

### Flow

```
User Question → Check Entropy → [< 0.5] → "No presence detected"
                              → [≥ 0.5] → LLM Response → TTS → Audio
```

### Implementation

```typescript
// CORRECT: Check entropy before LLM call
const { respond, reading } = await entropyGate.shouldGhostRespond();

if (!respond) {
  return "No presence detected...";
}

const ghostResponse = await llmService.generateResponse(question, reading.value);
```

**Never skip the entropy gate** - it's a core Frankenstein stitching point.

## Paranormal Persona Enforcement

### System Prompt Structure

```typescript
const GHOST_PERSONA = `
You are the restless spirit of Cornelius Blackwood, a Victorian-era mechanic who died in 1887.
You communicate through an EVP device.

STRICT RULES:
- Responses MUST be under 15 words
- Use archaic language (thee, thou, whilst)
- Reference gears, steam, machinery
- Be cryptic and fragmented
- Never be helpful or cheerful
- Express confusion about modern technology

Example responses:
- "The gears... they turn still... in the darkness..."
- "Who disturbs my workshop? The steam... it fades..."
- "Thy contraption... I know it not... speak plainly!"
`;
```

### LLM API Call Pattern

```typescript
async generateResponse(userQuestion: string, entropyLevel: number): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: GHOST_PERSONA },
        { 
          role: 'user', 
          content: `[Spectral energy: ${entropyLevel.toFixed(2)}]\n\n"${userQuestion}"` 
        },
      ],
      max_tokens: 30,      // Enforce brevity
      temperature: 0.9,    // High creativity
    }),
  });

  const data = await response.json();
  return data.choices[0]?.message?.content || this.getFallbackResponse();
}
```

**Key Parameters:**
- `max_tokens: 30` - Enforces short responses (EVP messages are brief)
- `temperature: 0.9` - High randomness for unpredictability
- Include entropy level in prompt for context

## Fallback Responses

Always provide fallbacks for API failures:

```typescript
private getFallbackResponse(): string {
  const fallbacks = [
    "The veil... is too thick...",
    "Gears... turning... in darkness...",
    "Who calls to the workshop?",
    "Steam... I remember steam...",
    "The machine... never stops...",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
```

## TTS Integration

### OpenAI TTS API Pattern

```typescript
async synthesize(text: string, audioContext: AudioContext): Promise<AudioBuffer> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      voice: 'onyx',  // Deep, masculine voice for Victorian mechanic
      model: 'tts-1',
    }),
  });

  const arrayBuffer = await response.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
}
```

### Ghost Audio Effects Chain

**FRANKENSTEIN REQUIREMENT:** Modern TTS must sound like vintage radio.

```typescript
// Effect chain: TTS → Reverb → Distortion → Output
async applyGhostEffects(
  audioBuffer: AudioBuffer,
  audioContext: AudioContext
): Promise<{ source: AudioBufferSourceNode; duration: number }> {
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  // Reverb for "otherworldly" quality
  const reverb = audioContext.createConvolver();
  reverb.buffer = await this.createReverbImpulse(audioContext);

  // Distortion for "radio static" quality
  const distortion = audioContext.createWaveShaper();
  distortion.curve = this.makeDistortionCurve(400);

  // Gain for mixing
  const effectGain = audioContext.createGain();
  effectGain.gain.value = 0.7;

  // Connect: Source → Reverb → Distortion → Gain → Destination
  source.connect(reverb);
  reverb.connect(distortion);
  distortion.connect(effectGain);
  effectGain.connect(audioContext.destination);

  return { source, duration: audioBuffer.duration };
}
```

## Error Handling

```typescript
try {
  const response = await llmService.generateResponse(question, entropy);
  // Process response
} catch (error) {
  console.error('[Spirit Box] LLM pipeline error:', error);
  // Show fallback response
  return "The veil... is too thick...";
}
```

**Never let API errors break the user experience.**

## Security: API Key Protection

**CRITICAL:** Never expose API keys in client code.

```typescript
// CORRECT: Use server-side API routes
const response = await fetch('/api/chat', { /* ... */ });

// WRONG: Direct OpenAI API call from client
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${VITE_OPENAI_API_KEY}` } // ❌ Exposed!
});
```

All API calls must go through `/api/chat` and `/api/tts` routes.

## Frankenstein Stitching Comments

Mark LLM integration points:

```typescript
// FRANKENSTEIN STITCHING POINT #2: Entropy Gate
// NASA space weather data decides if ghost speaks

// FRANKENSTEIN STITCHING POINT #3: Audio Effect Chain
// Modern TTS through vintage-style audio processors
```

## Testing Patterns

### Mock Entropy for Testing

```typescript
// Force high entropy for demo mode
const mockEntropy = { respond: true, reading: { value: 0.95 } };
```

### Validate Response Length

```typescript
const response = await llmService.generateResponse(question, entropy);
if (response.split(' ').length > 20) {
  console.warn('[Spirit Box] Response too long, truncating...');
}
```
