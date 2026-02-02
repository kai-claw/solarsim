import { describe, it, expect } from 'vitest'
import { TOUR_PRESETS, getTourPreset } from './tourPresets'
import { PLANETS } from '../data/planets'

describe('tourPresets', () => {
  it('has at least 3 tour presets', () => {
    expect(TOUR_PRESETS.length).toBeGreaterThanOrEqual(3)
  })

  it('each preset has a unique id', () => {
    const ids = TOUR_PRESETS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each preset has required fields', () => {
    for (const preset of TOUR_PRESETS) {
      expect(preset.id).toBeTruthy()
      expect(preset.name).toBeTruthy()
      expect(preset.icon).toBeTruthy()
      expect(preset.description).toBeTruthy()
      expect(preset.stops.length).toBeGreaterThan(0)
    }
  })

  it('each stop has required fields', () => {
    for (const preset of TOUR_PRESETS) {
      for (const stop of preset.stops) {
        expect(stop.name).toBeTruthy()
        expect(stop.description).toBeTruthy()
        expect(stop.icon).toBeTruthy()
        expect(typeof stop.speed).toBe('number')
        expect(stop.speed).toBeGreaterThan(0)
        expect(typeof stop.durationMs).toBe('number')
        expect(stop.durationMs).toBeGreaterThan(0)
      }
    }
  })

  it('grand-tour visits all 8 planets', () => {
    const grandTour = getTourPreset('grand-tour')
    expect(grandTour).toBeDefined()
    
    const planetNames = PLANETS.map((p) => p.name)
    const tourTargets = grandTour!.stops.map((s) => s.target).filter(Boolean)
    
    for (const name of planetNames) {
      expect(tourTargets).toContain(name)
    }
  })

  it('stop targets reference valid planets or null', () => {
    const planetNames = PLANETS.map((p) => p.name)
    for (const preset of TOUR_PRESETS) {
      for (const stop of preset.stops) {
        if (stop.target !== null) {
          expect(planetNames).toContain(stop.target)
        }
      }
    }
  })

  describe('getTourPreset', () => {
    it('returns preset by id', () => {
      const preset = getTourPreset('grand-tour')
      expect(preset).toBeDefined()
      expect(preset!.name).toBe('Grand Tour')
    })

    it('returns undefined for non-existent id', () => {
      expect(getTourPreset('non-existent')).toBeUndefined()
    })

    it('finds all presets by their id', () => {
      for (const preset of TOUR_PRESETS) {
        expect(getTourPreset(preset.id)).toBe(preset)
      }
    })
  })

  it('total tour durations are reasonable (10s-90s)', () => {
    for (const preset of TOUR_PRESETS) {
      const totalMs = preset.stops.reduce((acc, s) => acc + s.durationMs, 0)
      const totalSec = totalMs / 1000
      expect(totalSec).toBeGreaterThanOrEqual(10)
      expect(totalSec).toBeLessThanOrEqual(90)
    }
  })
})
