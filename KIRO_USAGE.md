# How We Used Kiro to Build The Spirit Box

## Project Overview
**Category:** Frankenstein  
**Project:** The Spirit Box - A paranormal investigation tool that stitches together WebAudio API, NASA space weather data, and AI to simulate Electronic Voice Phenomenon (EVP).

---

## 🎯 Spec-Driven Development

### Our Approach
We used Kiro's spec-driven workflow to transform a rough idea into a fully functional application through three structured phases:

1. **Requirements Phase** (`.kiro/specs/requirements.md`)
   - Started with a conversation: "Build a ghost communication device"
   - Kiro helped formalize this into EARS-compliant requirements
   - Defined 7 core requirements with specific acceptance criteria
   - Example: "The app MUST synthesize noise in real-time using AudioContext.createScriptProcessor"

2. **Design Phase** (`.kiro/specs/design.md`)
   - Kiro generated a comprehensive architecture document
   - Included data flow diagrams, component interfaces, and audio signal chains
   - Defined the "Frankenstein stitching points" where disparate technologies connect
   - Created spectral constants configuration for audio parameters

3. **Tasks Phase** (`.kiro/specs/tasks.md`)
   - Kiro broke down the design into 11 major tasks with 40+ subtasks
   - Each task referenced specific requirements
   - Tasks were ordered to build incrementally (audio → entropy → LLM → TTS → UI)

### Impact
**Spec-driven vs Vibe Coding:**
- **Spec approach:** Provided clear roadmap, prevented scope creep, ensured all requirements were met
- **Vibe coding:** Used for quick UI tweaks and debugging after core implementation
- **Result:** 90% of code generated through spec execution, 10% through conversational refinement

---

## 💬 Vibe Coding Highlights

### Most Impressive Code Generation

**1. Audio Graph Manager** (`src/audio/AudioGraphManager.ts`)
- **Prompt:** "Implement the Frankenstein Audio Engine from the spec - raw white noise synthesis with LFO sweep"
- **Result:** Kiro generated a complete WebAudio node graph with:
  - ScriptProcessorNode for Math.random() noise generation
  - BiquadFilter with LFO modulation
  - Proper node connection chain
  - Debug logging for troubleshooting

**2. NASA DONKI Integration** (`src/medium/SpectralEntropyService.ts`)
- **Conversation Flow:**
  ```
  Me: "The MCP concept is confusing judges. Let's use real NASA space weather data instead."
  Kiro: "Great idea! Let me refactor MCPClient.ts to SpectralEntropyService.ts and integrate DONKI API"
  ```
- **Result:** Kiro:
  - Renamed files and updated all imports
  - Integrated NASA DONKI geomagnetic storm API
  - Created entropy calculation algorithm based on storm data
  - Added fallback to Math.random() for API failures

**3. Real-time Auto-Scroll**
- **Prompt:** "Users can't see new messages. Add auto-scroll to latest message"
- **Result:** Kiro added `useRef`, `useEffect`, and smooth scrolling in one shot

### Conversation Structure
We used iterative refinement:
1. Start with spec task
2. Kiro implements
3. We test and provide feedback ("the voice isn't ghostly enough")
4. Kiro refines (added playback rate, low-pass filter, more reverb)

---

## 🪝 Agent Hooks

### What We Built
**Pre-Commit Hook** (`.kiro/hooks/pre-commit-curse.js`)

**Purpose:** Enforce "haunted codebase" theme by validating commit messages

**Implementation:**
```javascript
// Rejects commits with "happy" words (fix, good, love)
// Requires "spooky" words (repair, resurrect, doom, curse)
```

### How It Improved Development
- **Thematic Consistency:** Kept the paranormal theme throughout development
- **Fun Factor:** Made commits entertaining ("resurrect the audio pipeline from the dead")
- **Demo Value:** Shows judges we understand Kiro's automation capabilities

### Why We Didn't Use More Hooks
- **Project Scope:** Single-developer hackathon project didn't need complex automation
- **Focus:** Prioritized spec-driven development over hook automation
- **Future Potential:** Could add hooks for:
  - Auto-running tests on file save
  - Generating audio constant documentation
  - Validating WebAudio node connections

