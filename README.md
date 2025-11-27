# 👻 The Spirit Box

> A Frankenstein creation for the Kiroween Hackathon 2025

## What is this?

The Spirit Box is a web-based ghost-hunting simulation that **stitches together** three disparate technologies to create an immersive Electronic Voice Phenomenon (EVP) experience:

1. **WebAudio API** - Raw noise synthesis from `Math.random()` (no pre-recorded audio!)
2. **NASA Space Weather API** - Real geomagnetic storm data that decides *if* the ghost speaks
3. **LLM + TTS** - AI-powered paranormal persona with vintage radio effects

## The Frankenstein Concept

This project demonstrates "Frankenstein" architecture by combining:

```
🎤 Voice → 📝 STT → 🌌 NASA Cosmic Data → 🤖 LLM → 🔊 TTS → 📻 Radio FX → 👻 Ghost
```

- **Raw Audio Synthesis**: White noise generated in real-time using `ScriptProcessorNode`
- **NASA DONKI Integration**: Real geomagnetic storm data determines ghost manifestation probability
- **Audio Effect Chain**: Modern TTS processed through vintage-style reverb and distortion

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_NASA_API_KEY=your-nasa-api-key-here
```

Get your NASA API key from: https://api.nasa.gov/ (free, instant approval)

### 3. Run the development server

```bash
npm run dev
```

### 4. Open in browser

Navigate to `http://localhost:5173` and click "START SESSION" to begin the séance.

## Features

- **Spectral Radar**: Canvas-based visualizer that reacts to audio amplitude
- **Speech Recognition**: Speak naturally to communicate with the spirits
- **Victorian Mechanic Persona**: Cornelius Blackwood, a confused ghost from 1887
- **NASA Space Weather Integration**: Real geomagnetic storm data affects ghost manifestation
- **Manifestation Effect**: CSS distortion when the ghost speaks
- **Debug Mode**: Force ghost presence for demo purposes

## Kiro Features Used

### Agent Hooks

The repo includes a "Haunted" pre-commit hook at `.kiro/hooks/pre-commit-curse.js` that:
- Rejects commits with "too happy" messages (fix, good, love)
- Requires spooky vocabulary (repair, resurrect, doom, curse)

### Spec-Driven Development

The project follows Kiro's spec workflow:
- `.kiro/specs/requirements.md` - EARS-compliant requirements
- `.kiro/specs/design.md` - Architecture and interfaces
- `.kiro/specs/tasks.md` - Implementation checklist

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Audio**: WebAudio API (native)
- **Speech**: Web Speech API
- **AI**: OpenAI GPT-4o-mini + TTS API

## Project Structure

```
src/
├── audio/           # WebAudio node orchestration
├── medium/          # MCP client, LLM service, TTS service
├── ui/              # React components and hooks
├── config/          # Audio constants and persona
└── types/           # TypeScript interfaces
```

## API Keys Required

You need two API keys:

**OpenAI** (for LLM and TTS):
- LLM responses (GPT-4o)
- Text-to-Speech (tts-1 model)
- Get it from: https://platform.openai.com/api-keys

**NASA** (for space weather data):
- Geomagnetic storm detection (DONKI API)
- Get it from: https://api.nasa.gov/ (free, instant)
- Use `DEMO_KEY` for testing (rate limited)

Without API keys, the app will use fallback responses and random entropy.

## Browser Support

- Chrome 89+ (recommended)
- Firefox 88+ (Speech Recognition via polyfill)
- Safari 14.1+

## License

MIT - Built for Kiroween Hackathon 2025 🎃
