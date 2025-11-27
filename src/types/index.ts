/** EVP Session status */
export type SessionStatus = 'inactive' | 'active' | 'processing' | 'responding';

/** A single entry in the transcript */
export interface TranscriptEntry {
  id: string;
  timestamp: number;
  speaker: 'user' | 'spirit';
  text: string;
  entropyReading?: number;
}

/** Main EVP session state */
export interface EVPSession {
  status: SessionStatus;
  transcript: TranscriptEntry[];
  currentEntropy: number | null;
  debugMode: boolean;
}

/** Spectral reading from cosmic sources */
export interface SpectralReading {
  value: number; // 0.0 - 1.0
  timestamp: number;
  source: 'nasa_donki' | 'random_fallback' | 'debug_override';
  metadata?: {
    stormCount?: number;
    recentStorms?: Array<{
      id: string;
      time: string;
      kpIndex?: number;
    }>;
  };
}
