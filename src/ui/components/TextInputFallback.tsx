/**
 * Text Input Fallback
 * 
 * For browsers that don't support Speech Recognition
 */

import { useState } from 'react';

interface TextInputFallbackProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function TextInputFallback({ onSubmit, disabled }: TextInputFallbackProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your question to the spirits..."
        disabled={disabled}
        className="flex-1 px-4 py-2 bg-black/50 border border-green-800 rounded-lg text-green-100 placeholder-green-700 focus:outline-none focus:border-green-500"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
      >
        Ask
      </button>
    </form>
  );
}
