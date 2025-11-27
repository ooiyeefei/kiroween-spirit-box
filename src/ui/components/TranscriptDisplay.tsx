/**
 * Transcript Display
 * 
 * Shows the conversation between the living and the dead
 */

import { useEffect, useRef } from 'react';
import type { TranscriptEntry } from '../../types';

interface TranscriptDisplayProps {
  entries: TranscriptEntry[];
  currentEntropy: number | null;
}

export function TranscriptDisplay({ entries, currentEntropy }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Current entropy reading */}
      {currentEntropy !== null && (
        <div className="mb-4 p-2 bg-black/50 rounded border border-green-900 flex-shrink-0">
          <div className="text-xs text-green-500 font-mono">
            SPECTRAL ENERGY: {(currentEntropy * 100).toFixed(0)}%
          </div>
          <div className="w-full h-2 bg-gray-800 rounded mt-1">
            <div
              className="h-full bg-green-500 rounded transition-all duration-300"
              style={{ width: `${currentEntropy * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Transcript entries - MAXIMIZED HEIGHT */}
      <div 
        ref={scrollRef}
        className="space-y-3 flex-1 overflow-y-auto pr-2 scroll-smooth"
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        {entries.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            Speak to begin the séance...
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 rounded-lg ${
                entry.speaker === 'user'
                  ? 'bg-blue-900/30 border border-blue-800 ml-8'
                  : 'bg-green-900/30 border border-green-800 mr-8'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-xs font-bold ${
                    entry.speaker === 'user' ? 'text-blue-400' : 'text-green-400'
                  }`}
                >
                  {entry.speaker === 'user' ? '🎤 YOU' : '👻 CORNELIUS'}
                </span>
                {entry.entropyReading !== undefined && (
                  <span className="text-xs text-gray-500">
                    ⚡ {(entry.entropyReading * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p
                className={`text-sm ${
                  entry.speaker === 'user' ? 'text-blue-100' : 'text-green-100 font-creepster text-lg'
                }`}
              >
                {entry.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
