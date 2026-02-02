import { useState, useEffect, useCallback, useRef } from 'react'
import { useStore } from '../store/store'
import { TOUR_PRESETS, type TourPreset, type TourStop } from '../utils/tourPresets'

/* ── Styles ────────────────────────────────────────────── */

const styles = {
  menuBtn: {
    position: 'absolute' as const,
    bottom: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(8, 8, 28, 0.82)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(253, 184, 19, 0.2)',
    borderRadius: 12,
    padding: '9px 18px',
    color: '#FDB813',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    letterSpacing: 0.3,
  },
  selector: {
    position: 'absolute' as const,
    bottom: 120,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(8, 8, 28, 0.92)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(253, 184, 19, 0.15)',
    borderRadius: 18,
    padding: 22,
    zIndex: 200,
    width: 380,
    maxWidth: '90vw',
    animation: 'scaleIn 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  presetCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    cursor: 'pointer',
    marginBottom: 8,
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  hud: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as const,
    zIndex: 150,
    pointerEvents: 'none' as const,
    animation: 'hudReveal 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  hudStopName: {
    fontSize: 32,
    fontWeight: 300,
    color: '#fff',
    textShadow: '0 0 40px rgba(0,0,0,0.9), 0 0 80px rgba(0,0,0,0.6)',
    marginBottom: 10,
    letterSpacing: 2,
  },
  hudStopDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    textShadow: '0 0 20px rgba(0,0,0,0.9)',
    maxWidth: 400,
    lineHeight: 1.5,
  },
  letterboxTop: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0,
    background: '#000',
    zIndex: 140,
    animation: 'letterboxIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards',
    pointerEvents: 'none' as const,
  },
  letterboxBottom: {
    position: 'absolute' as const,
    bottom: 0, left: 0, right: 0,
    background: '#000',
    zIndex: 140,
    animation: 'letterboxIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards',
    pointerEvents: 'none' as const,
  },
  progressContainer: {
    position: 'absolute' as const,
    bottom: 58,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'rgba(8, 8, 28, 0.85)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(253, 184, 19, 0.15)',
    borderRadius: 14,
    padding: '10px 20px',
    zIndex: 160,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  stopBtn: {
    background: 'rgba(255, 100, 100, 0.1)',
    border: '1px solid rgba(255, 100, 100, 0.25)',
    borderRadius: 8,
    color: '#FF6B6B',
    padding: '5px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: 8,
    transition: 'all 0.2s ease',
  },
}

/* ── Sub-components ────────────────────────────────────── */

interface TourSelectorProps {
  onSelect: (preset: TourPreset) => void
  onClose: () => void
}

function TourSelector({ onSelect, onClose }: TourSelectorProps) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,5,0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 190,
          animation: 'sceneReveal 0.3s ease',
        }}
        onClick={onClose}
      />
      <div style={styles.selector}>
        <div style={{
          fontSize: 16, fontWeight: 300, color: '#FDB813',
          marginBottom: 18, display: 'flex', alignItems: 'center',
          gap: 10, letterSpacing: 1,
        }}>
          🎬 <span style={{ fontWeight: 600 }}>Cinematic Tours</span>
        </div>
        {TOUR_PRESETS.map((preset, i) => (
          <div
            key={preset.id}
            style={{ ...styles.presetCard, animation: `fadeIn 0.3s ease ${i * 0.06}s both` }}
            onClick={() => onSelect(preset)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(253, 184, 19, 0.06)'
              e.currentTarget.style.borderColor = 'rgba(253, 184, 19, 0.2)'
              e.currentTarget.style.transform = 'translateX(3px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            <span style={{ fontSize: 30 }}>{preset.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0', letterSpacing: 0.3 }}>
                {preset.name}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3, lineHeight: 1.4 }}>
                {preset.description}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4, letterSpacing: 0.5 }}>
                {preset.stops.length} stops · ~{Math.round(preset.stops.reduce((a, s) => a + s.durationMs, 0) / 1000)}s
              </div>
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          Press <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>T</span> to toggle tours · <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Esc</span> to close
        </div>
      </div>
    </>
  )
}

interface TourHUDProps {
  tour: TourPreset
  currentStop: number
  showHUD: boolean
  onStop: () => void
}

