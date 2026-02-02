import { describe, it, expect } from 'vitest'
import {
  solveKepler,
  trueAnomaly,
  orbitalRadius,
  getPlanetPosition,
  getOrbitPath,
  checkEclipseAlignment,
} from './orbital'

const TWO_PI = 2 * Math.PI

// ─── solveKepler ──────────────────────────────────────────────

describe('solveKepler', () => {
  it('returns M for circular orbit (e = 0)', () => {
    const M = 1.5
    const E = solveKepler(M, 0)
    expect(E).toBeCloseTo(M, 8)
  })

  it('returns 0 for M = 0 (any eccentricity)', () => {
    expect(solveKepler(0, 0.0)).toBeCloseTo(0, 8)
    expect(solveKepler(0, 0.5)).toBeCloseTo(0, 8)
    expect(solveKepler(0, 0.9)).toBeCloseTo(0, 6)
  })

  it('returns π for M = π (any eccentricity)', () => {
    expect(solveKepler(Math.PI, 0.0)).toBeCloseTo(Math.PI, 8)
    expect(solveKepler(Math.PI, 0.5)).toBeCloseTo(Math.PI, 8)
    expect(solveKepler(Math.PI, 0.9)).toBeCloseTo(Math.PI, 6)
  })

  it('satisfies Kepler equation E - e*sin(E) = M for low eccentricity', () => {
    const e = 0.0167 // Earth
    const M = 1.2
    const E = solveKepler(M, e)
    const residual = E - e * Math.sin(E)
    // M is normalized to [0, 2π), so compare normalized
    expect(residual).toBeCloseTo(M, 8)
  })

  it('satisfies Kepler equation for moderate eccentricity (Mercury e=0.2056)', () => {
    const e = 0.2056
    const M = 2.5
    const E = solveKepler(M, e)
    const residual = E - e * Math.sin(E)
    expect(residual).toBeCloseTo(M, 7)
  })

  it('satisfies Kepler equation for high eccentricity (e=0.9)', () => {
    const e = 0.9
    for (const M of [0.1, 0.5, 1.0, 2.0, 3.0, 5.0]) {
      const E = solveKepler(M, e)
      const residual = E - e * Math.sin(E)
      const Mn = ((M % TWO_PI) + TWO_PI) % TWO_PI
      expect(residual).toBeCloseTo(Mn, 5)
    }
  })

  it('handles negative mean anomaly', () => {
    const E = solveKepler(-1.0, 0.1)
    expect(Number.isFinite(E)).toBe(true)
    const residual = E - 0.1 * Math.sin(E)
    const Mn = ((-1.0 % TWO_PI) + TWO_PI) % TWO_PI
    expect(residual).toBeCloseTo(Mn, 7)
  })

  it('handles M > 2π (wraps correctly)', () => {
    const E = solveKepler(10.0, 0.3)
    expect(Number.isFinite(E)).toBe(true)
    const residual = E - 0.3 * Math.sin(E)
    const Mn = ((10.0 % TWO_PI) + TWO_PI) % TWO_PI
    expect(residual).toBeCloseTo(Mn, 7)
  })

  it('clamps eccentricity >= 1 to 0.9999', () => {
    const E = solveKepler(1.0, 1.0)
    expect(Number.isFinite(E)).toBe(true)
  })

  it('clamps negative eccentricity to 0', () => {
    const E = solveKepler(1.0, -0.5)
    expect(E).toBeCloseTo(1.0, 6) // effectively e=0
  })

  it('converges for all planet eccentricities', () => {
    const eccentricities = [0.0167, 0.0068, 0.0934, 0.0489, 0.0565, 0.0457, 0.0113, 0.2056]
    for (const e of eccentricities) {
      for (const M of [0.5, 1.5, 3.0, 5.5]) {
        const E = solveKepler(M, e)
        expect(Number.isFinite(E)).toBe(true)
        expect(E).toBeGreaterThanOrEqual(0)
        expect(E).toBeLessThanOrEqual(TWO_PI + 0.01)
      }
    }
  })
})

// ─── trueAnomaly ──────────────────────────────────────────────

