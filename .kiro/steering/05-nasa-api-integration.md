---
inclusion: fileMatch
fileMatchPattern: 'src/medium/SpectralEntropyService.ts'
---

# NASA API Integration Guide

## DONKI API Overview

**DONKI** = Database Of Notifications, Knowledge, Information

**Purpose:** Provides space weather data including geomagnetic storms, solar flares, and coronal mass ejections.

**Endpoint:** `https://api.nasa.gov/DONKI/GST`

**Documentation:** https://api.nasa.gov/

## Entropy Gate Concept

**FRANKENSTEIN STITCHING:** Real geomagnetic storm data determines if ghost manifests.

### Logic

```
Geomagnetic Storm Activity → Kp Index → Entropy Value (0.0 - 1.0)
                                              ↓
                                    [< 0.5] → No ghost
                                    [≥ 0.5] → Ghost responds
```

## API Request Pattern

### Basic Request

```typescript
const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
const BASE_URL = 'https://api.nasa.gov/DONKI/GST';

async function fetchGeomagneticStorms(): Promise<GeomagneticStorm[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Last 7 days

  const params = new URLSearchParams({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    api_key: NASA_API_KEY,
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  
  if (!response.ok) {
    throw new Error(`NASA API error: ${response.status}`);
  }

  return await response.json();
}
```

### Response Type

```typescript
interface GeomagneticStorm {
  gstID: string;
  startTime: string;
  allKpIndex?: Array<{
    observedTime: string;
    kpIndex: number;
    source: string;
  }>;
  link: string;
}

type GeomagneticStormResponse = GeomagneticStorm[];
```

## Entropy Calculation

### Kp Index to Entropy Mapping

**Kp Index Scale:** 0-9 (measures geomagnetic activity)
- 0-2: Quiet
- 3-4: Unsettled
- 5-6: Storm
- 7-9: Severe storm

```typescript
function calculateEntropy(storms: GeomagneticStorm[]): number {
  if (storms.length === 0) {
    return 0.2; // Low baseline entropy
  }

  // Get most recent Kp index
  const latestStorm = storms[storms.length - 1];
  const kpIndices = latestStorm.allKpIndex || [];
  
  if (kpIndices.length === 0) {
    return 0.3; // Storm exists but no Kp data
  }

  const latestKp = kpIndices[kpIndices.length - 1].kpIndex;

  // Map Kp (0-9) to entropy (0.0-1.0)
  // Kp 0 → 0.2 (low baseline)
  // Kp 5 → 0.5 (threshold)
  // Kp 9 → 1.0 (maximum)
  return Math.min(1.0, 0.2 + (latestKp / 9) * 0.8);
}
```

### Alternative: Storm Count Method

```typescript
function calculateEntropyFromCount(storms: GeomagneticStorm[]): number {
  // More storms = higher entropy
  const stormCount = storms.length;
  
  if (stormCount === 0) return 0.2;
  if (stormCount === 1) return 0.4;
  if (stormCount === 2) return 0.6;
  if (stormCount >= 3) return 0.8;
  
  return 0.5;
}
```

## Entropy Gate Service

### Complete Implementation

```typescript
export class SpectralEntropyService {
  private cachedReading: SpectralReading | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async shouldGhostRespond(): Promise<EntropyGateResult> {
    const reading = await this.getSpectralReading();
    const respond = reading.value >= 0.5;

    console.log(
      `[Entropy Gate] Reading: ${reading.value.toFixed(2)} | ` +
      `Source: ${reading.source} | ` +
      `Respond: ${respond ? 'YES' : 'NO'}`
    );

    return { respond, reading };
  }

  private async getSpectralReading(): Promise<SpectralReading> {
    // Check cache
    if (this.cachedReading && Date.now() < this.cacheExpiry) {
      return this.cachedReading;
    }

    try {
      const storms = await this.fetchGeomagneticStorms();
      const entropy = this.calculateEntropy(storms);

      this.cachedReading = {
        value: entropy,
        source: 'nasa',
        timestamp: Date.now(),
      };

      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      return this.cachedReading;
    } catch (error) {
      console.warn('[Entropy Gate] NASA API failed, using fallback');
      return this.getFallbackReading();
    }
  }

  private getFallbackReading(): SpectralReading {
    // Random entropy when NASA API unavailable
    return {
      value: Math.random(),
      source: 'fallback',
      timestamp: Date.now(),
    };
  }
}
```

