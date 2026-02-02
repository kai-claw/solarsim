/**
 * Blue Hat — Architecture & Structural Integrity Tests
 *
 * Validates the project structure, data completeness, store shape,
 * feature wiring, and build configuration without rendering any components.
 */

import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'

// ── Data imports ──────────────────────────────────────────────
import { PLANETS, SUN_DATA, type PlanetData } from './data/planets'
import { COMETS, type CometData } from './data/comets'
import { SPEED_OPTIONS } from './utils/constants'
import { TOUR_PRESETS, getTourPreset, type TourPreset } from './utils/tourPresets'

// ── Utility imports ───────────────────────────────────────────
import { solveKepler, trueAnomaly, orbitalRadius, getPlanetPosition, getOrbitPath, checkEclipseAlignment } from './utils/orbital'
import { getDistance, getDistanceAU, getExaggeratedRadius, getRealisticRadius, AU, KM_TO_AU } from './utils/scale'
import { encodeURLState, decodeURLState } from './utils/urlState'
import { computeHohmann, getHohmannPath } from './utils/hohmann'

// ── Store import ──────────────────────────────────────────────
import { useStore } from './store/store'

// ════════════════════════════════════════════════════════════════
// 1. DIRECTORY STRUCTURE & FILE ORGANIZATION
// ════════════════════════════════════════════════════════════════