---

## 📋 Steering Docs

### Initial Mistake
We accidentally had an `owasp-rules.md` steering doc from a different project that was confusing Kiro's responses about security.

### The Fix
**Conversation:**
```
Me: "This OWASP steering is wrong context. Remove it and focus on the Spirit Box."
Kiro: *Deleted .kiro/steering/owasp-rules.md and refocused*
```

### Strategy
- **Minimal Steering:** We relied on spec documents instead of steering for this project
- **Lesson Learned:** Steering is powerful but must be project-specific
- **Future Use:** Could add steering for:
  - WebAudio API best practices
  - Paranormal terminology consistency
  - Audio effect chain patterns

---

## 🔌 MCP (Model Context Protocol)

### Our Journey with MCP

**Initial Plan:**
- Use MCP to connect to external entropy sources
- Demonstrate "Frankenstein" stitching of protocols

**Reality Check:**
Through conversation with Kiro, we learned:
1. **MCP servers don't plug into each other** - the client orchestrates multiple servers
2. **Our app is client-side** - can't easily connect to local MCP servers (they use stdio)
3. **HTTP APIs are simpler** - for a web app, direct API calls make more sense

**Final Implementation:**
- **Pivoted from MCP to NASA DONKI API** (direct HTTP)
- **Kept the "Frankenstein" concept** - still stitching disparate technologies
- **Better for demo** - Real space weather data is more impressive than mock MCP

### What We Learned About MCP
- **MCP is powerful for:** Desktop apps (like Claude Desktop) connecting to multiple tool servers
- **MCP is overkill for:** Browser apps making simple API calls
- **Kiro helped us understand:** The architectural difference and make the right choice

### How Kiro's MCP Knowledge Helped
Even though we didn't use MCP in the final app, Kiro's understanding of it helped us:
1. **Design better architecture** - Understood service boundaries
2. **Make informed decisions** - Knew when NOT to use MCP
3. **Explain to judges** - Can articulate why we chose direct APIs

---

## 📊 Development Metrics

### Code Generation Breakdown
- **Spec-driven:** ~2,500 lines (audio engine, services, components)
- **Vibe coding:** ~500 lines (UI polish, bug fixes, refinements)
- **Total:** ~3,000 lines of TypeScript/React

### Time Saved
- **Estimated without Kiro:** 20-30 hours
- **Actual with Kiro:** 8-10 hours
- **Savings:** 60-70% faster development

### Kiro's Biggest Wins
1. **WebAudio complexity** - Generated correct node graph on first try
2. **TypeScript types** - Perfect type definitions throughout
3. **Error handling** - Comprehensive try-catch and fallbacks
4. **Documentation** - Inline comments explaining "Frankenstein stitching points"

---

## 🎓 Key Takeaways

### What Worked Best
1. **Spec-driven for core features** - Clear roadmap, systematic implementation
2. **Vibe coding for iteration** - Quick refinements based on testing
3. **Honest conversations** - Asking Kiro "is MCP right for this?" led to better decisions

### What We'd Do Differently
1. **More hooks** - Could have automated testing and documentation
2. **Steering docs** - Could have added WebAudio best practices
3. **Earlier spec creation** - Started with vibe coding, should have spec'd first

### Kiro's Superpowers
- **Context retention** - Remembered the "Victorian mechanic ghost" persona across sessions
- **Architectural thinking** - Suggested better patterns (entropy service vs MCP client)
- **Debugging partnership** - "The audio is silent" → systematic diagnostic approach

---

## 🏆 Why This Demonstrates Kiro Mastery

1. **Full Spec Workflow** - Requirements → Design → Tasks → Implementation
2. **Iterative Refinement** - Spec for structure, vibe for polish
3. **Honest Evaluation** - Knew when NOT to use features (MCP, extensive hooks)
4. **Complex Integration** - WebAudio + NASA API + OpenAI + Browser APIs
5. **Production Quality** - Error handling, fallbacks, user-friendly UI

**The Spirit Box showcases Kiro as a true development partner, not just a code generator.**
