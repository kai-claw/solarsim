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
        background: 'rgba(8, 8, 28, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8,
        padding: '6px 12px',
        zIndex: 100,
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        animation: 'fadeInSubtle 1s ease 2s both',
      }}
        onClick={() => setShowHelp(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
        }}
      >
        Press <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>H</span> for shortcuts
      </div>
    )
  }

  const shortcuts = [
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
  ]

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 5, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 200,
      animation: 'fadeInSubtle 0.25s ease',
    }} onClick={() => setShowHelp(false)}>
      <div style={{
        background: 'rgba(8, 8, 28, 0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 18,
        padding: '28px 32px',
        maxWidth: 440,
        width: '90%',
        animation: 'scaleIn 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{
          color: '#FDB813', fontSize: 18, fontWeight: 700, marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          ⌨️ Keyboard Shortcuts
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px 16px', fontSize: 13,
        }}>
          {shortcuts.map(([key, desc], i) => (
            <div key={`row-${key}`} style={{
              display: 'contents',
              animation: `staggerIn 0.2s ease ${i * 0.02}s both`,
            }}>
              <span style={{
                color: '#00ff88',
                fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
                fontWeight: 600,
                fontSize: 12,
                padding: '4px 0',
              }}>{key}</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', padding: '4px 0' }}>{desc}</span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 20, textAlign: 'center',
          color: 'rgba(255,255,255,0.25)', fontSize: 11,
        }}>
          Click anywhere or press <span style={{ color: 'rgba(255,255,255,0.4)' }}>Esc</span> to close
        </div>
      </div>
    </div>
  )
}