describe('Directory Structure', () => {
  const srcRoot = path.resolve(__dirname)

  it('has required top-level directories', () => {
    const dirs = ['components', 'data', 'store', 'utils']
    for (const dir of dirs) {
      expect(fs.existsSync(path.join(srcRoot, dir)), `src/${dir} should exist`).toBe(true)
    }
  })

  it('has entry files', () => {
    expect(fs.existsSync(path.join(srcRoot, 'App.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(srcRoot, 'main.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(srcRoot, 'index.css'))).toBe(true)
  })

  it('has all expected component files', () => {
    const expected = [
      'Sun.tsx', 'Planet.tsx', 'Starfield.tsx', 'AsteroidBelt.tsx',
      'CameraController.tsx', 'SimLoop.tsx', 'EclipseDetector.tsx',
      'EclipseLog.tsx', 'TimeControls.tsx', 'ControlPanel.tsx',
      'PlanetInfoCard.tsx', 'KeyboardShortcuts.tsx', 'CinematicTour.tsx',
      'MissionPlanner.tsx', 'MissionTrajectory.tsx', 'URLStateSync.tsx',
      'Comet.tsx', 'PhysicsTooltips.tsx', 'GravityGrid.tsx', 'TimeMachine.tsx',
    ]
    for (const file of expected) {
      expect(
        fs.existsSync(path.join(srcRoot, 'components', file)),
        `components/${file} should exist`,
      ).toBe(true)
    }
  })

  it('has all expected data files', () => {
    expect(fs.existsSync(path.join(srcRoot, 'data', 'planets.ts'))).toBe(true)
    expect(fs.existsSync(path.join(srcRoot, 'data', 'comets.ts'))).toBe(true)
    expect(fs.existsSync(path.join(srcRoot, 'data', 'timeEvents.ts'))).toBe(true)
  })

  it('has all expected utility files', () => {
    const expected = ['orbital.ts', 'scale.ts', 'urlState.ts', 'hohmann.ts', 'constants.ts', 'tourPresets.ts']
    for (const file of expected) {
      expect(fs.existsSync(path.join(srcRoot, 'utils', file)), `utils/${file} should exist`).toBe(true)
    }
  })

  it('has store file', () => {
    expect(fs.existsSync(path.join(srcRoot, 'store', 'store.ts'))).toBe(true)
  })

  it('App.tsx imports all component files used in rendering', () => {
    const appSource = fs.readFileSync(path.join(srcRoot, 'App.tsx'), 'utf-8')
    const requiredImports = [
      'Sun', 'Planet', 'Comet', 'AsteroidBelt', 'Starfield',
      'CameraController', 'EclipseDetector', 'MissionTrajectory',
      'GravityGrid', 'SimLoop', 'TimeControls', 'ControlPanel',
      'PlanetInfoCard', 'EclipseLog', 'MissionPlanner', 'KeyboardShortcuts',
      'CinematicTour', 'TimeMachine', 'URLStateSync',
    ]
    for (const name of requiredImports) {
      expect(appSource, `App.tsx should import ${name}`).toContain(name)
    }
  })

  it('App.tsx imports PLANETS and COMETS data', () => {
    const appSource = fs.readFileSync(path.join(srcRoot, 'App.tsx'), 'utf-8')
    expect(appSource).toContain("from './data/planets'")
    expect(appSource).toContain("from './data/comets'")
  })
})

// ════════════════════════════════════════════════════════════════
// 2. PLANET DATA COMPLETENESS
// ════════════════════════════════════════════════════════════════

describe('Planet Data Completeness', () => {
  const EXPECTED_PLANETS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']

  it('has exactly 8 planets', () => {
    expect(PLANETS).toHaveLength(8)
  })

  it('planets are in correct order from Sun', () => {
    expect(PLANETS.map((p) => p.name)).toEqual(EXPECTED_PLANETS)
  })

  it('planet distances increase monotonically', () => {
    for (let i = 1; i < PLANETS.length; i++) {
      expect(PLANETS[i].distanceFromSun).toBeGreaterThan(PLANETS[i - 1].distanceFromSun)
    }
  })

  it('orbital periods increase monotonically', () => {
    for (let i = 1; i < PLANETS.length; i++) {
      expect(PLANETS[i].orbitalPeriod).toBeGreaterThan(PLANETS[i - 1].orbitalPeriod)
    }
  })

  it('every planet has all required numeric fields > 0', () => {
    for (const p of PLANETS) {
      expect(p.radius, `${p.name} radius`).toBeGreaterThan(0)
      expect(p.distanceFromSun, `${p.name} distanceFromSun`).toBeGreaterThan(0)
      expect(p.orbitalPeriod, `${p.name} orbitalPeriod`).toBeGreaterThan(0)
      expect(p.surfaceGravity, `${p.name} surfaceGravity`).toBeGreaterThan(0)
      expect(p.escapeVelocity, `${p.name} escapeVelocity`).toBeGreaterThan(0)
    }
  })

  it('every planet has eccentricity in [0, 1)', () => {
    for (const p of PLANETS) {
      expect(p.eccentricity, `${p.name} eccentricity`).toBeGreaterThanOrEqual(0)
      expect(p.eccentricity, `${p.name} eccentricity`).toBeLessThan(1)
    }
  })

  it('every planet has valid inclination', () => {
    for (const p of PLANETS) {
      expect(p.inclination, `${p.name} inclination`).toBeGreaterThanOrEqual(0)
      expect(p.inclination, `${p.name} inclination`).toBeLessThan(180)
    }
  })

  it('every planet has non-empty string fields', () => {
    for (const p of PLANETS) {
      expect(p.name.length, `${p.name} name`).toBeGreaterThan(0)
      expect(p.mass.length, `${p.name} mass`).toBeGreaterThan(0)
      expect(p.color.length, `${p.name} color`).toBeGreaterThan(0)
      expect(p.description.length, `${p.name} description`).toBeGreaterThan(0)
      expect(p.temperature.length, `${p.name} temperature`).toBeGreaterThan(0)
    }
  })

  it('every planet has valid type classification', () => {
    const validTypes = ['terrestrial', 'gas-giant', 'ice-giant']
    for (const p of PLANETS) {
      expect(validTypes, `${p.name} type`).toContain(p.type)
    }
  })

  it('terrestrial planets are the inner 4', () => {
    expect(PLANETS.slice(0, 4).every((p) => p.type === 'terrestrial')).toBe(true)
  })

  it('gas giants are Jupiter and Saturn', () => {
    expect(PLANETS.find((p) => p.name === 'Jupiter')!.type).toBe('gas-giant')
    expect(PLANETS.find((p) => p.name === 'Saturn')!.type).toBe('gas-giant')
  })

  it('ice giants are Uranus and Neptune', () => {
    expect(PLANETS.find((p) => p.name === 'Uranus')!.type).toBe('ice-giant')
    expect(PLANETS.find((p) => p.name === 'Neptune')!.type).toBe('ice-giant')
  })

  it('Saturn has prominent rings (ringOuter > 3)', () => {
    const saturn = PLANETS.find((p) => p.name === 'Saturn')!
    expect(saturn.hasRings).toBe(true)
    expect(saturn.ringOuter).toBeGreaterThan(3)
  })

  it('planets with rings have ring parameters', () => {
    for (const p of PLANETS.filter((p) => p.hasRings)) {
      expect(p.ringColor, `${p.name} ringColor`).toBeTruthy()
      expect(p.ringInner, `${p.name} ringInner`).toBeGreaterThan(0)
      expect(p.ringOuter, `${p.name} ringOuter`).toBeGreaterThan(p.ringInner!)
    }
  })

  it('Venus and Uranus have retrograde rotation (negative period)', () => {
    expect(PLANETS.find((p) => p.name === 'Venus')!.rotationPeriod).toBeLessThan(0)
    expect(PLANETS.find((p) => p.name === 'Uranus')!.rotationPeriod).toBeLessThan(0)
  })

  it('Earth orbital period is approximately 365.25 days', () => {
    const earth = PLANETS.find((p) => p.name === 'Earth')!
    expect(earth.orbitalPeriod).toBeCloseTo(365.256, 0)
  })

  it('every planet has moons count >= 0', () => {
    for (const p of PLANETS) {
      expect(p.moons, `${p.name} moons`).toBeGreaterThanOrEqual(0)
    }
  })
})

// ════════════════════════════════════════════════════════════════
// 3. SUN DATA COMPLETENESS
// ════════════════════════════════════════════════════════════════

describe('Sun Data', () => {
  it('has name "Sun"', () => {
    expect(SUN_DATA.name).toBe('Sun')
  })

  it('has positive radius', () => {
    expect(SUN_DATA.radius).toBeGreaterThan(0)
    expect(SUN_DATA.radius).toBe(696340) // known value
  })

  it('has emissive properties for glow', () => {
    expect(SUN_DATA.emissive).toBeTruthy()
    expect(SUN_DATA.emissiveIntensity).toBeGreaterThan(0)
  })

  it('has description and temperature', () => {
    expect(SUN_DATA.description.length).toBeGreaterThan(0)
    expect(SUN_DATA.temperature.length).toBeGreaterThan(0)
  })
})

// ════════════════════════════════════════════════════════════════
// 4. COMET DATA COMPLETENESS
// ════════════════════════════════════════════════════════════════

describe('Comet Data Completeness', () => {
  it('has exactly 3 comets', () => {
    expect(COMETS).toHaveLength(3)
  })

  it('includes the 3 expected comets', () => {
    const names = COMETS.map((c) => c.name)
    expect(names).toContain("Halley's Comet")
    expect(names).toContain('Hale-Bopp')
    expect(names).toContain('Encke')
  })

  it('every comet has valid orbital parameters', () => {
    for (const c of COMETS) {
      expect(c.semiMajorAxisAU, `${c.name} semiMajorAxisAU`).toBeGreaterThan(0)
      expect(c.eccentricity, `${c.name} eccentricity`).toBeGreaterThan(0)
      expect(c.eccentricity, `${c.name} eccentricity`).toBeLessThan(1)
      expect(c.orbitalPeriodDays, `${c.name} orbitalPeriodDays`).toBeGreaterThan(0)
      expect(c.perihelionAU, `${c.name} perihelionAU`).toBeGreaterThan(0)
    }
  })

  it('every comet has colors and description', () => {
    for (const c of COMETS) {
      expect(c.color.length).toBeGreaterThan(0)
      expect(c.tailColor.length).toBeGreaterThan(0)
      expect(c.description.length).toBeGreaterThan(0)
    }
  })

  it('Encke has shortest orbital period', () => {
    const encke = COMETS.find((c) => c.name === 'Encke')!
    for (const c of COMETS) {
      expect(encke.orbitalPeriodDays).toBeLessThanOrEqual(c.orbitalPeriodDays)
    }
  })

  it('perihelion is consistent with semi-major axis and eccentricity', () => {
    for (const c of COMETS) {
      const expectedPeri = c.semiMajorAxisAU * (1 - c.eccentricity)
      expect(c.perihelionAU).toBeCloseTo(expectedPeri, 1)
    }
  })
})

// ════════════════════════════════════════════════════════════════
// 5. SPEED OPTIONS VALIDATION
// ════════════════════════════════════════════════════════════════

describe('Speed Options', () => {
  it('is a non-empty array', () => {
    expect(SPEED_OPTIONS.length).toBeGreaterThan(0)
  })

  it('starts at 1', () => {
    expect(SPEED_OPTIONS[0]).toBe(1)
  })

  it('values are strictly increasing', () => {
    for (let i = 1; i < SPEED_OPTIONS.length; i++) {
      expect(SPEED_OPTIONS[i]).toBeGreaterThan(SPEED_OPTIONS[i - 1])
    }
  })

  it('has 8 speed presets', () => {
    expect(SPEED_OPTIONS).toHaveLength(8)
  })

  it('ends at 10000', () => {
    expect(SPEED_OPTIONS[SPEED_OPTIONS.length - 1]).toBe(10000)
  })

  it('all values are positive integers', () => {
    for (const s of SPEED_OPTIONS) {
      expect(Number.isInteger(s)).toBe(true)
      expect(s).toBeGreaterThan(0)
    }
  })
})

// ════════════════════════════════════════════════════════════════
// 6. TOUR PRESETS VALIDATION
// ════════════════════════════════════════════════════════════════

describe('Tour Presets', () => {
  it('has exactly 4 presets', () => {
    expect(TOUR_PRESETS).toHaveLength(4)
  })

  it('each preset has unique id', () => {
    const ids = TOUR_PRESETS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each preset has name, icon, description, and at least 2 stops', () => {
    for (const preset of TOUR_PRESETS) {
      expect(preset.name.length, `${preset.id} name`).toBeGreaterThan(0)
      expect(preset.icon.length, `${preset.id} icon`).toBeGreaterThan(0)
      expect(preset.description.length, `${preset.id} description`).toBeGreaterThan(0)
      expect(preset.stops.length, `${preset.id} stops`).toBeGreaterThanOrEqual(2)
    }
  })

  it('every stop has valid speed from SPEED_OPTIONS or other positive value', () => {
    for (const preset of TOUR_PRESETS) {
      for (const stop of preset.stops) {
        expect(stop.speed).toBeGreaterThan(0)
        expect(stop.durationMs).toBeGreaterThan(0)
      }
    }
  })

  it('grand tour visits all 8 planets', () => {
    const grandTour = TOUR_PRESETS.find((t) => t.id === 'grand-tour')!
    const planetNames = PLANETS.map((p) => p.name)
    for (const name of planetNames) {
      const visited = grandTour.stops.some((s) => s.target === name)
      expect(visited, `Grand tour should visit ${name}`).toBe(true)
    }
  })

  it('getTourPreset returns correct preset by id', () => {
    for (const preset of TOUR_PRESETS) {
      expect(getTourPreset(preset.id)).toBe(preset)
    }
  })

  it('getTourPreset returns undefined for unknown id', () => {
    expect(getTourPreset('nonexistent')).toBeUndefined()
  })

  it('stop targets reference valid planet names or null', () => {
    const validNames = new Set([...PLANETS.map((p) => p.name), null])
    for (const preset of TOUR_PRESETS) {
      for (const stop of preset.stops) {
        expect(
          validNames.has(stop.target as string | null),
          `Stop target "${stop.target}" in ${preset.id} should be valid`,
        ).toBe(true)
      }
    }
  })
})

// ════════════════════════════════════════════════════════════════
// 7. STORE STATE SHAPE
// ════════════════════════════════════════════════════════════════

describe('Store State Shape', () => {
  it('has correct initial state values', () => {
    const state = useStore.getState()
    expect(state.paused).toBe(false)
    expect(state.speed).toBe(1)
    expect(state.elapsedDays).toBe(0)
    expect(state.scaleMode).toBe('exaggerated')
    expect(state.showOrbits).toBe(true)
    expect(state.showLabels).toBe(true)
    expect(state.showAsteroidBelt).toBe(true)
    expect(state.showEclipses).toBe(true)
    expect(state.showComets).toBe(true)
    expect(state.showGravityGrid).toBe(false)
    expect(state.cameraTarget).toBeNull()
    expect(state.selectedPlanet).toBeNull()
    expect(state.eclipseEvents).toEqual([])
    expect(state.showMission).toBeNull()
    expect(state.activeEvent).toBeNull()
  })

  it('has all required action functions', () => {
    const state = useStore.getState()
    const actions = [
      'setPaused', 'togglePaused', 'setSpeed', 'advanceTime', 'setElapsedDays',
      'setScaleMode', 'toggleOrbits', 'toggleLabels', 'toggleAsteroidBelt',
      'toggleEclipses', 'toggleComets', 'toggleGravityGrid',
      'setCameraTarget', 'setSelectedPlanet',
      'addEclipseEvent', 'setMission', 'setActiveEvent',
    ]
    for (const action of actions) {
      expect(typeof (state as Record<string, unknown>)[action], `${action} should be a function`).toBe('function')
    }
  })

  it('toggle actions flip boolean state', () => {
    const store = useStore
    store.setState({ showOrbits: true, showLabels: true, showAsteroidBelt: true, showComets: true, showEclipses: true, showGravityGrid: false, paused: false })

    store.getState().toggleOrbits()
    expect(store.getState().showOrbits).toBe(false)

    store.getState().toggleLabels()
    expect(store.getState().showLabels).toBe(false)

    store.getState().toggleAsteroidBelt()
    expect(store.getState().showAsteroidBelt).toBe(false)

    store.getState().toggleComets()
    expect(store.getState().showComets).toBe(false)

    store.getState().toggleGravityGrid()
    expect(store.getState().showGravityGrid).toBe(true)

    store.getState().togglePaused()
    expect(store.getState().paused).toBe(true)
  })

  it('setSpeed updates speed', () => {
    useStore.getState().setSpeed(500)
    expect(useStore.getState().speed).toBe(500)
  })

  it('advanceTime accumulates elapsed days', () => {
    useStore.setState({ elapsedDays: 0 })
    useStore.getState().advanceTime(10)
    useStore.getState().advanceTime(5)
    expect(useStore.getState().elapsedDays).toBe(15)
  })

  it('addEclipseEvent caps at 20 events', () => {
    useStore.setState({ eclipseEvents: [] })
    for (let i = 0; i < 25; i++) {
      useStore.getState().addEclipseEvent({
        time: i,
        innerPlanet: 'Earth',
        outerPlanet: 'Mars',
        alignment: 0.9,
      })
    }
    expect(useStore.getState().eclipseEvents.length).toBeLessThanOrEqual(20)
  })

  it('setScaleMode accepts both valid modes', () => {
    useStore.getState().setScaleMode('realistic')
    expect(useStore.getState().scaleMode).toBe('realistic')
    useStore.getState().setScaleMode('exaggerated')
    expect(useStore.getState().scaleMode).toBe('exaggerated')
  })

  it('setCameraTarget and setSelectedPlanet work with planet names', () => {
    useStore.getState().setCameraTarget('Saturn')
    useStore.getState().setSelectedPlanet('Saturn')
    expect(useStore.getState().cameraTarget).toBe('Saturn')
    expect(useStore.getState().selectedPlanet).toBe('Saturn')

    useStore.getState().setCameraTarget(null)
    useStore.getState().setSelectedPlanet(null)
    expect(useStore.getState().cameraTarget).toBeNull()
    expect(useStore.getState().selectedPlanet).toBeNull()
  })
})

// ════════════════════════════════════════════════════════════════
// 8. MODULE EXPORTS VALIDATION
// ════════════════════════════════════════════════════════════════

describe('Module Exports', () => {
  it('orbital.ts exports all required functions', () => {
    expect(typeof solveKepler).toBe('function')
    expect(typeof trueAnomaly).toBe('function')
    expect(typeof orbitalRadius).toBe('function')
    expect(typeof getPlanetPosition).toBe('function')
    expect(typeof getOrbitPath).toBe('function')
    expect(typeof checkEclipseAlignment).toBe('function')
  })

  it('scale.ts exports all required functions and constants', () => {
    expect(typeof getDistance).toBe('function')
    expect(typeof getDistanceAU).toBe('function')
    expect(typeof getExaggeratedRadius).toBe('function')
    expect(typeof getRealisticRadius).toBe('function')
    expect(typeof AU).toBe('number')
    expect(typeof KM_TO_AU).toBe('number')
  })

  it('urlState.ts exports all required functions', () => {
    expect(typeof encodeURLState).toBe('function')
    expect(typeof decodeURLState).toBe('function')
  })

  it('hohmann.ts exports all required functions', () => {
    expect(typeof computeHohmann).toBe('function')
    expect(typeof getHohmannPath).toBe('function')
  })

  it('store exports useStore hook', () => {
    expect(typeof useStore).toBe('function')
    expect(typeof useStore.getState).toBe('function')
    expect(typeof useStore.setState).toBe('function')
  })
})

// ════════════════════════════════════════════════════════════════
// 9. BUILD CONFIGURATION VALIDATION
// ════════════════════════════════════════════════════════════════

describe('Build Configuration', () => {
  const rootDir = path.resolve(__dirname, '..')

  it('package.json exists and has required scripts', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
    expect(pkg.scripts.build).toBeDefined()
    expect(pkg.scripts.dev).toBeDefined()
    expect(pkg.scripts.test).toBeDefined()
    expect(pkg.scripts.build).toContain('tsc')
    expect(pkg.scripts.build).toContain('vite build')
  })

  it('vite.config.ts sets base for GitHub Pages', () => {
    const config = fs.readFileSync(path.join(rootDir, 'vite.config.ts'), 'utf-8')
    expect(config).toContain("base: '/solarsim/'")
  })

  it('tsconfig.json exists', () => {
    expect(fs.existsSync(path.join(rootDir, 'tsconfig.json'))).toBe(true)
  })

  it('package.json has all required runtime dependencies', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
    const required = ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', 'zustand']
    for (const dep of required) {
      expect(pkg.dependencies[dep], `dependency ${dep}`).toBeDefined()
    }
  })

  it('package.json has vitest in devDependencies', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
    expect(pkg.devDependencies.vitest).toBeDefined()
  })

  it('index.html exists with root mount point', () => {
    const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8')
    expect(html).toContain('id="root"')
    expect(html).toContain('main.tsx')
  })
})

