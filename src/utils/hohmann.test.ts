import { describe, it, expect } from 'vitest'
import { computeHohmann, getHohmannPath } from './hohmann'

describe('computeHohmann', () => {
  it('computes Earth-to-Mars transfer correctly', () => {
    const result = computeHohmann(149.6, 227.9)

    // Transfer time should be ~259 days (known value for Earth-Mars Hohmann)
    expect(result.transferDays).toBeGreaterThan(240)
    expect(result.transferDays).toBeLessThan(280)

    // Total delta-v should be ~5.6 km/s
    expect(result.totalDeltaV).toBeGreaterThan(4)
    expect(result.totalDeltaV).toBeLessThan(8)

    // Departure delta-v should be ~2.9 km/s
    expect(result.deltaV1).toBeGreaterThan(2)
    expect(result.deltaV1).toBeLessThan(4)

    // Transfer SMA should be between Earth and Mars orbits
    expect(result.transferSMA).toBeGreaterThan(0.9)
    expect(result.transferSMA).toBeLessThan(1.6)

    // Eccentricity should be moderate
    expect(result.transferEccentricity).toBeGreaterThan(0)
    expect(result.transferEccentricity).toBeLessThan(1)
  })

  it('computes Earth-to-Jupiter transfer', () => {
    const result = computeHohmann(149.6, 778.5)

    // Transfer time ~2.7 years
    expect(result.transferDays).toBeGreaterThan(900)
    expect(result.transferDays).toBeLessThan(1100)

    // Much higher delta-v than Mars
    expect(result.totalDeltaV).toBeGreaterThan(10)
  })

  it('handles inner planet transfers (Earth to Venus)', () => {
    const result = computeHohmann(149.6, 108.2)

    expect(result.transferDays).toBeGreaterThan(100)
    expect(result.transferDays).toBeLessThan(200)
    expect(result.totalDeltaV).toBeGreaterThan(2)
    expect(result.r1AU).toBeLessThan(result.r2AU)
  })

  it('handles same orbit gracefully', () => {
    const result = computeHohmann(149.6, 149.6)
    expect(result.totalDeltaV).toBeCloseTo(0, 1)
    expect(result.transferEccentricity).toBeCloseTo(0, 3)
  })

  it('produces valid phase angles', () => {
    const result = computeHohmann(149.6, 227.9)
    expect(result.phaseAngle).toBeGreaterThan(-180)
    expect(result.phaseAngle).toBeLessThan(180)
  })

  it('Mercury to Neptune (extreme range)', () => {
    const result = computeHohmann(57.9, 4495.0)

    // Very long transfer
    expect(result.transferDays).toBeGreaterThan(10000)
    // High eccentricity
    expect(result.transferEccentricity).toBeGreaterThan(0.9)
    // Large delta-v
    expect(result.totalDeltaV).toBeGreaterThan(15)
  })
})

describe('getHohmannPath', () => {
  it('returns correct number of points', () => {
    const path = getHohmannPath(1.0, 1.524, 32)
    expect(path).toHaveLength(33) // segments + 1
  })

  it('starts near inner orbit radius', () => {
    const path = getHohmannPath(1.0, 1.524, 64)
    const startR = Math.sqrt(path[0][0] ** 2 + path[0][2] ** 2)
    expect(startR).toBeCloseTo(1.0, 1)
  })

  it('ends near outer orbit radius', () => {
    const path = getHohmannPath(1.0, 1.524, 64)
    const last = path[path.length - 1]
    const endR = Math.sqrt(last[0] ** 2 + last[2] ** 2)
    expect(endR).toBeCloseTo(1.524, 1)
  })

  it('all points are in xz plane (y=0)', () => {
    const path = getHohmannPath(1.0, 5.2, 32)
    path.forEach(([, y]) => {
      expect(y).toBe(0)
    })
  })

  it('handles reversed order (outer to inner)', () => {
    const path = getHohmannPath(1.524, 1.0, 32)
    expect(path).toHaveLength(33)
    const startR = Math.sqrt(path[0][0] ** 2 + path[0][2] ** 2)
    expect(startR).toBeCloseTo(1.0, 1) // always starts at inner
  })
})