describe('trueAnomaly', () => {
  it('returns 0 when E = 0', () => {
    expect(trueAnomaly(0, 0.0)).toBeCloseTo(0, 8)
    expect(trueAnomaly(0, 0.5)).toBeCloseTo(0, 8)
  })

  it('returns π when E = π', () => {
    expect(trueAnomaly(Math.PI, 0.0)).toBeCloseTo(Math.PI, 6)
    expect(trueAnomaly(Math.PI, 0.5)).toBeCloseTo(Math.PI, 6)
  })

  it('equals E for circular orbit (e = 0)', () => {
    for (const E of [0.5, 1.0, 2.0, 4.0]) {
      expect(trueAnomaly(E, 0)).toBeCloseTo(E, 8)
    }
  })

  it('true anomaly > E for e > 0 in first half', () => {
    // For elliptical orbits, the planet moves faster near perihelion
    const v = trueAnomaly(1.0, 0.5)
    expect(v).toBeGreaterThan(1.0)
  })

  it('result is always finite', () => {
    expect(Number.isFinite(trueAnomaly(0.001, 0.99))).toBe(true)
    expect(Number.isFinite(trueAnomaly(3.14, 0.99))).toBe(true)
  })
})

// ─── orbitalRadius ────────────────────────────────────────────

describe('orbitalRadius', () => {
  it('returns a for circular orbit at any angle', () => {
    expect(orbitalRadius(5.0, 0, 0)).toBeCloseTo(5.0, 8)
    expect(orbitalRadius(5.0, 0, Math.PI / 2)).toBeCloseTo(5.0, 8)
    expect(orbitalRadius(5.0, 0, Math.PI)).toBeCloseTo(5.0, 8)
  })

  it('returns a(1-e) at perihelion (v=0)', () => {
    const a = 1.0, e = 0.5
    expect(orbitalRadius(a, e, 0)).toBeCloseTo(a * (1 - e), 8)
  })

  it('returns a(1+e) at aphelion (v=π)', () => {
    const a = 1.0, e = 0.5
    expect(orbitalRadius(a, e, Math.PI)).toBeCloseTo(a * (1 + e), 8)
  })

  it('scales linearly with a', () => {
    const r1 = orbitalRadius(1, 0.3, 1.0)
    const r2 = orbitalRadius(2, 0.3, 1.0)
    expect(r2 / r1).toBeCloseTo(2.0, 8)
  })

  it('handles high eccentricity', () => {
    const r = orbitalRadius(1.0, 0.99, 0)
    expect(r).toBeCloseTo(0.01, 4)
  })

  it('clamps negative eccentricity', () => {
    const r = orbitalRadius(5.0, -0.5, 0)
    expect(r).toBeCloseTo(5.0, 6) // e clamped to 0
  })
})

// ─── getPlanetPosition ───────────────────────────────────────

describe('getPlanetPosition', () => {
  it('returns position on x-axis at t=0 for zero mean anomaly', () => {
    const [x, y, z] = getPlanetPosition(5.0, 0, 0, 0, 365, 0)
    // At M=0, E=0, v=0 → position is (a(1-e), 0, 0) = (5, 0, 0)
    expect(x).toBeCloseTo(5.0, 5)
    expect(y).toBeCloseTo(0, 5)
    expect(z).toBeCloseTo(0, 5)
  })

  it('returns correct distance from origin (circular orbit)', () => {
    const a = 3.0
    const [x, y, z] = getPlanetPosition(a, 0, 0, 45, 365, 100)
    const dist = Math.sqrt(x ** 2 + y ** 2 + z ** 2)
    expect(dist).toBeCloseTo(a, 5) // circular → constant distance
  })

  it('orbits in a plane when inclination = 0', () => {
    const a = 1.0
    for (let t = 0; t < 365; t += 30) {
      const [, , z] = getPlanetPosition(a, 0.1, 0, 0, 365, t)
      expect(z).toBeCloseTo(0, 8)
    }
  })

  it('has non-zero z for inclined orbit', () => {
    const [, , z] = getPlanetPosition(1.0, 0.1, 30, 0, 365, 91)
    expect(Math.abs(z)).toBeGreaterThan(0.01)
  })

  it('returns to approximately same position after one period', () => {
    const args: [number, number, number, number, number] = [5.0, 0.1, 5, 45, 365]
    const p0 = getPlanetPosition(...args, 0)
    const p1 = getPlanetPosition(...args, 365)
    expect(p1[0]).toBeCloseTo(p0[0], 3)
    expect(p1[1]).toBeCloseTo(p0[1], 3)
    expect(p1[2]).toBeCloseTo(p0[2], 3)
  })

  it('handles zero orbital period gracefully', () => {
    const [x, y, z] = getPlanetPosition(5.0, 0, 0, 0, 0, 100)
    expect(x).toBe(5.0)
    expect(y).toBe(0)
    expect(z).toBe(0)
  })

  it('distance at perihelion is a(1-e)', () => {
    // At M=0, E=0, v=0 → perihelion
    const a = 1.0, e = 0.2056 // Mercury
    const pos = getPlanetPosition(a, e, 0, 0, 88, 0)
    const dist = Math.sqrt(pos[0] ** 2 + pos[1] ** 2 + pos[2] ** 2)
    expect(dist).toBeCloseTo(a * (1 - e), 5)
  })
})

