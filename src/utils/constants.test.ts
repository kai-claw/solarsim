import { describe, it, expect } from 'vitest'
import { SPEED_OPTIONS } from './constants'

describe('SPEED_OPTIONS', () => {
  it('is sorted in ascending order', () => {
    for (let i = 1; i < SPEED_OPTIONS.length; i++) {
      expect(SPEED_OPTIONS[i]).toBeGreaterThan(SPEED_OPTIONS[i - 1])
    }
  })

  it('starts at 1x', () => {
    expect(SPEED_OPTIONS[0]).toBe(1)
  })

  it('contains expected values', () => {
    expect(SPEED_OPTIONS).toContain(1)
    expect(SPEED_OPTIONS).toContain(100)
    expect(SPEED_OPTIONS).toContain(10000)
  })

  it('all values are positive integers', () => {
    for (const s of SPEED_OPTIONS) {
      expect(s).toBeGreaterThan(0)
      expect(Number.isInteger(s)).toBe(true)
    }
  })
})
