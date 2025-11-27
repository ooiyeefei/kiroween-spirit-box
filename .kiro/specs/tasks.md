# Implementation Plan

- [x] 1. Core architecture and spec compliance
  - Initialize Vite + React + TypeScript project with Tailwind CSS
  - Create strict Kiro folder structure: /src/audio/, /src/medium/, /src/ui/, /src/config/
  - Create src/config/spectral-constants.ts to define Ghost Frequencies (buffer size, LFO rates, sweep ranges)
  - Configure environment variables for OPENAI_API_KEY
  - _Requirements: 6.1, 6.2_

- [x] 2. The Frankenstein Audio Engine (WebAudio)
  - [x] 2.1 Implement white noise generator
    - Create AudioContext with suspended state handling
    - Implement ScriptProcessorNode to generate white noise from Math.random()
    - _Requirements: 1.1, 1.2_
  
  - [x] 2.2 Build the filter chain
    - Create BiquadFilterNode (LowPass) connected to noise generator
    - Add GainNode for volume control
    - Route: Noise → BiquadFilter → GainNode → Destination
    - _Requirements: 1.2_
  
  - [x] 2.3 Implement auto-sweep LFO
    - Create OscillatorNode as LFO (Low Frequency Oscillator)
    - Connect LFO to BiquadFilter frequency parameter
    - Configure sweep range: 200Hz - 2000Hz with breathing effect
    - _Requirements: 1.2_
  
  - [x] 2.4 Add visualizer bridge
    - Connect AnalyserNode at end of audio chain
    - Configure FFT size 2048, smoothing 0.8
    - Implement getFrequencyData() method for Radar consumption
    - _Requirements: 3.2_

- [x] 3. The Medium (MCP & Entropy)
  - [x] 3.1 Create MCPClient class
    - Implement mock connection to local MCP server
    - Add connection error handling with Math.random() fallback
    - _Requirements: 2.1_
  
  - [x] 3.2 Implement get_spectral_reading() tool
    - Return mock float value between 0.0 and 1.0
    - Simulate entropy readings for paranormal presence
    - _Requirements: 2.2_
  
  - [x] 3.3 Build the entropy gate
    - Implement logic: if (entropy < 0.5) return "No presence detected..."
    - Block LLM invocation when entropy is below threshold
    - Allow LLM processing when entropy >= 0.5
    - _Requirements: 2.3, 2.4_

- [x] 4. The Séance Brain (LLM & Persona)
  - [x] 4.1 Create LLMService with Victorian Mechanic persona
    - Implement system prompt: "You are Cornelius Blackwood, a deceased Victorian mechanic..."
    - Configure OpenAI API integration
    - Add error handling with fallback response
    - _Requirements: 4.1_
  
  - [x] 4.2 Enforce token constraints
    - Set max_tokens to 30 to enforce cryptic, short EVP responses (under 15 words)
    - Validate response length
    - _Requirements: 4.2_
  
  - [x] 4.3 Inject spectral context
    - Append current spectral_reading value to LLM prompt
    - Allow ghost to "know" the energy level in responses
    - _Requirements: 2.2_

- [x] 5. The Voice from Beyond (Audio Pipeline)
  - [x] 5.1 Implement TTS fetcher
    - Create fetch to OpenAI v1/audio/speech API
    - Receive spoken response as ArrayBuffer
    - Decode ArrayBuffer to AudioBuffer
    - _Requirements: 4.3_
  
  - [x] 5.2 Build audio processor chain
    - Create ConvolverNode for reverb effect (radio-like ambience)
    - Create WaveShaperNode for distortion
    - Route: TTS AudioBuffer → ConvolverNode → WaveShaperNode → Output
    - _Requirements: 4.3_
  
  - [x] 5.3 Implement audio mixer with sidechaining
    - Merge Ghost Voice with Static Noise
    - Implement sidechaining: dip static volume when voice plays
    - _Requirements: 4.3_

