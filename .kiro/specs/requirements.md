# Requirements Document
## Project: The Spirit Box (Frankenstein Category)

## 1. Introduction
The Spirit Box is a "Frankenstein" application that stitches together the **Web Audio API** (raw signal processing), **Browser Speech Recognition** (input), and **MCP-connected LLMs** (intelligence) to simulate a realistic Electronic Voice Phenomenon (EVP) recorder. It uses Kiro's Specs and Hooks to enforce a "Haunted Codebase" standard.

## 2. Glossary
- **EVP Session:** The active state where audio graphs are connected.
- **The Veil (MCP):** A Model Context Protocol server that feeds "entropy" (random noise seeds) to the LLM to determine *if* a ghost speaks.
- **Audio Graph:** The specific wiring of Oscillators -> GainNodes -> Analysers.
- **Spectral Radar:** A canvas-based visualizer reacting to specific frequency bands.

## 3. Functional Requirements

### Requirement 1: The Frankenstein Audio Engine
**User Story:** As a user, I want to hear a complex, layered static noise that feels analog, not digital.
**Acceptance Criteria:**
1. The app MUST NOT use a pre-recorded MP3 for noise. It MUST synthesize noise in real-time using `AudioContext.createScriptProcessor` or `AudioWorklet`.
2. The Audio Graph MUST consist of at least 3 nodes: `WhiteNoise`, `PinkNoise`, and a `BiquadFilter` that sweeps frequencies automatically.
3. The audio engine MUST function even if the network is disconnected (Frankenstein needs to work offline until the spirit speaks).

### Requirement 2: The Medium (MCP Integration)
**User Story:** As a developer, I want to use MCP to inject "real-world entropy" into the ghost's responses.
**Acceptance Criteria:**
1. The application MUST connect to a local MCP server (simulated or real).
2. Before the LLM answers a user's question, it MUST query the MCP tool `get_spectral_reading()`.
3. IF `get_spectral_reading()` returns a value below 0.5, the LLM MUST refuse to answer (simulating "no ghost present").
4. This demonstrates the "Frankenstein" stitching of Logic (LLM) + External Tools (MCP).

### Requirement 3: The Séance Interface (Speech & Visuals)
**User Story:** As a ghost hunter, I want to speak naturally and see the room react.
**Acceptance Criteria:**
1. The app MUST use `window.SpeechRecognition` (or webkit variant).
2. The UI MUST feature a "Spectral Radar" drawn on an HTML5 Canvas.
3. **Visual Hook:** When the "Ghost" speaks, the CSS `backdrop-filter` of the entire page MUST distort (blur/hue-rotate) to simulate electromagnetic interference.

### Requirement 4: The Paranormal Persona (LLM Configuration)
**User Story:** As a user, I want the ghost to sound archaic and confused, not like a helpful AI assistant.
**Acceptance Criteria:**
1. The System Prompt MUST enforce a persona of a "Deceased Victorian mechanic."
2. The response length MUST be limited to under 15 words (EVP messages are short).
3. The TTS (Text-to-Speech) output MUST be post-processed with a `ConvolverNode` to sound like it is coming from a radio.

## 4. Technical Constraints (The Kiro Strategy)

### Requirement 5: Haunted Codebase (Agent Hooks)
**User Story:** As a judge, I want to see Kiro Hooks automating the "Spooky" quality of the code.
**Acceptance Criteria:**
1. The repo MUST contain a Kiro Hook `.kiro/hooks/pre-commit-curse.js`.
2. **Logic:** This hook scans commit messages. If the message is "too happy" (contains words like "fix", "good", "love"), it rejects the commit with the error: *"The spirits demand a more somber tone..."*
3. The hook MUST require words like "repair", "patch", "resurrect", or "doom".

### Requirement 6: Spec-Driven Architecture
**User Story:** As a developer, I want the folder structure to follow the Kiro Spec strictly.
**Acceptance Criteria:**
1. The project MUST be structured as:
    *   `/src/audio/` (Raw WebAudio Nodes)
    *   `/src/medium/` (MCP & LLM Logic)
    *   `/src/ui/` (Radar & Controls)
2. All audio constants (frequencies, gain levels) MUST be defined in a `src/config/spectral-constants.ts` file, not hardcoded.

## 5. Testing & Validation

### Requirement 7: The Ritual (Testing)
**User Story:** As a developer, I need to verify the "Frankenstein" connection without summoning real ghosts.
**Acceptance Criteria:**
1. **Unit Test:** `AudioGraph.test.ts` MUST verify that the Audio Context starts in a `suspended` state and moves to `running` only after a user gesture (browser requirement).
2. **Integration Test:** Mock the MCP response to force a "Ghost Presence" (value > 0.8) and verify the UI triggers the "Distortion" effect.

