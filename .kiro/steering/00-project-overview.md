---
inclusion: always
---

# The Spirit Box - Project Overview

## Project Identity
**Name:** The Spirit Box  
**Category:** Frankenstein (Kiroween Hackathon 2025)  
**Concept:** A paranormal investigation tool that stitches together disparate technologies to simulate Electronic Voice Phenomenon (EVP)

## The Frankenstein Architecture

This project demonstrates "Frankenstein" by combining three distinct technologies:

1. **WebAudio API** - Raw noise synthesis from `Math.random()` (no pre-recorded audio)
2. **NASA DONKI API** - Real geomagnetic storm data determines ghost manifestation probability
3. **OpenAI LLM + TTS** - AI-powered paranormal persona with vintage radio effects

### Data Flow Pipeline
```
🎤 Voice → 📝 STT → 🌌 NASA Cosmic Data → 🤖 LLM → 🔊 TTS → 📻 Radio FX → 👻 Ghost
```

## Core Persona: Cornelius Blackwood

The ghost is a Victorian-era mechanic (died 1887) who:
- Speaks in cryptic, fragmented sentences (under 15 words)
- Is confused by modern technology
- Obsessed with gears, steam, and machinery
- Never helpful or cheerful

## Key Technical Constraints

1. **No Pre-recorded Audio**: All noise must be synthesized in real-time
2. **Entropy Gate**: NASA space weather data determines if ghost responds (threshold: 0.5)
3. **Audio Effects Chain**: Modern TTS processed through vintage-style reverb and distortion
4. **Manifestation Effect**: CSS distortion when ghost speaks (backdrop-filter)

## Project Structure

```
src/
├── audio/           # WebAudio node orchestration (FRANKENSTEIN POINT #1)
├── medium/          # LLM, TTS, and entropy services (FRANKENSTEIN POINT #2)
├── ui/              # React components and hooks
├── config/          # Audio constants and persona
└── types/           # TypeScript interfaces
```

## Development Philosophy

- **Spec-Driven**: All features defined in `.kiro/specs/` before implementation
- **Haunted Codebase**: Pre-commit hooks enforce "spooky" commit messages
- **Stitching Points**: Code comments mark where disparate technologies connect
- **Debug Mode**: Toggle to force ghost presence for demos

## API Requirements

- **OpenAI API Key**: For LLM (GPT-4o-mini) and TTS (tts-1 model)
- **NASA API Key**: For DONKI geomagnetic storm data (free at api.nasa.gov)

## Browser Compatibility

- Chrome 89+ (recommended)
- Firefox 88+ (Speech Recognition via polyfill)
- Safari 14.1+
