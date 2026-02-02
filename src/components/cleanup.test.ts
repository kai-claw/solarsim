import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Black Hat #2 — Resource cleanup & code quality audit tests.
 * Validates that Three.js components properly dispose resources,
 * side effects use correct hooks, and timer cleanup is handled.
 */

const SRC = path.join(__dirname, '..')
const COMPONENTS = path.join(SRC, 'components')

function readComponent(name: string): string {
  return fs.readFileSync(path.join(COMPONENTS, name), 'utf-8')
}

describe('Three.js resource cleanup', () => {
  const threeComponents = [
    { file: 'GravityGrid.tsx', resources: ['geometry', 'material'] },
    { file: 'Starfield.tsx', resources: ['nearGeo', 'farGeo'] },
    { file: 'Sun.tsx', resources: ['coronaMaterial'] },
    { file: 'AsteroidBelt.tsx', resources: ['geometry'] },
  ]

  for (const { file, resources } of threeComponents) {
    it(`${file} disposes ${resources.join(', ')} on unmount`, () => {
      const src = readComponent(file)
      // Must have a useEffect with dispose calls
      expect(src).toContain('useEffect')
      for (const r of resources) {
        expect(src).toContain(`${r}.dispose()`)
      }
    })
  }

  it('all Three.js components import useEffect', () => {
    for (const { file } of threeComponents) {
      const src = readComponent(file)
      expect(src).toMatch(/import\s*{[^}]*useEffect[^}]*}\s*from\s*'react'/)
    }
  })
})

describe('CinematicTour timer management', () => {
  const src = readComponent('CinematicTour.tsx')

  it('tracks HUD hide timer in a ref (hudTimerRef)', () => {
    expect(src).toContain('hudTimerRef')
  })

  it('has a clearTimers function that clears both timer refs', () => {
    expect(src).toContain('clearTimers')
    // Both refs should be cleared
    expect(src).toContain('timerRef.current')
    expect(src).toContain('hudTimerRef.current')
  })

  it('useEffect returns cleanup function', () => {
    // The tour progression effect should return clearTimers
    expect(src).toContain('return clearTimers')
  })

  it('stopTour calls clearTimers', () => {
    // stopTour should properly clean up
    const stopMatch = src.match(/const stopTour[\s\S]*?}, \[/)
    expect(stopMatch).toBeTruthy()
    expect(stopMatch![0]).toContain('clearTimers')
  })

  it('does not have untracked setTimeout for HUD hide', () => {
    // All setTimeout calls should either assign to timerRef or hudTimerRef
    const timeoutCalls = src.match(/setTimeout\(/g) || []
    const trackedCalls = src.match(/(timerRef|hudTimerRef)\.current\s*=\s*setTimeout\(/g) || []
    expect(trackedCalls.length).toBe(timeoutCalls.length)
  })
})

describe('CinematicTour component structure', () => {
  const src = readComponent('CinematicTour.tsx')

  it('extracts TourSelector as a sub-component', () => {
    expect(src).toContain('function TourSelector(')
  })

  it('extracts TourHUD as a sub-component', () => {
    expect(src).toContain('function TourHUD(')
  })

  it('main component uses sub-components', () => {
    expect(src).toContain('<TourSelector')
    expect(src).toContain('<TourHUD')
  })

  it('component is under 300 LOC (main export function)', () => {
    // Count lines of the main exported function
    const mainFnStart = src.indexOf('export function CinematicTour')
    expect(mainFnStart).toBeGreaterThan(-1)
    const mainFnSrc = src.slice(mainFnStart)
    const lines = mainFnSrc.split('\n').length
    // Main function should be significantly smaller than original 407 LOC
    expect(lines).toBeLessThan(120)
  })
})

describe('MissionPlanner side-effect correctness', () => {
  const src = readComponent('MissionPlanner.tsx')

  it('uses useEffect (not useMemo) for store side effects', () => {
    // setMission should be called from useEffect, not useMemo
    const effectBlock = src.match(/useEffect\(\(\)\s*=>\s*{[\s\S]*?setMission/)
    expect(effectBlock).toBeTruthy()
  })

  it('does not use useMemo for side effects', () => {
    // useMemo should NOT contain setMission
    const memoBlocks = src.match(/useMemo\(\(\)\s*=>\s*{[\s\S]*?}\s*,\s*\[/g) || []
    for (const block of memoBlocks) {
      expect(block).not.toContain('setMission')
    }
  })
})

describe('No dead code in audited components', () => {
  it('CinematicTour has no unused advanceStop function', () => {
    const src = readComponent('CinematicTour.tsx')
    expect(src).not.toContain('advanceStop')
  })

  it('no console.log statements in any component', () => {
    const files = fs.readdirSync(COMPONENTS).filter(f => f.endsWith('.tsx'))
    for (const file of files) {
      const src = readComponent(file)
      expect(src).not.toMatch(/console\.log\(/)
    }
  })
})