## Error Handling

### API Failures

```typescript
try {
  const response = await fetch(url);
  
  if (response.status === 429) {
    // Rate limit exceeded
    console.warn('[NASA API] Rate limit exceeded, using fallback');
    return getFallbackReading();
  }
  
  if (response.status === 403) {
    // Invalid API key
    console.error('[NASA API] Invalid API key');
    return getFallbackReading();
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('[NASA API] Request failed:', error);
  return getFallbackReading();
}
```

### Network Timeout

```typescript
async function fetchWithTimeout(url: string, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}
```

## Caching Strategy

### Why Cache?

1. **Rate Limits:** NASA API has rate limits (30 requests/hour for DEMO_KEY)
2. **Performance:** Reduce latency for repeated requests
3. **Reliability:** Fallback to cached data if API is down

### Cache Duration

```typescript
private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

**Rationale:** Geomagnetic storms change slowly, 5-minute cache is reasonable.

## Debug Mode

### Force High Entropy

```typescript
async shouldGhostRespond(debugMode = false): Promise<EntropyGateResult> {
  if (debugMode) {
    console.log('[Entropy Gate] DEBUG MODE: Forcing high entropy');
    return {
      respond: true,
      reading: { value: 0.95, source: 'debug', timestamp: Date.now() },
    };
  }

  // Normal flow
  const reading = await this.getSpectralReading();
  return { respond: reading.value >= 0.5, reading };
}
```

**Usage:** Enable for demos to guarantee ghost responses.

## API Key Management

### Environment Variables

```bash
# .env
VITE_NASA_API_KEY=your_api_key_here
```

```typescript
// Access in code
const apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
```

### DEMO_KEY Limitations

- **Rate Limit:** 30 requests/hour
- **IP-based:** Shared across all users
- **Production:** Get your own key at https://api.nasa.gov/

### Getting Your Own Key

1. Visit https://api.nasa.gov/
2. Fill out form (instant approval)
3. Receive key via email
4. Add to `.env` file

**Rate Limit:** 1000 requests/hour (personal key)

## Testing

### Mock NASA Response

```typescript
const mockStorms: GeomagneticStorm[] = [
  {
    gstID: 'GST-20241205-001',
    startTime: '2024-12-05T12:00Z',
    allKpIndex: [
      { observedTime: '2024-12-05T12:00Z', kpIndex: 7, source: 'NOAA' },
    ],
    link: 'https://kauai.ccmc.gsfc.nasa.gov/...',
  },
];

// High entropy (Kp 7 → ~0.82)
const entropy = calculateEntropy(mockStorms);
expect(entropy).toBeGreaterThan(0.5);
```

### Integration Test

```typescript
test('Entropy gate blocks low entropy', async () => {
  // Mock low entropy
  jest.spyOn(entropyGate, 'getSpectralReading').mockResolvedValue({
    value: 0.3,
    source: 'nasa',
    timestamp: Date.now(),
  });

  const result = await entropyGate.shouldGhostRespond();
  expect(result.respond).toBe(false);
});
```

## Logging

### Structured Logs

```typescript
console.log(
  `[Entropy Gate] ` +
  `Reading: ${reading.value.toFixed(2)} | ` +
  `Source: ${reading.source} | ` +
  `Storms: ${storms.length} | ` +
  `Kp: ${latestKp} | ` +
  `Respond: ${respond ? 'YES' : 'NO'}`
);
```

**Example Output:**
```
[Entropy Gate] Reading: 0.72 | Source: nasa | Storms: 2 | Kp: 6 | Respond: YES
```

## Frankenstein Stitching Comment

```typescript
// FRANKENSTEIN STITCHING POINT #2: Entropy Gate
// Real NASA geomagnetic storm data decides if ghost speaks
// This is where cosmic chaos meets AI intelligence
```

## Alternative Data Sources

If NASA API is unavailable, consider:

1. **NOAA Space Weather API:** https://services.swpc.noaa.gov/
2. **Random Fallback:** `Math.random()` (current implementation)
3. **Time-based:** Higher entropy at night (3am = peak ghost hour)

```typescript
function getTimeBasedEntropy(): number {
  const hour = new Date().getHours();
  // 3am = 1.0, 3pm = 0.2
  return hour >= 0 && hour <= 6 ? 0.8 : 0.3;
}
```
