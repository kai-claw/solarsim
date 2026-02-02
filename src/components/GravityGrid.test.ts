import { describe, it, expect } from 'vitest'

/**
 * GravityGrid tests — validate the gravity well math and grid behavior.
 * Since the component uses Three.js shaders (not easily unit-testable),
 * we test the underlying gravity well displacement logic.
 */

/** Replicate the gravity well calculation from GravityGrid.tsx */
function calculateDisplacement(
  vx: number,
  vz: number,
  sunWellDepth: number,
  sunWellRadius: number,
  planetPositions: Array<{ x: number; z: number; strength: number }>,
  planetWellBase: number,
): number {
  const sunDist = Math.sqrt(vx * vx + vz * vz)
  let disp = -sunWellDepth / (1 + sunDist / sunWellRadius)

  for (const planet of planetPositions) {
    const dx = vx - planet.x
    const dz = vz - planet.z
    const pDist = Math.sqrt(dx * dx + dz * dz)
    disp -= (planetWellBase * planet.strength) / (1 + pDist * 3)
  }

  return disp
}

const SUN_WELL_DEPTH = 4.0
const SUN_WELL_RADIUS = 8.0
const PLANET_WELL_BASE = 0.6

describe('GravityGrid displacement math', () => {
  it('displacement is most negative at origin (Sun)', () => {
    const atSun = calculateDisplacement(0, 0, SUN_WELL_DEPTH, SUN_WELL_RADIUS, [], PLANET_WELL_BASE)
    const farAway = calculateDisplacement(30, 30, SUN_WELL_DEPTH, SUN_WELL_RADIUS, [], PLANET_WELL_BASE)
    expect(atSun).toBeLessThan(farAway)
    expect(atSun).toBe(-SUN_WELL_DEPTH)
  })

  it('displacement approaches 0 far from all masses', () => {
    const farAway = calculateDisplacement(100, 100, SUN_WELL_DEPTH, SUN_WELL_RADIUS, [], PLANET_WELL_BASE)
    expect(farAway).toBeGreaterThan(-0.5)
  })

  it('planet creates a local well at its position', () => {
    const planets = [{ x: 10, z: 0, strength: 2.0 }]
    const atPlanet = calculateDisplacement(10, 0, SUN_WELL_DEPTH, SUN_WELL_RADIUS, planets, PLANET_WELL_BASE)
    const nearPlanet = calculateDisplacement(12, 0, SUN_WELL_DEPTH, SUN_WELL_RADIUS, planets, PLANET_WELL_BASE)
    // At the planet should be deeper than slightly away
    expect(atPlanet).toBeLessThan(nearPlanet)
  })

  it('Jupiter creates a deeper well than Mercury', () => {
    const jupiterWell = calculateDisplacement(
      15, 0, SUN_WELL_DEPTH, SUN_WELL_RADIUS,
      [{ x: 15, z: 0, strength: 2.5 }], PLANET_WELL_BASE,
    )
    const mercuryWell = calculateDisplacement(
      15, 0, SUN_WELL_DEPTH, SUN_WELL_RADIUS,
      [{ x: 15, z: 0, strength: 0.15 }], PLANET_WELL_BASE,
    )
    expect(jupiterWell).toBeLessThan(mercuryWell)
  })

  it('displacement is always negative (wells go down)', () => {
    const planets = [
      { x: 5, z: 0, strength: 1.0 },
      { x: -10, z: 5, strength: 2.0 },
    ]
    for (let x = -30; x <= 30; x += 10) {
      for (let z = -30; z <= 30; z += 10) {
        const d = calculateDisplacement(x, z, SUN_WELL_DEPTH, SUN_WELL_RADIUS, planets, PLANET_WELL_BASE)
        expect(d).toBeLessThanOrEqual(0)
      }
    }
  })

  it('multiple planets add their wells together', () => {
    const single = calculateDisplacement(
      10, 0, SUN_WELL_DEPTH, SUN_WELL_RADIUS,
      [{ x: 10, z: 0, strength: 1.0 }], PLANET_WELL_BASE,
    )
    const double = calculateDisplacement(
      10, 0, SUN_WELL_DEPTH, SUN_WELL_RADIUS,
      [{ x: 10, z: 0, strength: 1.0 }, { x: 10, z: 0, strength: 1.0 }], PLANET_WELL_BASE,
    )
    // Two planets at same spot should be deeper
    expect(double).toBeLessThan(single)
  })

  it('well is symmetric around origin with no planets', () => {
    const d1 = calculateDisplacement(5, 0, SUN_WELL_DEPTH, SUN_WELL_RADIUS, [], PLANET_WELL_BASE)
    const d2 = calculateDisplacement(-5, 0, SUN_WELL_DEPTH, SUN_WELL_RADIUS, [], PLANET_WELL_BASE)
    const d3 = calculateDisplacement(0, 5, SUN_WELL_DEPTH, SUN_WELL_RADIUS, [], PLANET_WELL_BASE)
    expect(d1).toBeCloseTo(d2)
    expect(d1).toBeCloseTo(d3)
  })
})
