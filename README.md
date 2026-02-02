# ☀️ SolarSim — Accurate Solar System Simulator

An interactive 3D solar system simulator with real Kepler orbital mechanics, Hohmann transfer planning, comet tracking, and cinematic tours. Built with React 19, Three.js, and TypeScript.

**[🚀 Live Demo →](https://kai-claw.github.io/solarsim/)**

[![Tests](https://img.shields.io/badge/tests-199%20passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TS-0%20errors-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

## Features

### 🌍 Orbital Mechanics
- **8 planets** with NASA/JPL orbital elements (Mercury → Neptune)
- **Kepler solver** — Newton-Raphson iteration for eccentric anomaly
- **Elliptical orbits** with real eccentricity, inclination, and mean anomaly
- **Retrograde rotation** (Venus, Uranus) correctly modeled

### ☄️ Comets & Asteroids
- **3 famous comets** (Halley, Hale-Bopp, Encke) with ion tails
- **3,000-particle asteroid belt** with Kepler-based orbital speeds
- Comet tails grow near perihelion, fade at aphelion

### 🚀 Mission Planner
- **Hohmann transfer calculator** between any two planets
- Δv requirements, transfer time, phase angle
- **3D trajectory visualization** on the scene
- Physics tooltips explaining the math

### 🎬 Cinematic Tours
- **4 curated presets**: Grand Tour, Earth-to-Mars, Comet Watch, Sense of Scale
- Automated camera, speed changes, and narration cards
- Letterbox mode for theatrical feel

### 🌑 Eclipse Detection
- Real-time alignment detection between all planet pairs
- Event log with timestamps and alignment scores

### 🔗 URL State Sharing
- Every view state encoded in the URL hash
- Share exact moments: speed, camera target, toggles, elapsed time

### 🪐 Visual Design
- **Custom GLSL sun shader** with animated corona
- **Saturn rings** with proper inner/outer ratios (all ring planets supported)
- **Glass morphism UI** with backdrop blur
- **Cinematic entrance** — 3-second title reveal with vignette
- **Parallax starfield** — 5,000 colored stars with slow rotation
- Planet hover glow + selection ring

### ⌨️ Keyboard Shortcuts (14 bindings)

| Key | Action | Key | Action |
|-----|--------|-----|--------|
| Space | Play / Pause | T | Cinematic tours |
| ↑ / + | Speed up | S | Toggle scale mode |
| ↓ / - | Slow down | O | Toggle orbits |
| 1-8 | Focus planet | L | Toggle labels |
| 0 | Free camera | B | Toggle asteroid belt |
| C | Toggle comets | U | Copy share link |
| Esc | Deselect / close | H / ? | Toggle help |

## Planet Data

All 8 planets with accurate NASA/JPL data:

| Planet | Orbit (days) | Eccentricity | Type |
|--------|-------------|-------------|------|
| Mercury | 87.97 | 0.2056 | Terrestrial |
| Venus | 224.70 | 0.0068 | Terrestrial |
| Earth | 365.26 | 0.0167 | Terrestrial |
| Mars | 687.0 | 0.0934 | Terrestrial |
| Jupiter | 4,333 | 0.0489 | Gas Giant |
| Saturn | 10,759 | 0.0565 | Gas Giant |
| Uranus | 30,689 | 0.0457 | Ice Giant |
| Neptune | 60,195 | 0.0113 | Ice Giant |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 + TypeScript 5.9 |
| 3D Engine | Three.js 0.182 via @react-three/fiber |
| State | Zustand 5 |
| Build | Vite 7 |
| Tests | Vitest 4 (199 tests) |
| Deploy | GitHub Pages |

## Development

```bash
npm install
npm run dev       # Start dev server
npm run build     # TypeScript check + Vite production build
npm run test      # Run all 199 tests
npm run preview   # Preview production build
```

## Architecture

```
src/
├── App.tsx                     # Main scene composition
├── main.tsx                    # Entry point
├── index.css                   # Global styles + animations
├── data/
│   ├── planets.ts              # 8 planets + Sun (NASA/JPL)
│   └── comets.ts               # 3 comets (Halley, Hale-Bopp, Encke)
├── store/
│   └── store.ts                # Zustand: 13 state fields, 14 actions
├── utils/
│   ├── orbital.ts              # Kepler solver, orbital mechanics
│   ├── hohmann.ts              # Hohmann transfer calculator
│   ├── scale.ts                # Distance/radius scaling functions
│   ├── urlState.ts             # URL hash encode/decode
│   ├── constants.ts            # Shared speed options
│   └── tourPresets.ts          # 4 cinematic tour presets
└── components/
    ├── Sun.tsx                 # GLSL corona shader + glow
    ├── Planet.tsx              # Planet mesh, orbit, label, rings
    ├── Comet.tsx               # Comet with ion tail
    ├── AsteroidBelt.tsx        # 3,000 Kepler-speed particles
    ├── Starfield.tsx           # 5,000 parallax stars
    ├── CameraController.tsx    # OrbitControls + planet follow
    ├── SimLoop.tsx             # Time advancement engine
    ├── EclipseDetector.tsx     # Conjunction alignment detector
    ├── EclipseLog.tsx          # Eclipse event feed
    ├── MissionPlanner.tsx      # Hohmann UI
    ├── MissionTrajectory.tsx   # 3D transfer arc
    ├── PhysicsTooltips.tsx     # Educational formulas
    ├── TimeControls.tsx        # Speed + play/pause
    ├── ControlPanel.tsx        # Settings + planet list
    ├── PlanetInfoCard.tsx      # Detailed planet stats
    ├── CinematicTour.tsx       # Automated tour player
    ├── KeyboardShortcuts.tsx   # 14 keyboard bindings + help
    └── URLStateSync.tsx        # URL ↔ store sync
```

## Test Suite (199 tests)

| Suite | Tests | Coverage |
|-------|:-----:|---------|
| Orbital Mechanics | 43 | Kepler solver, true anomaly, orbit paths, eclipses |
| URL State | 28 | Encode/decode, round-trips, edge cases |
| Scale Utilities | 13 | Distance, radius, AU conversions |
| Hohmann Transfers | 11 | Delta-v, transfer time, all planet pairs |
| Tour Presets | 10 | Preset structure, stop validation |
| Comet Data | 10 | Orbital params, perihelion consistency |
| Architecture | 80 | Structure, data integrity, store shape, cross-module |
| Constants | 4 | Speed options validation |

## License

MIT