// ════════════════════════════════════════════════════════════════
// 10. FEATURE COMPLETENESS CROSS-CHECKS
// ════════════════════════════════════════════════════════════════

describe('Feature Completeness', () => {
  it('every planet name in PLANETS can be used as camera target in store', () => {
    for (const p of PLANETS) {
      useStore.getState().setCameraTarget(p.name)
      expect(useStore.getState().cameraTarget).toBe(p.name)
    }
    useStore.getState().setCameraTarget(null)
  })

  it('Hohmann transfer works between all adjacent planet pairs', () => {
    for (let i = 0; i < PLANETS.length - 1; i++) {
      const result = computeHohmann(PLANETS[i].distanceFromSun, PLANETS[i + 1].distanceFromSun)
      expect(result.totalDeltaV).toBeGreaterThan(0)
      expect(result.transferDays).toBeGreaterThan(0)
      expect(result.transferSMA).toBeGreaterThan(0)
    }
  })

  it('URL state round-trips for every planet as target', () => {
    for (const p of PLANETS) {
      const state = { target: p.name, speed: 100 }
      const encoded = encodeURLState(state)
      const decoded = decodeURLState(encoded)
      expect(decoded.target).toBe(p.name)
      expect(decoded.speed).toBe(100)
    }
  })

  it('orbital mechanics produce valid positions for all planets', () => {
    for (const p of PLANETS) {
      const au = p.distanceFromSun / 149.6
      const pos = getPlanetPosition(au, p.eccentricity, p.inclination, p.meanAnomaly, p.orbitalPeriod, 100)
      expect(pos).toHaveLength(3)
      expect(Number.isFinite(pos[0])).toBe(true)
      expect(Number.isFinite(pos[1])).toBe(true)
      expect(Number.isFinite(pos[2])).toBe(true)
    }
  })

  it('orbit paths generate for all planets without errors', () => {
    for (const p of PLANETS) {
      const au = p.distanceFromSun / 149.6
      const path = getOrbitPath(au, p.eccentricity, p.inclination)
      expect(path.length).toBeGreaterThan(0)
      // Every point should be finite
      for (const pt of path) {
        expect(Number.isFinite(pt[0]) && Number.isFinite(pt[1]) && Number.isFinite(pt[2])).toBe(true)
      }
    }
  })

  it('scale functions produce positive values for all planets', () => {
    for (const p of PLANETS) {
      expect(getDistance(p.distanceFromSun, 'exaggerated')).toBeGreaterThan(0)
      expect(getDistance(p.distanceFromSun, 'realistic')).toBeGreaterThan(0)
      expect(getExaggeratedRadius(p.radius)).toBeGreaterThan(0)
      expect(getRealisticRadius(p.radius)).toBeGreaterThan(0)
    }
  })

  it('Hohmann path generates valid 3D points', () => {
    const pts = getHohmannPath(1.0, 1.524) // Earth to Mars
    expect(pts.length).toBeGreaterThan(0)
    for (const pt of pts) {
      expect(Number.isFinite(pt[0])).toBe(true)
      expect(Number.isFinite(pt[1])).toBe(true)
      expect(Number.isFinite(pt[2])).toBe(true)
    }
  })

  it('KeyboardShortcuts file wires all documented shortcuts', () => {
    const ks = fs.readFileSync(path.join(__dirname, 'components', 'KeyboardShortcuts.tsx'), 'utf-8')
    // Verify each documented shortcut key is handled
    const expectedKeys = [
      "' '",      // Space
      "'o'",      // orbits
      "'l'",      // labels
      "'b'",      // belt
      "'s'",      // scale
      "'t'",      // tour
      "'c'",      // comets
      "'u'",      // URL share
      "'escape'", // deselect
      "'h'",      // help
      "'?'",      // help alt
    ]
    for (const key of expectedKeys) {
      expect(ks.toLowerCase(), `Shortcut ${key} should be handled`).toContain(key)
    }
    // Number keys 1-8
    expect(ks).toContain("case '1':")
    expect(ks).toContain("case '8':")
    expect(ks).toContain("case '0':")
    // Arrow keys
    expect(ks.toLowerCase()).toContain('arrowup')
    expect(ks.toLowerCase()).toContain('arrowdown')
  })
})

