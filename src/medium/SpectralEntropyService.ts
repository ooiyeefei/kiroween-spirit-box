/**
 * FRANKENSTEIN STITCHING POINT #2: Spectral Entropy Gate
 * 
 * This is where we connect the LLM to EXTERNAL cosmic data.
 * The ghost doesn't decide when to speak - the cosmos does.
 * We use NASA's DONKI (Space Weather) API to detect geomagnetic storms
 * and solar activity, which paranormal researchers believe affects spirit manifestation.
 */

import { AUDIO_CONFIG } from '../config/spectral-constants';
import type { SpectralReading } from '../types';

interface DonkiGeomagneticStorm {
  gstID: string;
  startTime: string;
  kpIndex?: number;
  observedTime?: string;
}

export class SpectralEntropyService {
  private nasaApiKey: string;
  private donkiBaseUrl = 'https://api.nasa.gov/DONKI/GST';
  private debugMode = false;

  constructor() {
    this.nasaApiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
  }

  /**
   * Enable debug mode to force ghost presence
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    console.log(`[Spirit Box] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get spectral reading from cosmic sources (NASA DONKI Space Weather)
   * Returns a value between 0.0 and 1.0 based on geomagnetic activity
   */
  async getSpectralReading(): Promise<SpectralReading> {
    // Debug mode override for demo purposes
    if (this.debugMode) {
      console.log('[Spirit Box] 🔮 Debug mode: forcing ghost presence');
      return {
        value: AUDIO_CONFIG.ENTROPY.DEBUG_VALUE,
        timestamp: Date.now(),
        source: 'debug_override',
      };
    }

    try {
      // Fetch recent geomagnetic storms from NASA DONKI
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days

      const url = `${this.donkiBaseUrl}?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&api_key=${this.nasaApiKey}`;
      
      console.log('[Spirit Box] 🌌 Querying NASA DONKI for geomagnetic activity...');
      
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (!response.ok) {
        throw new Error(`NASA DONKI API error: ${response.status}`);
      }

      const storms: DonkiGeomagneticStorm[] = await response.json();
      
      // Calculate entropy from geomagnetic storm data
      const entropy = this.calculateEntropyFromStorms(storms);
      
      console.log(`[Spirit Box] 🌌 NASA DONKI: ${storms.length} geomagnetic storms detected`);
      console.log(`[Spirit Box] ⚡ Spectral entropy: ${entropy.toFixed(2)}`);

      return {
        value: entropy,
        timestamp: Date.now(),
        source: 'nasa_donki',
        metadata: {
          stormCount: storms.length,
          recentStorms: storms.slice(0, 3).map(s => ({
            id: s.gstID,
            time: s.startTime,
            kpIndex: s.kpIndex,
          })),
        },
      };
    } catch (error) {
      // Fallback to random entropy when NASA API unavailable
      console.warn('[Spirit Box] ⚠️ NASA DONKI unavailable, using random cosmic noise');
      console.error('[Spirit Box] Error:', error);
      
      return {
        value: Math.random(),
        timestamp: Date.now(),
        source: 'random_fallback',
      };
    }
  }

  /**
   * Convert geomagnetic storm data to entropy value (0.0 - 1.0)
   * 
   * Logic:
   * - NASA data provides base entropy (cosmic activity)
   * - Random variation simulates unpredictable paranormal fluctuations
   * - Combination ensures interactive experience while using real data
   */
  private calculateEntropyFromStorms(storms: DonkiGeomagneticStorm[]): number {
    // Calculate base entropy from NASA data
    let baseEntropy = 0.3; // Baseline cosmic background

    if (storms.length > 0) {
      // Base entropy from storm count (more storms = more activity)
      const stormCountFactor = Math.min(storms.length / 5, 1.0); // Cap at 5 storms

      // Recency factor (storms in last 24 hours count more)
      const now = Date.now();
      const recentStorms = storms.filter(storm => {
        const stormTime = new Date(storm.startTime).getTime();
        const hoursSince = (now - stormTime) / (1000 * 60 * 60);
        return hoursSince < 24;
      });
      const recencyFactor = recentStorms.length > 0 ? 0.2 : 0;

      // Kp index factor (higher Kp = stronger geomagnetic disturbance)
      const avgKpIndex = storms
        .filter(s => s.kpIndex !== undefined)
        .reduce((sum, s) => sum + (s.kpIndex || 0), 0) / Math.max(storms.length, 1);
      const kpFactor = Math.min(avgKpIndex / 9, 1.0); // Kp index ranges 0-9

      // Combine NASA factors (weighted lower to allow random variation)
      baseEntropy = 0.3 + (
        stormCountFactor * 0.15 +
        recencyFactor * 0.1 +
        kpFactor * 0.15
      );
    }

    // Add significant random variation (paranormal unpredictability)
    // This ensures interactive experience while still influenced by real cosmic data
    const randomVariation = Math.random() * 0.5; // 0.0 - 0.5 random boost
    
    const finalEntropy = baseEntropy + randomVariation;
    
    // Clamp to 0.0 - 1.0
    return Math.max(0, Math.min(1, finalEntropy));
  }
}

/**
 * Entropy Gate: Determines if the ghost should respond
 */
export class EntropyGate {
  private entropyService: SpectralEntropyService;

  constructor(entropyService: SpectralEntropyService) {
    this.entropyService = entropyService;
  }

  /**
   * Check if ghost should respond based on entropy threshold
   */
  async shouldGhostRespond(): Promise<{ respond: boolean; reading: SpectralReading }> {
    const reading = await this.entropyService.getSpectralReading();
    const respond = reading.value >= AUDIO_CONFIG.ENTROPY.PRESENCE_THRESHOLD;

    if (respond) {
      console.log(`[Spirit Box] 👻 PRESENCE DETECTED! Entropy: ${reading.value.toFixed(2)} (${reading.source})`);
    } else {
      console.log(`[Spirit Box] 🌫️ No presence... Entropy: ${reading.value.toFixed(2)} (${reading.source})`);
    }

    return { respond, reading };
  }
}

// Singleton instances
export const spectralEntropyService = new SpectralEntropyService();
export const entropyGate = new EntropyGate(spectralEntropyService);
