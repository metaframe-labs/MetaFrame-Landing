# MetaFrame Labs — Official Web Portal

**We don't build websites. We build minds.**  
Live Portal: [metaframelabs.space](https://www.metaframelabs.space/) · Google Play: **MetaFrame Labs** · Contact: `metaframe.labs@proton.me`

```text
> mounting metaframe.core ...
> loading models ............ ok
> privacy layer ............. ON
> telemetry ................. none
> welcome to the lab.
```

Official web portal and interactive showcase for **MetaFrame Labs** — an independent software & AI engineering studio building privacy-prioritizing, edge-first mobile applications and autonomous developer tooling.

Built as a **zero-build static site** in **HTML5, CSS3, and Vanilla JavaScript**, powered by **Three.js (`r149`)**, **Lenis (`v1.0.42`)**, custom **GLSL shaders**, **Canvas 2D**, and procedural **Web Audio API** synthesis. No bundler, framework runtime, or tracking/analytics scripts are used (`telemetry: none`).

---

## Page Architecture & Interactive Modules (`01` – `06`)

| Section | Module | What Actually Runs in the Browser |
| --- | --- | --- |
| **Hero & FX** | **WebGL Particle Universe & Synth** | Boot terminal overlay (`sessionStorage`-cached) + split-letter glitch hero, scrolling **3,500–7,000 WebGL particle morph** across 6 shapes (`"M"` glyph → Fibonacci sphere → Meta Box cube → torus knot → wave plane → spiral galaxy) + **2,200-star field**, multi-pass GLSL bloom/chromatic-aberration/lens-warp post-processing, Canvas 2D fallback, Lenis smooth scroll, Konami / footer `◆` emerald theme toggle (`↑↑↓↓←→←→ba`), and a **104 BPM procedural Web Audio synth** (`SOUND ON / OFF`). |
| **01** | **The Lab is Alive** | Animated studio counters (`7` products live on Google Play, `100%` privacy-prioritizing by design, `1` mission) backed directly by static HTML values with `prefers-reduced-motion` support. |
| **02** | **Idea → App, Live** (`metabox://prompt`) | Custom **Three.js shader vortex (`4,500` mobile / `9,000` desktop particles)** simulating the **Meta Box** pipeline (`parse` → `wire` → `compose` → `ship`). Loops 4 preset demos (`currency converter`, `pomodoro focus timer`, `tiny puzzle game`, `dev news stream`) or morphs any custom user prompt into particles and renders a simulated mobile UI preview. |
| **03** | **The Cartridges & 3D Phone** (`metaframe · deck-01`) | Tactile **9-cartridge** spring-tilt rack (`MF-01` – `MF-09`, `9 carts · sn-2026`) that flies cartridges into a console slot, runs a CRT boot log, and opens an interactive drag-to-rotate **Three.js 3D phone modal** (`phone.js`) with a live `512×1088` screen UI unique to every app. |
| **04** | **Open Source Simulations** | Three interactive browser visualizers for MetaFrame Labs' open-source developer tooling: **`repo-intelligence-layer`**, **`i18next-local-inference`**, and **`autonomousengineeringsystem`**. |
| **05** | **Operating Principles** | Core studio principles: intelligence at the edge, shipping real products, neurodivergent-inclusive design, and lightweight global scale. |
| **06** | **Open a Channel** | Direct contact (`metaframe.labs@proton.me`), Google Play publisher reference, and footer theme toggle (`◆`). |

---

## Cartridge Catalog (`Section 03` · `MF-01` – `MF-09`)

Each cartridge on the rack boots inside the CRT unit (`cards.js`), includes semantic HTML + **Schema.org JSON-LD** catalog metadata for crawlers/AI search (`index.html`), and renders its own animated app UI inside the 3D device viewer (`phone.js`):

| ID | Product | Tagline | Platform / Link | 3D Phone UI Simulation |
| --- | --- | --- | --- | --- |
| **MF-01** | **Meta Box** | Create apps with AI | [Google Play](https://play.google.com/store/apps/details?id=com.metaframe.metabox) (`live`) | Prompt-to-timer build stream & countdown ring |
| **MF-02** | **Neurodivergence** | Consciousness | [Google Play](https://play.google.com/store/apps/details?id=com.metaframe.neurodivergence) (`live`) | Animated breathing orb (`Focus` / `Flow` / `Calm`) |
| **MF-03** | **Mindhouse** | AI study companion | [Google Play](https://play.google.com/store/apps/details?id=com.metaframe.mindhouse) (`live`) | AI tutor Q&A card & 7-day study streak chart |
| **MF-04** | **Divergent AI** | Think differently | [Google Play](https://play.google.com/store/apps/details?id=com.metaframe.divergentai) (`live`) | Dynamic orbiting non-linear idea graph |
| **MF-05** | **FocusTabs** | Stay in flow | [Google Play](https://play.google.com/store/apps/details?id=com.melihcandemir.focustabs) (`live`) | Deep-focus countdown ring & active tab stack |
| **MF-06** | **Mindbook Lite** | Lightweight notes | [Google Play](https://play.google.com/store/apps/details?id=com.melihcandemir.mindbook.free) (`live`) | Fast typed quick-notes & offline badge |
| **MF-07** | **Mindbook** | Markdown cloud notes | [Google Play](https://play.google.com/store/apps/details?id=com.melihcandemir.mindbook) (`live`) | Typed Markdown note with code block & cloud sync indicator |
| **MF-08** | **RetroDeck OS** | 100-in-1 Retro Console & OS | [GitHub](https://github.com/neurodivergent-dev/retrodeck-arcade) (`live`) | Nokia 3310 monochrome LCD (`SNAKE DX`, signal/battery, 9-provider AI, WAP 1.1, synth specs) |
| **MF-09** | **CyberDeck OS** | First Programmable Launcher | [Google Play](https://play.google.com/store/apps/details?id=com.metaframe.cyberdeck) (`live`) | Live `neofetch` terminal, RAM ring, `60.0 FPS` shader status, oscilloscope & agent log |

---

## Open-Source Simulations (`Section 04`)

1. **[`repo-intelligence-layer`](https://github.com/neurodivergent-dev/repo-intelligence-layer)** *(`intel.js`)*  
   3-layer parallax knowledge graph (`far` / `mid` / `near` canvases) with pointer gravity, click-triggered pulse waves, travelling edge packets, and a 6-step verification chain (**TypeScript**, **Blast radius**, **Theme tokens**, **Zero-emoji**, **i18n integrity**, **AST health**).
2. **[`i18next-local-inference`](https://github.com/neurodivergent-dev/i18next-local-inference)** *(`babel.js` · Apache-2.0)*  
   Simulated local Ollama translation pipeline (`babel://pipeline · localhost:5960`) featuring falling multilingual script glyphs, auto-detecting browser locale, cycling headlines across 15 languages, and replaying **Translator `gemma4:12b`** + **Judge `gemma4:26b`** across `15` visible locale tiles (representing `29` locales) with cognate checks (`COGNATE ✓`) and automatic repair of untranslated strings (`FORGOTTEN` → `FIXED ✓`).
3. **[`autonomousengineeringsystem`](https://github.com/neurodivergent-dev/autonomousengineeringsystem)** *(`aes.js` · MIT)*  
   Mission-control visualizer (`aes://mission-control · bun`) combining a 46-blip sweep blast-radius radar with a 4-agent crew (**Orion** PRD → **Daedalus** ADR → **Vulcan** Plan → **Aegis** Gates) enforcing 6 gates (`TSC`, `BLAST`, `THEME`, `EMOJI`, `I18N`, `AST`) — including simulated gate failures and self-healing retries for preset or custom missions.

---

## Repository Structure

```text
MetaFrame-Landing/
├── index.html          # Semantic HTML5 document, JSON-LD catalog, section markup
├── style.css / cards.css / intel.css / babel.css / aes.css
├── main.js             # Boot overlay, 2D Canvas "M" particle fallback, observers, Konami toggle
├── fx.js               # Lenis scroll, magnetic UI, 3,500–7,000-particle 3D WebGL field
├── wow.js              # Starfield, GLSL bloom/CA/grain post-processing, Web Audio synth, cursor labels
├── forge.js            # Section 02 "Idea -> App" 4,500–9,000-particle shader simulation
├── cards.js            # Section 03 9-cartridge rack physics, flight animation & CRT boot terminal
├── phone.js            # Interactive Three.js 3D phone showcase with per-app procedural screen UIs
├── icons-data.js       # Pre-encoded window.__ICONS data URIs for CORS-free/file:// WebGL textures
├── intel.js            # Section 04 Repo Intelligence Layer parallax graph simulation
├── babel.js            # Section 04 i18next-local-inference local Ollama pipeline simulation
├── aes.js              # Section 04 autonomousengineeringsystem crew + Aegis radar simulation
├── icons/              # High-resolution PNG/ICO app icons & MetaFrame brand icon
└── favicon.ico         # Site favicon
```

---

## Local Development

No package install or build step is required. External libraries (`three@0.149.0`, `@studio-freight/lenis@1.0.42`, Google Fonts) are loaded via CDN, and embedded `icons-data.js` URIs allow `file://` icon rendering too; for best results (and ES/CORS consistency), serve locally over HTTP:

```bash
git clone https://github.com/metaframe-labs/MetaFrame-Landing.git
cd MetaFrame-Landing

# Serve locally (Python or Node)
python -m http.server 8080
# or
npx serve .
```

---

© 2026 **MetaFrame Labs** — Building intelligent products at scale.