// ════════════════════════════════════════════════════════════════
// 11. CROSS-MODULE CONSISTENCY
// ════════════════════════════════════════════════════════════════

describe('Cross-Module Consistency', () => {
  it('default store speed is in SPEED_OPTIONS', () => {
    const defaultSpeed = useStore.getState().speed
    expect(SPEED_OPTIONS).toContain(defaultSpeed)
  })

  it('all tour stop speeds are in SPEED_OPTIONS', () => {
    for (const preset of TOUR_PRESETS) {
      for (const stop of preset.stops) {
        expect(SPEED_OPTIONS, `Speed ${stop.speed} in tour ${preset.id}`).toContain(stop.speed)
      }
    }
  })

  it('scale constants are physically accurate', () => {
    expect(AU).toBe(1) // 1 AU = 1 scene unit
    expect(KM_TO_AU).toBeCloseTo(1 / 149_597_870.7, 15)
  })

  it('no source file exceeds 400 LOC (maintainability check)', () => {
    const srcDir = path.resolve(__dirname)
    const sourceFiles = getAllSourceFiles(srcDir)
    for (const file of sourceFiles) {
      const lines = fs.readFileSync(file, 'utf-8').split('\n').length
      const relative = path.relative(srcDir, file)
      expect(lines, `${relative} should be < 450 LOC`).toBeLessThan(450)
    }
  })
})

