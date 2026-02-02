import { useEffect, useState, useCallback } from 'react'
import { useStore } from '../store/store'
import { PLANETS } from '../data/planets'
import { SPEED_OPTIONS } from '../utils/constants'

interface KeyboardShortcutsProps {
  onTourToggle?: () => void
  onTimeMachineToggle?: () => void
}

export function KeyboardShortcuts({ onTourToggle, onTimeMachineToggle }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false)
  const togglePaused = useStore((s) => s.togglePaused)
  const setSpeed = useStore((s) => s.setSpeed)
  const speed = useStore((s) => s.speed)
  const toggleOrbits = useStore((s) => s.toggleOrbits)
  const toggleLabels = useStore((s) => s.toggleLabels)
  const toggleAsteroidBelt = useStore((s) => s.toggleAsteroidBelt)
  const toggleComets = useStore((s) => s.toggleComets)
  const toggleGravityGrid = useStore((s) => s.toggleGravityGrid)
  const scaleMode = useStore((s) => s.scaleMode)
  const setScaleMode = useStore((s) => s.setScaleMode)
  const setCameraTarget = useStore((s) => s.setCameraTarget)
  const setSelectedPlanet = useStore((s) => s.setSelectedPlanet)
  
  const handleShareLink = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url).catch(() => { /* ignore clipboard errors */ })
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't capture if typing in input
      if ((e.target as HTMLElement).tagName === 'INPUT') return

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          togglePaused()
          break
        case '?':
        case 'h':
          setShowHelp((v) => !v)
          break
        case 'escape':
          setShowHelp(false)
          setSelectedPlanet(null)
          setCameraTarget(null)
          break
        case 'o':
          toggleOrbits()
          break
        case 'l':
          toggleLabels()
          break
        case 'b':
          toggleAsteroidBelt()
          break
        case 's':
          setScaleMode(scaleMode === 'exaggerated' ? 'realistic' : 'exaggerated')
          break
        case 't':
          onTourToggle?.()
          break
        case 'c':
          toggleComets()
          break
        case 'g':
          toggleGravityGrid()
          break
        case 'm':
          onTimeMachineToggle?.()
          break
        case 'u':
          handleShareLink()
          break
        case 'arrowup':
        case '+':
        case '=': {
          const idx = SPEED_OPTIONS.indexOf(speed)
          if (idx < SPEED_OPTIONS.length - 1) setSpeed(SPEED_OPTIONS[idx + 1])
          break
        }
        case 'arrowdown':
        case '-': {
          const idx = SPEED_OPTIONS.indexOf(speed)
          if (idx > 0) setSpeed(SPEED_OPTIONS[idx - 1])
          break
        }
        // Number keys 1-8 for planets
        case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': {
          const pi = parseInt(e.key) - 1
          if (pi >= 0 && pi < PLANETS.length) {
            const name = PLANETS[pi].name
            setCameraTarget(name)
            setSelectedPlanet(name)
          }
          break
        }
        case '0':
          setCameraTarget(null)
          setSelectedPlanet(null)
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [togglePaused, setSpeed, speed, toggleOrbits, toggleLabels, toggleAsteroidBelt, toggleComets, toggleGravityGrid, scaleMode, setScaleMode, setCameraTarget, setSelectedPlanet, onTourToggle, onTimeMachineToggle, handleShareLink])

  if (!showHelp) {
    return (
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        background: 'rgba(10, 10, 30, 0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '6px 10px',
        zIndex: 100,
        fontSize: 11,
        color: '#666',
        cursor: 'pointer',
      }} onClick={() => setShowHelp(true)}>
        Press <span style={{ color: '#888', fontWeight: 600 }}>H</span> for keyboard shortcuts
      </div>
    )
  }

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 5, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 200,
    }} onClick={() => setShowHelp(false)}>
      <div style={{
        background: 'rgba(10, 10, 30, 0.95)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 28,
        maxWidth: 440,
        width: '90%',
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: '#FDB813', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          ⌨️ Keyboard Shortcuts
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px 16px', fontSize: 13 }}>
          {[
            ['Space', 'Play / Pause'],
            ['↑ / +', 'Speed up'],
            ['↓ / -', 'Slow down'],
            ['1-8', 'Focus planet'],
            ['0', 'Free camera'],
            ['T', 'Cinematic tours'],
            ['M', 'Time machine'],
            ['G', 'Gravity wells'],
            ['S', 'Toggle scale mode'],
            ['O', 'Toggle orbits'],
            ['L', 'Toggle labels'],
            ['B', 'Toggle asteroid belt'],
            ['C', 'Toggle comets'],
            ['U', 'Copy share link'],
            ['Esc', 'Deselect / close'],
            ['H / ?', 'Toggle this help'],
          ].map(([key, desc]) => (
            <>
              <span key={`k-${key}`} style={{
                color: '#00ff88',
                fontFamily: 'monospace',
                fontWeight: 600,
                padding: '3px 0',
              }}>{key}</span>
              <span key={`d-${key}`} style={{ color: '#aaa', padding: '3px 0' }}>{desc}</span>
            </>
          ))}
        </div>
        <div style={{ marginTop: 16, textAlign: 'center', color: '#555', fontSize: 11 }}>
          Click anywhere or press Esc to close
        </div>
      </div>
    </div>
  )
}
