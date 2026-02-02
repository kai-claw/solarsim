# SolarSim — White Hat Audit (Pass 1/10)

**Date:** 2025-07-15  
**Auditor:** Claude (automated baseline)  
**Commit at audit:** `0136b99`  

---

## 1. Overview

SolarSim is a solar system simulator built with React 19, Three.js (via React Three Fiber), and Zustand for state management. It renders 8 planets with Kepler orbital mechanics (Newton-Raphson solver), a custom GLSL sun corona, 3,000-particle asteroid belt, eclipse/conjunction detection, and full keyboard controls. The app is deployed to GitHub Pages at `/solarsim/`.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.2.0 |
| 3D Engine | Three.js | 0.182.0 |
| 3D React Binding | @react-three/fiber | 9.5.0 |
| 3D Helpers | @react-three/drei | 10.7.7 |
| State Management | Zustand | 5.0.11 |
| Build Tool | Vite | 7.2.4 |
| Language | TypeScript | 5.9.3 |
| Linting | ESLint | 9.39.1 |
| Package Manager | npm | (lockfile present) |

---

## 3. File Inventory

**Total source files:** 18 (17 TS/TSX + 1 CSS)  
**Total LOC:** 1,779  

### Components (12 files, 1,274 LOC)

| File | LOC | Role |
|------|-----|------|
| PlanetInfoCard.tsx | 221 | Selected planet/Sun detail card |
| ControlPanel.tsx | 175 | Left sidebar: scale, toggles, camera follow |
| Planet.tsx | 163 | Planet mesh, orbit line, label, rings, selection |
| KeyboardShortcuts.tsx | 159 | Keyboard handler + help modal overlay |
| TimeControls.tsx | 98 | Bottom bar: play/pause, speed buttons, elapsed time |
| Sun.tsx | 85 | Sun mesh with GLSL corona shader + glow + lights |
| AsteroidBelt.tsx | 77 | 3,000-particle belt with Kepler-based speeds |
| EclipseLog.tsx | 70 | Bottom-right event log for detected eclipses |
| CameraController.tsx | 67 | OrbitControls + camera-follow-planet logic |
| EclipseDetector.tsx | 62 | Checks all planet pairs for alignment each 10 sim-days |
| Starfield.tsx | 59 | 5,000-point starfield with color variety + slow rotation |
| SimLoop.tsx | 18 | useFrame time advancement (delta × speed → days) |

### Data (1 file, 212 LOC)

| File | LOC | Role |
|------|-----|------|
| planets.ts | 212 | PlanetData interface, SUN_DATA, 8 PLANETS with NASA/JPL values |

### Utils (1 file, 140 LOC)

| File | LOC | Role |
|------|-----|------|
| orbital.ts | 140 | solveKepler, trueAnomaly, orbitalRadius, getPlanetPosition, getOrbitPath, checkEclipseAlignment |

### Store (1 file, 78 LOC)

| File | LOC | Role |
|------|-----|------|
| store.ts | 78 | Zustand store: time, display toggles, camera, eclipse events |

### App/Entry (3 files, 95 LOC)

| File | LOC | Role |
|------|-----|------|
| App.tsx | 46 | Root layout: Canvas with 3D scene + HTML overlays |
| main.tsx | 19 | ReactDOM.createRoot, loader removal |
| index.css | 30 | Global reset, scrollbar styles, fadeIn keyframe |

---

## 4. Feature List

### User-Facing Features

| # | Feature | Status | Implementation |
|---|---------|--------|---------------|
| 1 | 8 planets with Kepler orbits | ✅ Working | Newton-Raphson solver in orbital.ts |
| 2 | Sun with GLSL corona shader | ✅ Working | Custom ShaderMaterial in Sun.tsx |
| 3 | 3,000-particle asteroid belt | ✅ Working | Buffer geometry + Kepler speeds |
| 4 | 5,000-star background | ✅ Working | Colored points with slow parallax rotation |
| 5 | Time controls (play/pause) | ✅ Working | Space bar or button |
| 6 | Speed presets (1×–10,000×) | ✅ Working | 8 presets: 1, 10, 50, 100, 500, 1K, 5K, 10K |
| 7 | Elapsed time display | ✅ Working | Years + days in monospace |
| 8 | Scale toggle (visible/realistic) | ✅ Working | Exaggerated (log-scaled) vs AU-scaled |
| 9 | Orbit path lines | ✅ Working | drei `<Line>` with per-planet color |
| 10 | Planet labels (HTML overlay) | ✅ Working | drei `<Html>` above each planet |
| 11 | Planet info card (click) | ✅ Working | 12 stats: radius, mass, gravity, etc. |
| 12 | Sun info card (click) | ✅ Working | Radius, mass, temperature |
| 13 | Camera follow planet | ✅ Working | Lerp-based camera + controls target |
| 14 | Eclipse/conjunction detection | ✅ Working | Dot-product alignment check, 0.08 rad threshold |
| 15 | Eclipse event log | ✅ Working | Last 20 events, shows top 10 reversed |
| 16 | Display toggles (orbits/labels/belt/eclipses) | ✅ Working | Checkboxes in ControlPanel |
| 17 | Keyboard shortcuts (11 bindings) | ✅ Working | Space, arrows, 0–8, S, O, L, B, H/?, Esc |
| 18 | Help modal overlay | ✅ Working | Press H or ? to toggle |
| 19 | Planet rings (Saturn, Jupiter, Uranus, Neptune) | ✅ Working | drei `<Ring>` with configurable inner/outer |
| 20 | Selection ring highlight | ✅ Working | Green ring on selected planet |
| 21 | Loading screen | ✅ Working | Pulsing "☀️ Loading..." fades out |
| 22 | Retrograde rotation (Venus, Uranus) | ✅ Working | Negative rotationPeriod handled |
| 23 | OrbitControls (pan/zoom/rotate) | ✅ Working | drei OrbitControls with damping |
| 24 | Follow/unfollow button on info card | ✅ Working | Toggles cameraTarget |

