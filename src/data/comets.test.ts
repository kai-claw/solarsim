import { describe, it, expect } from 'vitest'
import { COMETS, type CometData } from './comets'

describe('COMETS data', () => {
  it('contains at least 3 famous comets', () => {
    expect(COMETS.length).toBeGreaterThanOrEqual(3)
  })

  it('includes Halley\'s Comet', () => {
    const halley = COMETS.find((c) => c.name.includes('Halley'))
    expect(halley).toBeDefined()
  })

  it('includes Hale-Bopp', () => {
    const haleBopp = COMETS.find((c) => c.name.includes('Hale-Bopp'))
    expect(haleBopp).toBeDefined()
  })

  it('includes Encke', () => {
    const encke = COMETS.find((c) => c.name.includes('Encke'))
    expect(encke).toBeDefined()
  })

  it('all comets have highly elliptical orbits (e > 0.8)', () => {
    COMETS.forEach((comet) => {
      expect(comet.eccentricity).toBeGreaterThan(0.8)
      expect(comet.eccentricity).toBeLessThan(1.0)
    })
  })

  it('all comets have valid orbital parameters', () => {
    COMETS.forEach((comet: CometData) => {
      expect(comet.semiMajorAxisAU).toBeGreaterThan(0)
      expect(comet.orbitalPeriodDays).toBeGreaterThan(0)
      expect(comet.inclination).toBeGreaterThanOrEqual(0)
      expect(comet.inclination).toBeLessThanOrEqual(180)
      expect(comet.perihelionAU).toBeGreaterThan(0)
      expect(comet.perihelionAU).toBeLessThan(comet.semiMajorAxisAU)
    })
  })

  it('perihelion is consistent with semi-major axis and eccentricity', () => {
    COMETS.forEach((comet) => {
      const expectedPerihelion = comet.semiMajorAxisAU * (1 - comet.eccentricity)
      expect(comet.perihelionAU).toBeCloseTo(expectedPerihelion, 0) // within 0.5 AU
    })
  })

  it('all comets have required string fields', () => {
    COMETS.forEach((comet) => {
      expect(comet.name.length).toBeGreaterThan(0)
      expect(comet.color.length).toBeGreaterThan(0)
      expect(comet.tailColor.length).toBeGreaterThan(0)
      expect(comet.description.length).toBeGreaterThan(10)
      expect(comet.lastPerihelion.length).toBeGreaterThan(0)
    })
  })

  it('Halley has ~75 year period', () => {
    const halley = COMETS.find((c) => c.name.includes('Halley'))!
    const periodYears = halley.orbitalPeriodDays / 365.256
    expect(periodYears).toBeGreaterThan(70)
    expect(periodYears).toBeLessThan(80)
  })

  it('Encke has the shortest period', () => {
    const encke = COMETS.find((c) => c.name.includes('Encke'))!
    const otherComets = COMETS.filter((c) => !c.name.includes('Encke'))
    otherComets.forEach((comet) => {
      expect(encke.orbitalPeriodDays).toBeLessThan(comet.orbitalPeriodDays)
    })
  })
})
