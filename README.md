# ☀️ SolarSim — Accurate Solar System Simulator

An interactive 3D solar system simulator with real Kepler orbital mechanics. Watch all 8 planets orbit the Sun with scientifically accurate data, adjustable time controls, and eclipse detection.

**[🚀 Live Demo →](https://kai-claw.github.io/solarsim/)**

## Features

### 🌍 Real Orbital Mechanics
- **Kepler's Laws** — Newton-Raphson solver for Kepler's equation (M = E - e·sin(E))
- **True anomaly** computation from eccentric anomaly
- **Elliptical orbits** with real eccentricity values per planet
- **Orbital inclinations** rendered in 3D

### 🔭 Scale Modes
- **Visible Mode** — Exaggerated sizes/distances so you can see everything
- **Realistic Mode** — True proportional distances and sizes (space is BIG)
- Toggle between them instantly with the control panel or press `S`

### ⏱️ Time Controls
- Play/Pause simulation
- Speed: 1× to 10,000× real-time
- Watch years pass — see orbital periods play out
- Elapsed time counter (years + days)

### 🪨 Asteroid Belt
- 3,000 individual asteroids between Mars and Jupiter
- Orbiting with Kepler's 3rd law (period ∝ a^1.5)
- Toggleable visibility

### 🌑 Eclipse Detection
- Real-time alignment detection between all planet pairs
- Eclipse event log with timestamps and alignment strength
- Checks every 10 sim-days for conjunction events

### 📋 Planet Info Cards
- Click any planet (or the Sun) for detailed stats
- Radius, mass, distance, orbital period, rotation, gravity, escape velocity, temperature, axial tilt, moons, rings
- Follow button to lock camera on a planet

### 🎮 Controls
- **Mouse** — Orbit (left drag), zoom (scroll), pan (right drag)
- **Click planet** — Show info card
- **Follow** — Lock camera to track a planet's orbit

### ⌨️ Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Space | Play / Pause |
| ↑ / + | Speed up |
| ↓ / - | Slow down |
| S | Toggle scale mode |
| O | Toggle orbits |
| L | Toggle labels |
| B | Toggle asteroid belt |
| 1-8 | Focus planet (Mercury→Neptune) |
| 0 | Free camera |
| H / ? | Keyboard shortcuts |
| Esc | Deselect / close |

## Planet Data

All 8 planets with accurate NASA/JPL data:
- **Mercury** — 87.97 day orbit, 0.2056 eccentricity
- **Venus** — 224.7 day orbit, retrograde rotation
- **Earth** — 365.26 day orbit, 23.44° axial tilt
- **Mars** — 687.0 day orbit, 0.0934 eccentricity
- **Jupiter** — 4,333 day orbit, 95 moons, faint rings
- **Saturn** — 10,759 day orbit, 146 moons, prominent rings
- **Uranus** — 30,689 day orbit, 97.77° axial tilt (sideways!)
- **Neptune** — 60,195 day orbit, winds up to 2,100 km/h

## Tech Stack

- **React 19** + TypeScript
- **Three.js** via @react-three/fiber + @react-three/drei
- **Zustand** for state management
- **Custom orbital mechanics engine** (Kepler solver, no physics libraries)
- **Vite** for build tooling

## Development

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Architecture

```
src/
├── App.tsx                    # Main scene composition
├── main.tsx                   # Entry point
├── index.css                  # Global styles
├── data/
│   └── planets.ts             # Planet data (NASA/JPL values)
├── store/
│   └── store.ts               # Zustand state management
├── utils/
│   └── orbital.ts             # Kepler solver + orbital mechanics
└── components/
    ├── Sun.tsx                # Sun with custom shader corona
    ├── Planet.tsx             # Planet rendering + orbit lines
    ├── AsteroidBelt.tsx       # 3000 asteroid particles
    ├── Starfield.tsx          # 5000 background stars
    ├── CameraController.tsx   # OrbitControls + planet follow
    ├── SimLoop.tsx            # Time progression engine
    ├── EclipseDetector.tsx    # Conjunction alignment detector
    ├── EclipseLog.tsx         # Eclipse event feed
    ├── TimeControls.tsx       # Speed + play/pause UI
    ├── ControlPanel.tsx       # Settings + planet list
    ├── PlanetInfoCard.tsx     # Detailed planet stats
    └── KeyboardShortcuts.tsx  # Keyboard controls + help overlay
```

## License

MIT
