# ☀️ SolarSim — Accurate Solar System Simulator

An interactive 3D solar system simulator with real orbital mechanics based on Kepler's laws.

**[🔗 Live Demo](https://kai-claw.github.io/solarsim/)**

## Features

- **Real Orbital Mechanics** — Kepler's equation solver (Newton-Raphson) for accurate elliptical orbits
- **All 8 Planets + Sun** — Accurate relative sizes and orbital parameters
- **Scale Toggle** — Switch between realistic astronomical scale and exaggerated visible scale
- **Time Controls** — Pause, play, speed up from 1× to 10,000× (watch years fly by)
- **Asteroid Belt** — 3,000 procedural asteroids orbiting per Kepler's 3rd law
- **Planet Info Cards** — Click any planet for detailed stats (mass, distance, orbital period, gravity, etc.)
- **Eclipse Detection** — Automatic detection of planetary alignments
- **Camera Controls** — Orbit, zoom, pan, or follow any planet
- **Starfield Background** — 5,000 procedural stars with color variation

## Tech Stack

- React 19 + TypeScript
- Three.js via @react-three/fiber & @react-three/drei
- Zustand (state management)
- Vite (build tool)

## Orbital Mechanics

The simulator solves Kepler's equation `M = E - e·sin(E)` using Newton-Raphson iteration to compute true anomaly from mean anomaly for each planet at each timestep. Orbital parameters (semi-major axis, eccentricity, inclination, mean anomaly at epoch) are based on J2000 epoch data.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## License

MIT
