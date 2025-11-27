/**
 * VU Meter - Visual feedback for audio output
 * 
 * This component provides visual confirmation that audio is flowing
 * through the system. If the bar moves but no sound is heard, it's
 * a hardware/browser issue. If the bar stays flat, it's a code issue.
 */

import { useEffect, useRef, useState } from 'react';

interface VUMeterProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
}

export function VUMeter({ analyserNode, isActive }: VUMeterProps) {
  const [level, setLevel] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!analyserNode || !isActive) {
      setLevel(0);
      return;
    }

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

    const updateLevel = () => {
      analyserNode.getByteFrequencyData(dataArray);
      
      // Calculate average amplitude
      const sum = dataArray.reduce((acc, val) => acc + val, 0);
      const average = sum / dataArray.length;
      const normalizedLevel = average / 255; // 0.0 - 1.0
      
      setLevel(normalizedLevel);
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isActive]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-gray-400 font-mono">VU METER</div>
      
      {/* Vertical bar */}
      <div className="w-8 h-64 bg-black border border-green-900 rounded relative overflow-hidden">
        {/* Level indicator */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all duration-75"
          style={{ height: `${level * 100}%` }}
        />
        
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((mark) => (
          <div
            key={mark}
            className="absolute left-0 right-0 border-t border-green-900/30"
            style={{ bottom: `${mark}%` }}
          />
        ))}
      </div>
      
      {/* Numeric readout */}
      <div className="text-xs text-green-500 font-mono">
        {(level * 100).toFixed(0)}%
      </div>
      
      {/* Status */}
      <div className="text-xs text-gray-500">
        {level > 0.01 ? '🔊 SIGNAL' : '🔇 SILENT'}
      </div>
    </div>
  );
}
