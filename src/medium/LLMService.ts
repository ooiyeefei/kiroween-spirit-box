/**
 * The Séance Brain: LLM Service
 * 
 * Cornelius Blackwood speaks through this service.
 * A Victorian mechanic, confused by modernity, obsessed with gears.
 */

import { GHOST_PERSONA } from '../config/spectral-constants';

export class LLMService {
  private baseUrl = '/api/chat'; // Use our secure API route

  /**
   * Generate a paranormal response from Cornelius Blackwood
   */
  async generateResponse(userQuestion: string, entropyLevel: number): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: GHOST_PERSONA },
            { 
              role: 'user', 
              content: `[Spectral energy level: ${entropyLevel.toFixed(2)}]\n\nQuestion from the living: "${userQuestion}"` 
            },
          ],
          max_tokens: 30, // Enforce short, cryptic responses
          temperature: 0.9, // High creativity for unpredictability
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      const ghostResponse = data.choices[0]?.message?.content || this.getFallbackResponse();
      
      console.log(`[Spirit Box] Cornelius speaks: "${ghostResponse}"`);
      return ghostResponse;
    } catch (error) {
      console.error('[Spirit Box] LLM error:', error);
      return this.getFallbackResponse();
    }
  }

  /**
   * Fallback responses when API is unavailable
   */
  private getFallbackResponse(): string {
    const fallbacks = [
      "The veil... is too thick...",
      "Gears... turning... in darkness...",
      "Who calls to the workshop?",
      "Steam... I remember steam...",
      "The machine... never stops...",
      "Cold... so cold here...",
      "Cannot... reach... through...",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

export const llmService = new LLMService();
