# ☀️ SolarSim — Interactive Solar System Simulator

A cinematic 3D solar system simulator with real Kepler orbital mechanics, Hohmann transfer planning, comet tracking, spacetime curvature visualization, and time travel to famous astronomical events. Built with React 19, Three.js, and TypeScript.

**[🚀 Launch SolarSim →](https://kai-claw.github.io/solarsim/)**

[![Tests](https://img.shields.io/badge/tests-248%20passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue)]()
[![Bundle](https://img.shields.io/badge/bundle-334%20KB%20gzip-orange)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## ✨ Features

### 🌍 Orbital Mechanics Engine
- **8 planets** (Mercury → Neptune) with NASA/JPL orbital elements
- **Kepler solver** — Newton-Raphson iteration for eccentric anomaly with convergence guards
- **Elliptical orbits** with real eccentricity, inclination, longitude of ascending node, and argument of perihelion
- **Retrograde rotation** correctly modeled for Venus and Uranus
- Two scale modes: **exaggerated** (log-scaled for visibility) and **realistic** (AU-proportional)

### ☄️ Comet System
- **3 famous comets**: Halley's Comet (76y period), Hale-Bopp (2,520y), Encke (3.3y)
- **Dynamic ion tails** that grow near perihelion and fade at aphelion
- Accurate orbital elements including high eccentricities (0.85–0.995)

### 🚀 Mission Planner
- **Hohmann transfer calculator** between any two planets
- Computes Δv₁ (departure), Δv₂ (arrival), total Δv, transfer time, and phase angle
- **3D trajectory arc** rendered live on the scene
- Physics tooltips explaining the vis-viva equation and transfer geometry

### 🎬 Cinematic Tours
- **4 curated presets**: Grand Tour, Earth-to-Mars, Comet Watch, Sense of Scale
- Automated camera targeting, speed changes, and narration cards per stop
- **Letterbox mode** with theatrical black bars and HUD overlay
- Smooth spring-eased camera transitions between stops

### 🕳️ Gravity Well Visualizer
- **GLSL-powered spacetime curvature grid** (80×80 mesh, 6,400 vertices)
- Sun creates a deep gravity well; planets create proportional dips
- Real-time vertex displacement follows planet positions
- Toggle on/off with the `G` key

### ⏳ Time Machine
- **10 historical astronomical events** with accurate dates (J2000 epoch)
- Events include: Halley's 1986 return, Shoemaker-Levy 9 impact, Venus Transit 2004, Mars closest approach 2003, and more
- One-click time travel jumps to the event date with optional camera focus
- Color-coded categories: comets, transits, eclipses, alignments, oppositions, historic

### 🌑 Eclipse Detection
- Real-time Sun-planet alignment detection across all planet pairs
- Dot-product angular proximity scoring (0.08 radian threshold)
- Event log with timestamps, planet pairs, and alignment scores

### 🔗 URL State Sharing
- Full simulation state encoded in URL hash
- Share exact moments: speed, camera target, all toggles, elapsed time
- Press `U` to copy the current view link to clipboard

### 🪐 Visual Design
- **Custom GLSL sun shader** with animated, pulsing corona
- **Saturn ring system** with accurate inner/outer radius ratios (supported for all ring planets)
- **Glass morphism UI** — frosted panels with backdrop blur, subtle borders, spring animations
- **Cinematic entrance** — 3-second title reveal with pulsing subtitle and vignette fade
- **Dual-layer parallax starfield** — 5,000 colored stars with slow rotation
- **Planet hover glow** + selection ring + scale pop micro-interaction
- **Toggle switches** with smooth sliding animation and color transitions
- **Staggered panel entrance** — UI elements cascade in with spring easing

### 🔔 Asteroid Belt
- **3,000 Kepler-speed particles** orbiting between Mars and Jupiter
- Each asteroid follows its own elliptical orbit with proper angular velocity
- Togglable via controls or keyboard

---

## ⌨️ Keyboard Shortcuts

| Key | Action | Key | Action |
|-----|--------|-----|--------|
| `Space` | Play / Pause | `T` | Open cinematic tours |
| `↑` / `+` | Speed up | `G` | Toggle gravity grid |
| `↓` / `-` | Slow down | `M` | Open time machine |
| `1`–`8` | Focus planet | `S` | Toggle scale mode |
| `0` | Free camera | `O` | Toggle orbits |
| `C` | Toggle comets | `L` | Toggle labels |
| `B` | Toggle asteroid belt | `U` | Copy share link |
| `Esc` | Deselect / close | `H` / `?` | Toggle help overlay |

**16 keyboard actions** covering all simulation controls.

---

## 🪐 Planet Data (NASA/JPL)

| Planet | Period (days) | Eccentricity | Incl. (°) | Type |
|--------|:------------:|:------------:|:---------:|------|
| Mercury | 87.97 | 0.2056 | 7.00 | Terrestrial |
| Venus | 224.70 | 0.0068 | 3.39 | Terrestrial |
| Earth | 365.26 | 0.0167 | 0.00 | Terrestrial |
| Mars | 687.0 | 0.0934 | 1.85 | Terrestrial |
| Jupiter | 4,333 | 0.0489 | 1.30 | Gas Giant |
| Saturn | 10,759 | 0.0565 | 2.49 | Gas Giant |
| Uranus | 30,689 | 0.0457 | 0.77 | Ice Giant |
| Neptune | 60,195 | 0.0113 | 1.77 | Ice Giant |

---

## 🏗️ Architecture

```
src/                              32 source files, 4,686 LOC
├── App.tsx                       Main scene composition + layout
├── main.tsx                      Entry point, loader teardown
├── index.css                     CSS system: animations, glass, toggles (203 LOC)
│
├── data/                         Static datasets
│   ├── planets.ts                8 planets + Sun (NASA/JPL orbital elements)
│   ├── comets.ts                 3 comets (Halley, Hale-Bopp, Encke)
│   └── timeEvents.ts            10 historical astronomical events
│
├── store/
│   └── store.ts                  Zustand store: 15+ state fields, 18+ actions
│
├── utils/                        Pure logic (100% unit tested)
│   ├── orbital.ts                Kepler solver, true anomaly, orbit paths, eclipses
│   ├── hohmann.ts                Hohmann transfer Δv calculator
│   ├── scale.ts                  Distance/radius scaling functions
│   ├── urlState.ts               URL hash encode/decode (bi-directional)
│   ├── constants.ts              Shared speed presets
│   └── tourPresets.ts            4 cinematic tour presets
│
└── components/                   React + Three.js components
    ├── Sun.tsx                   GLSL corona shader + glow sprite
    ├── Planet.tsx                Planet mesh, orbit line, rings, label, selection
    ├── Comet.tsx                 Comet with dynamic ion tail particles
    ├── AsteroidBelt.tsx          3,000 Kepler-speed asteroid particles
    ├── Starfield.tsx             5,000 parallax colored stars
    ├── GravityGrid.tsx           GLSL spacetime curvature grid (80×80)
    ├── CameraController.tsx      OrbitControls + spring-eased planet follow
    ├── SimLoop.tsx               Time advancement engine (delta × speed → days)
    ├── EclipseDetector.tsx       Conjunction alignment detector
    ├── EclipseLog.tsx            Eclipse event feed panel
    ├── MissionPlanner.tsx        Hohmann transfer UI
    ├── MissionTrajectory.tsx     3D transfer arc visualization
    ├── PhysicsTooltips.tsx       Educational formula tooltips
    ├── CinematicTour.tsx         Tour player + TourSelector + TourHUD
    ├── TimeMachine.tsx           Historical event browser + time travel
    ├── TimeControls.tsx          Speed presets + play/pause + elapsed time
    ├── ControlPanel.tsx          Settings panel + planet list
    ├── PlanetInfoCard.tsx        Detailed planet statistics card
    ├── KeyboardShortcuts.tsx     16 keyboard bindings + help overlay
    └── URLStateSync.tsx          URL ↔ store bi-directional sync
```

**Data flow:** `data/ → utils/ → store/ → components/ → App.tsx` — clean DAG, no circular deps.

---

## 🧪 Test Suite — 248 Tests

| Suite | Tests | Validates |
|-------|:-----:|-----------|
| Architecture & Structure | 92 | File organization, data integrity, store shape, exports, build config, cross-module consistency |
| Orbital Mechanics | 43 | Kepler solver convergence, true anomaly, orbit paths, eclipse alignment, edge cases |
| URL State | 28 | Encode/decode round-trips, partial state, edge cases, defaults |
| Cleanup & Resources | 18 | GPU memory disposal (geometry + materials), timer cleanup, no console.logs |
| Scale Utilities | 13 | Distance scaling, radius scaling, AU conversions |
| Time Events | 12 | 10 events valid, J2000 date math, categories, focus planets |
| Hohmann Transfers | 11 | Δv calculations, transfer times, all planet pairs, edge cases |
| Tour Presets | 10 | 4 presets structure, stop validation, grand tour completeness |
| Comet Data | 10 | Orbital parameters, perihelion consistency (a × (1-e)), tail config |
| Gravity Grid | 7 | Grid constants, planet gravity map, disposal patterns |
| Constants | 4 | Speed options validation, monotonic ordering |

All 248 tests pass in **282ms**.

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React + TypeScript | 19.2 + 5.9 |
| 3D Engine | Three.js via @react-three/fiber | 0.182 |
| 3D Helpers | @react-three/drei | 10.7 |
| State | Zustand | 5.0 |
| Build | Vite | 7.2 |
| Tests | Vitest | 4.0 |
| Deploy | GitHub Pages | — |

---

## 🚀 Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # TypeScript check + Vite production build
npm test             # Run all 248 tests
npm run preview      # Preview production build locally
```

---

## 📊 Development Process — Six Thinking Hats (10 Passes)

SolarSim was built iteratively using the **Six Thinking Hats** methodology — each pass applies a different thinking mode to evolve the project:

| Pass | Hat | Focus | Key Deliverables |
|:----:|-----|-------|-----------------|
| 1 | ⚪ White | Facts & Audit | Baseline assessment: 18 files, 1,779 LOC, 0 tests, 24 features |
| 2 | ⚫ Black | Risks & Problems | Vitest infrastructure, 60 tests, deduplicated utils, Kepler guards |
| 3 | 🟢 Green | Creative Ideas | Comet system (3 comets + ion tails), Mission Planner (Hohmann transfers) |
| 4 | 🟡 Yellow | Value & Strengths | Cinematic tours, physics tooltips, URL sharing, Saturn rings |
| 5 | 🔴 Red | Feel & Intuition | Cinematic entrance, glass UI, sun corona, starfield, hover glow |
| 6 | 🔵 Blue | Process & Summary | 80 structural tests (199 total), architecture validation, README + AUDIT |
| 7 | 🟢 Green | Creative Ideas #2 | Gravity Well Visualizer (GLSL), Time Machine (10 events) |
| 8 | ⚫ Black | Risks & Problems #2 | 4 GPU memory leaks fixed, timer cleanup, component extraction |
| 9 | 🔴 Red | Feel & Intuition #2 | Cinematic loader, toggle switches, staggered entrance, micro-interactions |
| 10 | ⚪ White | Final Verification | Build verification, code audit, showcase docs, deploy |

---

## 📈 Final Metrics

| Metric | Value |
|--------|-------|
| Source files | 32 |
| Test files | 11 |
| Source LOC | 4,686 |
| Test LOC | 2,061 |
| CSS LOC | 203 |
| **Total LOC** | **6,950** |
| Tests | **248 passing** |
| TypeScript errors | **0** |
| Bundle (JS) | 1,196 KB (334 KB gzip) |
| Bundle (CSS) | 2.8 KB (0.9 KB gzip) |
| Build time | 2.7s |
| Planets | 8 (NASA/JPL data) |
| Comets | 3 (Halley, Hale-Bopp, Encke) |
| Historical events | 10 |
| Tour presets | 4 |
| Keyboard shortcuts | 16 actions |
| Git commits | 11 |

---

## 📜 License

MIT