- [x] 6. The Visuals (Canvas & CSS)
  - [x] 6.1 Create Spectral Radar component
    - Initialize HTML5 Canvas with circular radar background
    - Implement 60 FPS animation loop using requestAnimationFrame
    - Draw sweeping line rotating 360° every 3 seconds
    - Extract bass frequencies (0-200Hz) from AnalyserNode
    - Render amplitude spikes as glowing dots on sweep path
    - _Requirements: 3.2_
  
  - [x] 6.2 Create Manifestation CSS effect
    - Define CSS class .manifesting with backdrop-filter: blur(4px) hue-rotate(90deg)
    - Add 0.5 second transition for smooth effect
    - _Requirements: 3.3_
  
  - [x] 6.3 Implement manifestation trigger logic
    - Apply .manifesting class to #app-container when TTS is playing
    - Remove class when TTS completes
    - _Requirements: 3.3_

- [x] 7. Build UI components and state management
  - [x] 7.1 Create SpiritBoxControls component
    - Implement Start Session button (initializes AudioContext, starts noise)
    - Implement Stop Session button (disconnects nodes, closes context)
    - Display session status indicator (inactive/active/processing/responding)
    - _Requirements: 1.1, 1.3_
  
  - [x] 7.2 Create TranscriptDisplay component
    - Display user questions and spirit responses chronologically
    - Show entropy reading for each spirit response
    - Handle "No presence detected..." messages
    - _Requirements: 3.2_
  
  - [x] 7.3 Create useSpeechRecognition hook
    - Initialize SpeechRecognition API (with webkit fallback)
    - Handle microphone permissions
    - Emit transcribed text on speech end event
    - Provide text input fallback for unsupported browsers
    - _Requirements: 3.1_
  
  - [x] 7.4 Wire App.tsx main shell
    - Implement EVP session state management
    - Connect pipeline: Speech → MCP Gate → LLM → TTS → Audio Effects
    - Trigger manifestation overlay during TTS playback
    - _Requirements: All_

- [x] 8. The "Haunted" Kiro Hook
  - Create .kiro/hooks/pre-commit-curse.js file
  - Implement commit message tone validation using fs.readFileSync
  - Reject commits containing "fix", "good", "love" with error: "THE SPIRITS ARE ANGERED BY YOUR OPTIMISM"
  - Require words like "repair", "patch", "resurrect", "doom"
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 9. Demonstration polish
  - [x] 9.1 Add Debug Mode toggle
    - Create UI toggle to manually trigger "Ghost Presence"
    - Override MCP entropy reading to 0.85 when enabled
    - Critical for 3-minute demo video (avoid waiting for RNG)
    - _Requirements: 7.2_
  
  - [x] 9.2 Add Frankenstein code comments
    - Document raw audio synthesis approach at noise generator
    - Document MCP entropy gate logic at threshold check
    - Document audio effect chain at ConvolverNode/WaveShaperNode
    - _Requirements: 6.2_
  
  - [x] 9.3 Create UI data flow diagram
    - Render visual pipeline: Mic → STT → MCP → LLM → TTS → FX → Output
    - Display in UI for judges to see the "stitching"
    - _Requirements: 6.2_

- [ ]* 10. Testing the ritual
  - [ ]* 10.1 Write AudioContext unit test
    - Test AudioContext initializes in suspended state (browser autoplay policy)
    - Test context resumes after user gesture
    - _Requirements: 7.1_
  
  - [ ]* 10.2 Write manifestation integration test
    - Mock high entropy event (0.85)
    - Verify .manifesting CSS class is applied to DOM during TTS
    - _Requirements: 7.2_

- [x] 11. Create README and documentation
  - Write README explaining the Frankenstein concept (stitching raw audio + AI + MCP)
  - Document how to run the project locally
  - Document environment variable setup
  - _Requirements: 6.2_
