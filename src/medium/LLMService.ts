/**
 * The Séance Brain: LLM Service
 * 
 * Cornelius Blackwood speaks through this service.
 * A Victorian mechanic, confused by modernity, obsessed with gears.
 */

import { GHOST_PERSONA } from '../config/spectral-constants';

export class LLMService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[Spirit Box] No OpenAI API key found. Ghost will use fallback responses.');
    }
  }

  /**
   * Generate a paranormal response from Cornelius Blackwood
   */
  async generateResponse(userQuestion: string, entropyLevel: number): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackResponse();
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // Latest GPT model for best quality responses
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