### Not Present / Out of Scope

- No moon rendering (data exists: moon counts in planet data, but no Moon objects)
- No textures (planets are solid colored spheres)
- No planet atmosphere effects
- No sound/audio
- No responsive/mobile layout (desktop-first, no touch optimization)
- No URL routing or deep linking
- No persistence (state resets on reload)
- No i18n

---

## 5. Test Status

| Metric | Value |
|--------|-------|
| Test files | **0** |
| Test runner configured | **No** (no vitest, jest, or testing-library in dependencies) |
| Test scripts in package.json | **No** `test` script defined |
| Coverage | **N/A** |

**Coverage gaps:** The entire codebase is untested. `orbital.ts` (pure math) is the most testable module with zero tests.

---

## 6. Build Status

### TypeScript Compilation

```
npx tsc -b --noEmit → EXIT 0 (clean)
```

**0 type errors.** Clean compilation.

### Vite Production Build

```
npm run build → ✓ built in 2.73s
```

| Output | Size | Gzip |
|--------|------|------|
| dist/index.html | 1.64 KB | 0.84 KB |
| dist/assets/index-*.css | 0.43 KB | 0.29 KB |
| dist/assets/index-*.js | 1,143.32 KB | 320.22 KB |

**⚠️ Build warning:** JS bundle exceeds 500 KB (1,143 KB). Vite suggests code-splitting via dynamic imports or manual chunks. The bulk is Three.js (~1.1 MB minified).

### Deployment Configuration

- `vite.config.ts` sets `base: '/solarsim/'` for GitHub Pages
- No CI/CD workflow files detected (no `.github/workflows/`)
- Deployment presumably manual or via separate mechanism

---

## 7. Code Quality Notes

### TODOs / FIXMEs / Hacks

```
grep -rn "TODO|FIXME|HACK|XXX|hack|todo|fixme" src/ → 0 results
```

**Zero TODOs or FIXMEs in the codebase.**

### Console Statements

```
grep -rn "console\." src/ → 0 results
```

**Zero console.log/warn/error statements.** Clean.

### Dead Code / Unused Imports

- `src/main.tsx` line 4: `import './index.css'` — side-effect import (valid, not dead)
- No unused variable warnings from TypeScript
- `EclipseDetector.tsx` has a `useEffect(() => {}, [...])` comment says "suppress unused var warnings" — a workaround, not dead code per se

### Code Patterns Observed

- **Duplicated distance scaling function:** `getDistance()` is defined independently in 3 files: `Planet.tsx`, `EclipseDetector.tsx`, `CameraController.tsx`. All have identical logic but are not shared from a util.
- **Inline styles throughout:** All UI components use inline style objects. No CSS modules, no styled-components, no Tailwind. Consistent pattern but not extractable/themeable.
- **Type casting in click handlers:** `Sun.tsx` and `Planet.tsx` both cast Three.js event types manually (`e as { stopPropagation: () => void }`).
- **SPEED_OPTIONS duplicated:** Defined in both `TimeControls.tsx` and `KeyboardShortcuts.tsx` as separate `const` arrays.

### Dependencies Analysis

- **Runtime deps:** 7 (react, react-dom, three, @types/three, @react-three/fiber, @react-three/drei, zustand)
- **Dev deps:** 8 (typescript, vite, eslint + plugins, type definitions)
- **Note:** `@types/three` is in `dependencies` rather than `devDependencies` (harmless but unconventional)
- **No test deps:** No vitest, jest, testing-library, or similar

---

## 8. Baseline Metrics

| Metric | Value |
|--------|-------|
| Source files | 18 |
| Total LOC | 1,779 |
| Components | 12 |
| Hooks (custom) | 0 |
| Utility modules | 1 |
| Store modules | 1 |
| Data modules | 1 |
| TypeScript errors | 0 |
| Build status | ✅ Pass |
| Build time | 2.73s |
| Bundle size (JS) | 1,143 KB (320 KB gzip) |
| Bundle size (CSS) | 0.43 KB |
| Test count | 0 |
| Test coverage | 0% |
| TODO/FIXME count | 0 |
| Console.log count | 0 |
| Git commits | 2 |
| Dependencies (runtime) | 7 |
| Dependencies (dev) | 8 |
| Planets modeled | 8 |
| User features | 24 |
| CI/CD pipelines | 0 |

---

## 9. Architecture Summary

```
main.tsx → App.tsx
              ├── Canvas (R3F)
              │   ├── SimLoop (time advancement)
              │   ├── CameraController (OrbitControls + follow)
              │   ├── Starfield (5000 points)
              │   ├── Sun (GLSL shader)
              │   ├── Planet × 8 (Kepler orbits)
              │   ├── AsteroidBelt (3000 particles)
              │   └── EclipseDetector (alignment checks)
              │
              └── HTML Overlays
                  ├── ControlPanel (top-left)
                  ├── TimeControls (bottom-center)
                  ├── PlanetInfoCard (top-right)
                  ├── EclipseLog (bottom-right)
                  └── KeyboardShortcuts (bottom-right hint + modal)

State: Zustand store (single flat store, 13 state fields, 12 actions)
Orbital math: orbital.ts (Kepler solver, true anomaly, eclipse alignment)
Planet data: planets.ts (8 planets + Sun, NASA/JPL values)
```

---

*End of White Hat Audit — Pass 1/10*