// ─── getOrbitPath ─────────────────────────────────────────────

describe('getOrbitPath', () => {
  it('returns segments + 1 points by default (129)', () => {
    const path = getOrbitPath(1.0, 0.0, 0)
    expect(path).toHaveLength(129)
  })

  it('respects custom segment count', () => {
    const path = getOrbitPath(1.0, 0.0, 0, 64)
    expect(path).toHaveLength(65)
  })

  it('first and last points coincide (closed path)', () => {
    const path = getOrbitPath(1.0, 0.1, 5)
    const first = path[0]
    const last = path[path.length - 1]
    expect(first[0]).toBeCloseTo(last[0], 5)
    expect(first[1]).toBeCloseTo(last[1], 5)
    expect(first[2]).toBeCloseTo(last[2], 5)
  })

  it('circular orbit: all points equidistant from origin', () => {
    const a = 3.0
    const path = getOrbitPath(a, 0, 0, 32)
    for (const [x, y, z] of path) {
      const dist = Math.sqrt(x ** 2 + y ** 2 + z ** 2)
      expect(dist).toBeCloseTo(a, 5)
    }
  })

  it('z = 0 for zero inclination', () => {
    const path = getOrbitPath(1.0, 0.2, 0, 32)
    for (const [, , z] of path) {
      expect(z).toBeCloseTo(0, 10)
    }
  })

  it('has non-zero z for inclined orbit', () => {
    const path = getOrbitPath(1.0, 0.0, 30, 32)
    const maxZ = Math.max(...path.map(([, , z]) => Math.abs(z)))
    expect(maxZ).toBeGreaterThan(0.1)
  })
})

// ─── checkEclipseAlignment ────────────────────────────────────

describe('checkEclipseAlignment', () => {
  it('returns 1 for perfectly aligned positions', () => {
    const inner: [number, number, number] = [1, 0, 0]
    const outer: [number, number, number] = [5, 0, 0]
    expect(checkEclipseAlignment(inner, outer)).toBeCloseTo(1, 5)
  })

  it('returns 0 when inner is farther than outer', () => {
    const inner: [number, number, number] = [5, 0, 0]
    const outer: [number, number, number] = [1, 0, 0]
    expect(checkEclipseAlignment(inner, outer)).toBe(0)
  })

  it('returns 0 for perpendicular positions', () => {
    const inner: [number, number, number] = [1, 0, 0]
    const outer: [number, number, number] = [0, 5, 0]
    expect(checkEclipseAlignment(inner, outer)).toBe(0)
  })

  it('returns 0 for opposite positions', () => {
    const inner: [number, number, number] = [1, 0, 0]
    const outer: [number, number, number] = [-5, 0, 0]
    expect(checkEclipseAlignment(inner, outer)).toBe(0)
  })

  it('returns partial alignment for near-aligned positions', () => {
    const inner: [number, number, number] = [1, 0.01, 0]
    const outer: [number, number, number] = [5, 0, 0]
    const score = checkEclipseAlignment(inner, outer)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })

  it('respects custom threshold', () => {
    const inner: [number, number, number] = [1, 0.03, 0]
    const outer: [number, number, number] = [5, 0, 0]
    const narrow = checkEclipseAlignment(inner, outer, 0.01)
    const wide = checkEclipseAlignment(inner, outer, 0.1)
    expect(wide).toBeGreaterThanOrEqual(narrow)
  })

  it('handles degenerate (zero distance) positions', () => {
    const inner: [number, number, number] = [0, 0, 0]
    const outer: [number, number, number] = [5, 0, 0]
    expect(checkEclipseAlignment(inner, outer)).toBe(0)
  })

  it('works with 3D positions (z != 0)', () => {
    const inner: [number, number, number] = [1, 0, 0.001]
    const outer: [number, number, number] = [5, 0, 0.005]
    const score = checkEclipseAlignment(inner, outer)
    expect(score).toBeGreaterThan(0.5)
  })
})
