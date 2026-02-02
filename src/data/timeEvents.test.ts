import { describe, it, expect } from 'vitest'
import { TIME_EVENTS, dateToJ2000Days, getCategoryColor } from './timeEvents'

describe('timeEvents data', () => {
  it('has at least 8 events', () => {
    expect(TIME_EVENTS.length).toBeGreaterThanOrEqual(8)
  })

  it('all events have required fields', () => {
    for (const event of TIME_EVENTS) {
      expect(event.id).toBeTruthy()
      expect(event.name).toBeTruthy()
      expect(event.date).toBeTruthy()
      expect(typeof event.elapsedDays).toBe('number')
      expect(Number.isFinite(event.elapsedDays)).toBe(true)
      expect(event.description.length).toBeGreaterThan(20)
      expect(event.category).toBeTruthy()
      expect(event.emoji).toBeTruthy()
    }
  })

  it('all event IDs are unique', () => {
    const ids = TIME_EVENTS.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('events have chronologically valid dates', () => {
    // Halley 1986 should be negative (before J2000)
    const halley = TIME_EVENTS.find((e) => e.id === 'halley-1986')
    expect(halley).toBeDefined()
    expect(halley!.elapsedDays).toBeLessThan(0)

    // 2024 eclipse should be positive
    const eclipse = TIME_EVENTS.find((e) => e.id === 'total-eclipse-2024')
    expect(eclipse).toBeDefined()
    expect(eclipse!.elapsedDays).toBeGreaterThan(0)

    // 2061 Halley should be further in the future
    const halley2061 = TIME_EVENTS.find((e) => e.id === 'halley-2061')
    expect(halley2061).toBeDefined()
    expect(halley2061!.elapsedDays).toBeGreaterThan(eclipse!.elapsedDays)
  })

  it('focusPlanet references valid planet names when present', () => {
    const validPlanets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']
    for (const event of TIME_EVENTS) {
      if (event.focusPlanet) {
        expect(validPlanets).toContain(event.focusPlanet)
      }
    }
  })

  it('includes events from different categories', () => {
    const categories = new Set(TIME_EVENTS.map((e) => e.category))
    expect(categories.size).toBeGreaterThanOrEqual(4)
  })
})

describe('dateToJ2000Days', () => {
  it('returns 0 for J2000 epoch (Jan 1, 2000)', () => {
    const days = dateToJ2000Days(2000, 1, 1)
    expect(days).toBe(0)
  })

  it('returns ~365 for Jan 1, 2001', () => {
    const days = dateToJ2000Days(2001, 1, 1)
    expect(days).toBeCloseTo(366, 0) // 2000 is a leap year
  })

  it('returns negative for dates before J2000', () => {
    const days = dateToJ2000Days(1999, 1, 1)
    expect(days).toBeLessThan(0)
    expect(days).toBeCloseTo(-365, 0)
  })

  it('handles leap years correctly', () => {
    // Feb 29, 2000 is day 59
    const days = dateToJ2000Days(2000, 2, 29)
    expect(days).toBe(59)
  })
})

describe('getCategoryColor', () => {
  it('returns a color string for each category', () => {
    const categories = ['comet', 'transit', 'eclipse', 'alignment', 'opposition', 'historic'] as const
    for (const cat of categories) {
      const color = getCategoryColor(cat)
      expect(color).toBeTruthy()
      expect(color.startsWith('#')).toBe(true)
    }
  })

  it('returns different colors for different categories', () => {
    const colors = new Set([
      getCategoryColor('comet'),
      getCategoryColor('transit'),
      getCategoryColor('eclipse'),
      getCategoryColor('alignment'),
    ])
    expect(colors.size).toBe(4)
  })
})