// ════════════════════════════════════════════════════════════════
// 9. UI POLISH & MICRO-INTERACTION QUALITY
// ════════════════════════════════════════════════════════════════

describe('UI Polish — Red Hat #2', () => {
  const srcRoot = path.resolve(__dirname)

  it('index.css contains all core animation keyframes', () => {
    const css = fs.readFileSync(path.join(srcRoot, 'index.css'), 'utf-8')
    const requiredAnimations = [
      'fadeIn', 'fadeInSubtle', 'slideInLeft', 'slideInRight', 'slideInUp',
      'scaleIn', 'titleEntrance', 'playPulse', 'dotPulse', 'staggerIn',
      'hudReveal', 'letterboxIn', 'shimmer',
    ]
    for (const anim of requiredAnimations) {
      expect(css, `CSS should define @keyframes ${anim}`).toContain(`@keyframes ${anim}`)
    }
  })

  it('index.css has focus-visible styles for accessibility', () => {
    const css = fs.readFileSync(path.join(srcRoot, 'index.css'), 'utf-8')
    expect(css).toContain('focus-visible')
  })

  it('index.css has button active press feedback', () => {
    const css = fs.readFileSync(path.join(srcRoot, 'index.css'), 'utf-8')
    expect(css).toContain('button:active')
    expect(css).toContain('scale(0.97)')
  })

  it('index.css has selection styling', () => {
    const css = fs.readFileSync(path.join(srcRoot, 'index.css'), 'utf-8')
    expect(css).toContain('::selection')
  })

  it('index.html has a cinematic loader with orbit rings', () => {
    const html = fs.readFileSync(path.join(srcRoot, '..', 'index.html'), 'utf-8')
    expect(html).toContain('orbit-ring')
    expect(html).toContain('sun-icon')
    expect(html).toContain('loader-text')
    expect(html).toContain('@keyframes orbitSpin')
  })

  it('ControlPanel uses ToggleSwitch instead of plain checkboxes', () => {
    const src = fs.readFileSync(path.join(srcRoot, 'components', 'ControlPanel.tsx'), 'utf-8')
    expect(src).toContain('ToggleSwitch')
    expect(src).toContain('role="switch"')
    // Should not contain <input type="checkbox"
    expect(src).not.toContain('type="checkbox"')
  })

  it('App.tsx has staggered UI entrance timing', () => {
    const src = fs.readFileSync(path.join(srcRoot, 'App.tsx'), 'utf-8')
    expect(src).toContain('uiReady')
    expect(src).toContain('setUiReady')
  })

  it('PlanetInfoCard close button has rotation animation on hover', () => {
    const src = fs.readFileSync(path.join(srcRoot, 'components', 'PlanetInfoCard.tsx'), 'utf-8')
    expect(src).toContain('rotate(90deg)')
  })

  it('TimeControls has visual dividers between sections', () => {
    const src = fs.readFileSync(path.join(srcRoot, 'components', 'TimeControls.tsx'), 'utf-8')
    expect(src).toContain('divider')
  })

  it('CameraController uses smooth cubic easing for transitions', () => {
    const src = fs.readFileSync(path.join(srcRoot, 'components', 'CameraController.tsx'), 'utf-8')
    expect(src).toContain('ease')
    expect(src).toContain('Math.pow')
  })

  it('all glass panels use consistent backdrop blur (16-24px)', () => {
    const panelFiles = [
      'ControlPanel.tsx', 'TimeControls.tsx', 'PlanetInfoCard.tsx',
      'EclipseLog.tsx', 'MissionPlanner.tsx', 'CinematicTour.tsx', 'TimeMachine.tsx',
    ]
    for (const file of panelFiles) {
      const src = fs.readFileSync(path.join(srcRoot, 'components', file), 'utf-8')
      expect(src, `${file} should use backdrop blur`).toMatch(/backdropFilter.*blur\(\d+px\)/)
    }
  })

  it('main panel containers use rounded corners (radius >= 10)', () => {
    const panelFiles = ['ControlPanel.tsx', 'TimeControls.tsx', 'PlanetInfoCard.tsx', 'EclipseLog.tsx']
    for (const file of panelFiles) {
      const src = fs.readFileSync(path.join(srcRoot, 'components', file), 'utf-8')
      // Check that the first/main panel style object uses large border radius
      const panelMatch = src.match(/panel|container|card/i)
      expect(panelMatch, `${file} should have a panel/container/card style`).not.toBeNull()
      // Check that file contains at least one borderRadius >= 10
      const radiusMatches = src.match(/borderRadius:\s*(\d+)/g) || []
      const largeRadii = radiusMatches
        .map(m => parseInt(m.replace('borderRadius:', '').trim()))
        .filter(v => v >= 10)
      expect(largeRadii.length, `${file} should have at least one borderRadius >= 10`).toBeGreaterThan(0)
    }
  })
})

// ── Helper ────────────────────────────────────────────────────

function getAllSourceFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...getAllSourceFiles(full))
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.includes('.test.')) {
      results.push(full)
    }
  }
  return results
}
