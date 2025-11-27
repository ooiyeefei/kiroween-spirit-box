/**
 * The Spirit Box - Main Application
 * 
 * A Frankenstein creation that stitches together:
 * - WebAudio API (raw noise synthesis)
 * - MCP (entropy gate)
 * - LLM (paranormal persona)
 * - TTS (ghost voice)
 */

import { useState, useCallback, useEffect } from 'react';
import { SpectralRadar } from './ui/components/SpectralRadar';
import { SpiritBoxControls } from './ui/components/SpiritBoxControls';
import { TranscriptDisplay } from './ui/components/TranscriptDisplay';
import { TextInputFallback } from './ui/components/TextInputFallback';
import { VUMeter } from './ui/components/VUMeter';
import { useSpeechRecognition } from './ui/hooks/useSpeechRecognition';
import { audioGraphManager } from './audio/AudioGraphManager';
import { entropyGate } from './medium/SpectralEntropyService';
import { llmService } from './medium/LLMService';
import { ttsService } from './medium/TTSService';
import type { EVPSession, TranscriptEntry } from './types';

function App() {
  const [session, setSession] = useState<EVPSession>({
    status: 'inactive',
    transcript: [],
    currentEntropy: null,
    debugMode: false,
  });

  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [isManifesting, setIsManifesting] = useState(false);

  const {
    isListening,
    transcript,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Process user question through the pipeline
  const processQuestion = useCallback(async (question: string) => {
    if (session.status !== 'active') return;

    // Add user entry to transcript
    const userEntry: TranscriptEntry = {
      id: `user-${Date.now()}`,
      timestamp: Date.now(),
      speaker: 'user',
      text: question,
    };

    setSession((prev) => ({
      ...prev,
      status: 'processing',
      transcript: [...prev.transcript, userEntry],
    }));

    try {
      // FRANKENSTEIN STITCHING: Check entropy gate via NASA cosmic data
      const { respond, reading } = await entropyGate.shouldGhostRespond();
      
      setSession((prev) => ({
        ...prev,
        currentEntropy: reading.value,
      }));

      if (!respond) {
        // No presence detected
        const noPresenceEntry: TranscriptEntry = {
          id: `spirit-${Date.now()}`,
          timestamp: Date.now(),
          speaker: 'spirit',
          text: 'No presence detected...',
          entropyReading: reading.value,
        };

        setSession((prev) => ({
          ...prev,
          status: 'active',
          transcript: [...prev.transcript, noPresenceEntry],
        }));
        return;
      }

      // FRANKENSTEIN STITCHING: Get LLM response with persona
      setSession((prev) => ({ ...prev, status: 'responding' }));
      setIsManifesting(true);

      // Duck the noise for ghost voice
      audioGraphManager.duckNoise(true);

      const ghostResponse = await llmService.generateResponse(question, reading.value);

      // FRANKENSTEIN STITCHING: Convert to speech with effects
      const audioContext = audioGraphManager.getAudioContext();
      if (audioContext) {
        const audioBuffer = await ttsService.synthesize(ghostResponse, audioContext);
        const { source, duration } = await ttsService.applyGhostEffects(audioBuffer, audioContext);
        
        source.start();

        // Wait for audio to finish
        await new Promise((resolve) => setTimeout(resolve, duration * 1000 + 500));
      }

      // Add ghost response to transcript
      const spiritEntry: TranscriptEntry = {
        id: `spirit-${Date.now()}`,
        timestamp: Date.now(),
        speaker: 'spirit',
        text: ghostResponse,
        entropyReading: reading.value,
      };

      setSession((prev) => ({
        ...prev,
        status: 'active',
        transcript: [...prev.transcript, spiritEntry],
      }));
    } catch (error) {
      console.error('[Spirit Box] Pipeline error:', error);
      setSession((prev) => ({ ...prev, status: 'active' }));
    } finally {
      setIsManifesting(false);
      audioGraphManager.duckNoise(false);
    }
  }, [session.status]);

  // Handle speech recognition results
  useEffect(() => {
    if (transcript && session.status === 'active') {
      processQuestion(transcript);
      resetTranscript();
    }
  }, [transcript, session.status, processQuestion, resetTranscript]);

  // Start EVP session
  const handleStart = async () => {
    try {
      await audioGraphManager.initialize();
      await audioGraphManager.startSession();
      
      const analyser = audioGraphManager.getAnalyserNode();
      setAnalyserNode(analyser);

      setSession((prev) => ({
        ...prev,
        status: 'active',
        transcript: [],
        currentEntropy: null,
      }));

      // Start listening if speech is supported
      if (speechSupported) {
        startListening();
      }
    } catch (error) {
      console.error('[Spirit Box] Failed to start session:', error);
    }
  };

  // Stop EVP session
  const handleStop = () => {
    stopListening();
    audioGraphManager.stopSession();
    setAnalyserNode(null);
    setIsManifesting(false);

    setSession((prev) => ({
      ...prev,
      status: 'inactive',
    }));
  };

  // Handle text input submission
  const handleTextSubmit = (text: string) => {
    processQuestion(text);
  };

  // Re-start listening after processing
  useEffect(() => {
    if (session.status === 'active' && speechSupported && !isListening) {
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [session.status, speechSupported, isListening, startListening]);

  return (
    <div
      id="app-container"
      className={`min-h-screen bg-neutral-900 text-white flex items-center justify-center p-8 transition-all duration-500 ${
        isManifesting ? 'manifesting' : ''
      }`}
    >
      {/* Main 50-50 Layout */}
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl h-full">
        
        {/* LEFT COLUMN (50%) - Title, VU Meter, Radar, Controls, Footer */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-creepster text-green-500 mb-2 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
              👻 THE SPIRIT BOX
            </h1>
            <p className="text-gray-500 text-sm mb-4">
              A Frankenstein creation: WebAudio + NASA DONKI API + LLM
            </p>
            
            {/* Helpful description */}
            <div className="text-sm text-gray-300 max-w-md mx-auto mb-4 p-4 bg-black/40 rounded-lg border border-green-900/50">
              <p className="text-center leading-relaxed">
                <span className="text-green-400 font-bold">Try to chat and scan for ghost presence!</span>
                <br />
                <span className="text-gray-400 text-xs">
                  The spirit will respond when spectral energy is high enough. 
                  Watch the radar and VU meter for paranormal activity. Good luck! 👻
                </span>
              </p>
            </div>
          </div>

          {/* VU Meter + Radar */}
          <div className="flex flex-row items-center gap-8">
            <VUMeter
              analyserNode={analyserNode}
              isActive={session.status !== 'inactive'}
            />
            <SpectralRadar
              analyserNode={analyserNode}
              isActive={session.status !== 'inactive'}
            />
          </div>

          {/* Controls */}
          <SpiritBoxControls
            status={session.status}
            onStart={handleStart}
            onStop={handleStop}
          />

          {/* Footer */}
          <div className="text-xs text-gray-600 mt-4">
            Kiroween Hackathon 2025 • Frankenstein Category
          </div>
        </div>

        {/* RIGHT COLUMN (50%) - Transcript MAXIMIZED */}
        <div className="flex-1 flex flex-col gap-4 h-full">
          {/* Listening indicator */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 text-green-500 flex-shrink-0">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Listening...</span>
            </div>
          )}

          {/* Text input fallback */}
          {session.status === 'active' && (
            <div className="flex-shrink-0">
              <TextInputFallback
                onSubmit={handleTextSubmit}
                disabled={session.status !== 'active'}
              />
            </div>
          )}

          {/* Transcript Display - TAKES ALL REMAINING HEIGHT */}
          <div className="flex-1 overflow-hidden">
            <TranscriptDisplay
              entries={session.transcript}
              currentEntropy={session.currentEntropy}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