function TourHUD({ tour, currentStop, showHUD, onStop }: TourHUDProps) {
  const stop = tour.stops[currentStop]
  return (
    <>
      <div style={styles.letterboxTop} />
      <div style={styles.letterboxBottom} />

      {showHUD && stop && (
        <div style={styles.hud}>
          <div style={{
            fontSize: 44, marginBottom: 12,
            filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))',
          }}>{stop.icon}</div>
          <div style={styles.hudStopName}>{stop.name}</div>
          <div style={styles.hudStopDesc}>{stop.description}</div>
        </div>
      )}

      <div style={styles.progressContainer}>
        <span style={{ fontSize: 12, color: '#FDB813', fontWeight: 600, letterSpacing: 0.5 }}>
          {tour.icon} {tour.name}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {tour.stops.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.progressDot,
                background: i === currentStop
                  ? '#FDB813'
                  : i < currentStop
                  ? 'rgba(253, 184, 19, 0.4)'
                  : 'rgba(255,255,255,0.1)',
                width: i === currentStop ? 10 : 8,
                height: i === currentStop ? 10 : 8,
                animation: i === currentStop ? 'dotPulse 1.5s ease-in-out infinite' : 'none',
              }}
            />
          ))}
        </div>
        <button
          style={styles.stopBtn}
          onClick={onStop}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 100, 100, 0.2)'
            e.currentTarget.style.borderColor = 'rgba(255, 100, 100, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 100, 100, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(255, 100, 100, 0.25)'
          }}
        >
          Stop
        </button>
      </div>
    </>
  )
}

/* ── Main component ────────────────────────────────────── */

interface CinematicTourProps {
  externalOpen?: boolean
  onClose?: () => void
}

export function CinematicTour({ externalOpen, onClose }: CinematicTourProps) {
  const [showSelector, setShowSelector] = useState(false)
  const [activeTour, setActiveTour] = useState<TourPreset | null>(null)
  const [currentStop, setCurrentStop] = useState(0)
  const [showHUD, setShowHUD] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setCameraTarget = useStore((s) => s.setCameraTarget)
  const setSpeed = useStore((s) => s.setSpeed)
  const setPaused = useStore((s) => s.setPaused)
  const setSelectedPlanet = useStore((s) => s.setSelectedPlanet)

  useEffect(() => {
    if (externalOpen) setShowSelector(true)
  }, [externalOpen])

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    if (hudTimerRef.current) { clearTimeout(hudTimerRef.current); hudTimerRef.current = null }
  }, [])

  const applyStop = useCallback((stop: TourStop) => {
    setCameraTarget(stop.target)
    setSpeed(stop.speed)
    setPaused(false)
    if (stop.target) setSelectedPlanet(stop.target)
  }, [setCameraTarget, setSpeed, setPaused, setSelectedPlanet])

  const startTour = useCallback((preset: TourPreset) => {
    setActiveTour(preset)
    setCurrentStop(0)
    setShowSelector(false)
  }, [])

  // Single useEffect drives tour progression — no duplicate timers
  useEffect(() => {
    if (!activeTour) return

    const stop = activeTour.stops[currentStop]
    if (!stop) return

    clearTimers()
    applyStop(stop)
    setShowHUD(true)

    hudTimerRef.current = setTimeout(() => setShowHUD(false), 2500)

    timerRef.current = setTimeout(() => {
      const nextIdx = currentStop + 1
      if (nextIdx >= activeTour.stops.length) {
        setActiveTour(null)
        setCurrentStop(0)
        setShowHUD(false)
      } else {
        setCurrentStop(nextIdx)
      }
    }, stop.durationMs)

    return clearTimers
  }, [activeTour, currentStop, applyStop, clearTimers])

  const stopTour = useCallback(() => {
    clearTimers()
    setActiveTour(null)
    setCurrentStop(0)
    setShowHUD(false)
  }, [clearTimers])

  const handleSelectorClose = useCallback(() => {
    setShowSelector(false)
    onClose?.()
  }, [onClose])

  if (showSelector && !activeTour) {
    return <TourSelector onSelect={startTour} onClose={handleSelectorClose} />
  }

  if (activeTour) {
    return (
      <TourHUD
        tour={activeTour}
        currentStop={currentStop}
        showHUD={showHUD}
        onStop={stopTour}
      />
    )
  }

  return (
    <button
      style={styles.menuBtn}
      onClick={() => setShowSelector(true)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(253, 184, 19, 0.45)'
        e.currentTarget.style.background = 'rgba(253, 184, 19, 0.08)'
        e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.4), 0 0 20px rgba(253, 184, 19, 0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(253, 184, 19, 0.2)'
        e.currentTarget.style.background = 'rgba(8, 8, 28, 0.82)'
        e.currentTarget.style.transform = 'translateX(-50%) translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
      }}
    >
      🎬 Cinematic Tours
    </button>
  )
}
