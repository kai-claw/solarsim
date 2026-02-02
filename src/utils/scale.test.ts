import { describe, it, expect } from 'vitest'
import {
  getDistance,
  getDistanceAU,
  getExaggeratedRadius,
  getRealisticRadius,
  KM_TO_AU,
} from './scale'

describe('getDistance', () => {
  it('returns AU in realistic mode (Earth = ~1 AU)', () => {
    const d = getDistance(149.6, 'realistic')
    expect(d).toBeCloseTo(1.0, 4)
  })

  it('returns compressed distance in exaggerated mode', () => {
    const d = getDistance(149.6, 'exaggerated')
    expect(d).toBeGreaterThan(2) // offset minimum
    expect(d).toBeLessThan(20)
  })

  it('closer planets have smaller exaggerated distance', () => {
    const mercury = getDistance(57.9, 'exaggerated')
    const neptune = getDistance(4495.0, 'exaggerated')
    expect(mercury).toBeLessThan(neptune)
  })

  it('realistic distances scale linearly', () => {
    const d1 = getDistance(149.6, 'realistic')
    const d2 = getDistance(299.2, 'realistic')
    expect(d2 / d1).toBeCloseTo(2.0, 4)
  })

  it('returns 0 for distance 0 in realistic mode', () => {
    expect(getDistance(0, 'realistic')).toBe(0)
  })
})

describe('getDistanceAU', () => {
  it('returns AU directly in realistic mode', () => {
    expect(getDistanceAU(1.0, 'realistic')).toBe(1.0)
    expect(getDistanceAU(5.2, 'realistic')).toBe(5.2)
  })

  it('returns compressed distance in exaggerated mode', () => {
    const d = getDistanceAU(1.0, 'exaggerated')
    expect(d).toBeGreaterThan(2)
  })

  it('matches getDistance for equivalent AU input', () => {
    const fromMkm = getDistance(149.6, 'exaggerated')
    const fromAU = getDistanceAU(1.0, 'exaggerated')
    expect(fromMkm).toBeCloseTo(fromAU, 3)
  })
})

describe('getExaggeratedRadius', () => {
  it('returns minimum radius for tiny planet', () => {
    const r = getExaggeratedRadius(1)
    expect(r).toBeGreaterThan(0.06)
  })

  it('larger planets have larger exaggerated radius', () => {
    const earth = getExaggeratedRadius(6371)
    const jupiter = getExaggeratedRadius(69911)
    expect(jupiter).toBeGreaterThan(earth)
  })

  it('Earth gets a reasonable visible size', () => {
    const r = getExaggeratedRadius(6371)
    expect(r).toBeGreaterThan(0.1)
    expect(r).toBeLessThan(0.3)
  })
})

describe('getRealisticRadius', () => {
  it('Earth radius in AU * 100 is very small', () => {
    const r = getRealisticRadius(6371)
    expect(r).toBeCloseTo(6371 * KM_TO_AU * 100, 8)
    expect(r).toBeLessThan(0.01) // still tiny
  })

  it('scales linearly with input', () => {
    const r1 = getRealisticRadius(6371)
    const r2 = getRealisticRadius(12742)
    expect(r2 / r1).toBeCloseTo(2.0, 6)
  })
})
