/**
 * Spirit Box Controls
 * 
 * Start/Stop session buttons and status display
 */

import type { SessionStatus } from '../../types';

interface SpiritBoxControlsProps {
  status: SessionStatus;
  onStart: () => void;
  onStop: () => void;
}

export function SpiritBoxControls({
  status,
  onStart,
  onStop,
}: SpiritBoxControlsProps) {
  const isActive = status !== 'inactive';

  const getStatusText = () => {
    switch (status) {
      case 'inactive':
        return 'OFFLINE';
      case 'active':
        return 'SCANNING...';
      case 'processing':
        return 'CONTACTING...';
      case 'responding':
        return 'MANIFESTATION';
      default:
        return 'UNKNOWN';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'inactive':
        return 'text-gray-500';
      case 'active':
        return 'text-green-500';
      case 'processing':
        return 'text-yellow-500';
      case 'responding':
        return 'text-red-500 animate-pulse';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status indicator */}
      <div className="text-center">
        <div className={`text-2xl font-mono font-bold ${getStatusColor()}`}>
          {getStatusText()}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {status === 'responding' ? '👻 PRESENCE DETECTED' : 'EVP SESSION'}
        </div>
      </div>

      {/* Main controls */}
      <div className="flex gap-4">
        {!isActive ? (
          <button
            onClick={onStart}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-600/30"
          >
            🔮 START SESSION
          </button>
        ) : (
          <button
            onClick={onStop}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-600/30"
          >
            ✖ END SESSION
          </button>
        )}
      </div>
    </div>
  );
}
