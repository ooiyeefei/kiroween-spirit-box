/**
 * Spectral Radar: Canvas-based visualizer
 * 
 * A circular radar that reacts to audio amplitude,
 * showing "paranormal activity" as glowing spikes.
 */

import { useEffect, useRef, useCallback } from 'react';
import { AUDIO_CONFIG } from '../../config/spectral-constants';

interface SpectralRadarProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
}

export function SpectralRadar({ analyserNode, isActive }: SpectralRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const sweepAngleRef = useRef(0);
  const spikesRef = useRef<Array<{ angle: number; intensity: number; decay: number }>>([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { RADAR } = AUDIO_CONFIG;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Draw radar background
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 1;

    // Concentric circles
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 4) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Cross lines
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // Update sweep angle
    const now = Date.now();
    sweepAngleRef.current = ((now % RADAR.SWEEP_DURATION) / RADAR.SWEEP_DURATION) * Math.PI * 2;

    // Draw sweep line with glow
    ctx.save();
    ctx.shadowColor = 'rgba(34, 197, 94, 0.8)';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(sweepAngleRef.current - Math.PI / 2) * radius,
      centerY + Math.sin(sweepAngleRef.current - Math.PI / 2) * radius
    );
    ctx.stroke();
    ctx.restore();

    // Get frequency data if analyser is available
    if (analyserNode && isActive) {
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArray);

      // Extract bass frequencies (first 20 bins)
      const bassRange = dataArray.slice(0, RADAR.BASS_BINS);
      const avgAmplitude = bassRange.reduce((a, b) => a + b, 0) / bassRange.length;

      // Add spike if amplitude exceeds threshold
      if (avgAmplitude > RADAR.SPIKE_THRESHOLD) {
        spikesRef.current.push({
          angle: sweepAngleRef.current,
          intensity: avgAmplitude / 255,
          decay: 1,
        });
      }
    }

    // Draw and decay spikes
    spikesRef.current = spikesRef.current.filter((spike) => {
      spike.decay -= 0.02;
      if (spike.decay <= 0) return false;

      const spikeRadius = radius * 0.3 + radius * 0.6 * spike.intensity;
      const x = centerX + Math.cos(spike.angle - Math.PI / 2) * spikeRadius;
      const y = centerY + Math.sin(spike.angle - Math.PI / 2) * spikeRadius;

      // Draw glowing dot
      ctx.save();
      ctx.shadowColor = `rgba(34, 197, 94, ${spike.decay})`;
      ctx.shadowBlur = 15;
      ctx.fillStyle = `rgba(34, 197, 94, ${spike.decay * spike.intensity})`;
      ctx.beginPath();
      ctx.arc(x, y, 4 + spike.intensity * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return true;
    });

    // Draw center dot
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Continue animation
    animationRef.current = requestAnimationFrame(draw);
  }, [analyserNode, isActive]);

  useEffect(() => {
    if (isActive) {
      animationRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, draw]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="rounded-full bg-black/90 radar-glow"
      />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-green-500 text-xs font-mono">
        SPECTRAL RADAR
      </div>
    </div>
  );
}
