import { describe, it, expect } from 'vitest'
import { encodeURLState, decodeURLState, type URLState } from './urlState'

describe('urlState', () => {
  describe('encodeURLState', () => {
    it('returns empty string for default state', () => {
      expect(encodeURLState({})).toBe('')
    })

    it('returns empty string when speed is 1 (default)', () => {
      expect(encodeURLState({ speed: 1 })).toBe('')
    })

    it('encodes speed', () => {
      const hash = encodeURLState({ speed: 100 })
      expect(hash).toContain('spd=100')
      expect(hash.startsWith('#')).toBe(true)
    })

    it('encodes paused state', () => {
      const hash = encodeURLState({ paused: true })
      expect(hash).toContain('p=1')
    })

    it('does not encode paused=false', () => {
      const hash = encodeURLState({ paused: false })
      expect(hash).not.toContain('p=')
    })

    it('encodes elapsed days', () => {
      const hash = encodeURLState({ days: 365 })
      expect(hash).toContain('d=365')
    })

    it('rounds days to integers', () => {
      const hash = encodeURLState({ days: 365.7 })
      expect(hash).toContain('d=366')
    })

    it('does not encode zero days', () => {
      const hash = encodeURLState({ days: 0 })
      expect(hash).not.toContain('d=')
    })

    it('encodes camera target', () => {
      const hash = encodeURLState({ target: 'Saturn' })
      expect(hash).toContain('t=Saturn')
    })

    it('encodes selected planet', () => {
      const hash = encodeURLState({ selected: 'Mars' })
      expect(hash).toContain('s=Mars')
    })

    it('encodes realistic scale mode', () => {
      const hash = encodeURLState({ scale: 'realistic' })
      expect(hash).toContain('sc=r')
    })

    it('does not encode exaggerated scale (default)', () => {
      const hash = encodeURLState({ scale: 'exaggerated' })
      expect(hash).not.toContain('sc=')
    })

    it('encodes toggled-off display options', () => {
      const hash = encodeURLState({ orbits: false, labels: false, belt: false, comets: false })
      expect(hash).toContain('o=0')
      expect(hash).toContain('l=0')
      expect(hash).toContain('b=0')
      expect(hash).toContain('c=0')
    })

    it('does not encode toggled-on display options', () => {
      const hash = encodeURLState({ orbits: true, labels: true })
      expect(hash).not.toContain('o=')
      expect(hash).not.toContain('l=')
    })

    it('encodes tour preset', () => {
      const hash = encodeURLState({ tour: 'grand-tour' })
      expect(hash).toContain('tour=grand-tour')
    })

    it('encodes complex state correctly', () => {
      const hash = encodeURLState({
        speed: 500,
        paused: true,
        days: 1000,
        target: 'Earth',
        scale: 'realistic',
        orbits: false,
      })
      expect(hash).toContain('spd=500')
      expect(hash).toContain('p=1')
      expect(hash).toContain('d=1000')
      expect(hash).toContain('t=Earth')
      expect(hash).toContain('sc=r')
      expect(hash).toContain('o=0')
    })
  })

  describe('decodeURLState', () => {
    it('returns empty object for empty hash', () => {
      expect(decodeURLState('')).toEqual({})
    })

    it('returns empty object for hash with only #', () => {
      expect(decodeURLState('#')).toEqual({})
    })

    it('decodes speed', () => {
      const state = decodeURLState('#spd=100')
      expect(state.speed).toBe(100)
    })

    it('decodes paused state', () => {
      const state = decodeURLState('#p=1')
      expect(state.paused).toBe(true)
    })

    it('decodes days', () => {
      const state = decodeURLState('#d=365')
      expect(state.days).toBe(365)
    })

    it('decodes camera target', () => {
      const state = decodeURLState('#t=Jupiter')
      expect(state.target).toBe('Jupiter')
    })

    it('decodes selected planet', () => {
      const state = decodeURLState('#s=Venus')
      expect(state.selected).toBe('Venus')
    })

    it('decodes realistic scale', () => {
      const state = decodeURLState('#sc=r')
      expect(state.scale).toBe('realistic')
    })

    it('decodes toggled-off options', () => {
      const state = decodeURLState('#o=0&l=0&b=0&c=0')
      expect(state.orbits).toBe(false)
      expect(state.labels).toBe(false)
      expect(state.belt).toBe(false)
      expect(state.comets).toBe(false)
    })

    it('decodes tour preset', () => {
      const state = decodeURLState('#tour=comet-watch')
      expect(state.tour).toBe('comet-watch')
    })

    it('handles hash without # prefix', () => {
      const state = decodeURLState('spd=50')
      expect(state.speed).toBe(50)
    })
  })

  describe('roundtrip', () => {
    it('encode → decode preserves state', () => {
      const original: URLState = {
        speed: 500,
        paused: true,
        days: 1000,
        target: 'Earth',
        selected: 'Earth',
        scale: 'realistic',
        orbits: false,
        comets: false,
        tour: 'grand-tour',
      }
      const hash = encodeURLState(original)
      const decoded = decodeURLState(hash)

      expect(decoded.speed).toBe(500)
      expect(decoded.paused).toBe(true)
      expect(decoded.days).toBe(1000)
      expect(decoded.target).toBe('Earth')
      expect(decoded.selected).toBe('Earth')
      expect(decoded.scale).toBe('realistic')
      expect(decoded.orbits).toBe(false)
      expect(decoded.comets).toBe(false)
      expect(decoded.tour).toBe('grand-tour')
    })
  })
})
