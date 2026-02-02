import { useState, useEffect, useCallback, useRef } from 'react'
import { useStore } from '../store/store'
import { TOUR_PRESETS, type TourPreset, type TourStop } from '../utils/tourPresets'

const styles = {
  // Tour menu button
  menuBtn: {
    position: 'absolute' as const,
    bottom: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(10, 10, 30, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(253, 184, 19, 0.3)',
    borderRadius: 10,
    padding: '8px 16px',
    color: '#FDB813',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.3s ease',
  },
  // Tour selector overlay
  selector: {
    position: 'absolute' as const,
    bottom: 120,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(10, 10, 30, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(253, 184, 19, 0.25)',
    borderRadius: 16,
    padding: 20,
    zIndex: 200,
    width: 380,
    maxWidth: '90vw',
  },
  presetCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    cursor: 'pointer',
    marginBottom: 8,
    transition: 'all 0.2s ease',
  },
  // Active tour HUD
  hud: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as const,
    zIndex: 150,
    pointerEvents: 'none' as const,
    animation: 'fadeIn 0.5s ease',
  },
  hudStopName: {
    fontSize: 28,
    fontWeight: 700,
    color: '#fff',
    textShadow: '0 0 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.5)',
    marginBottom: 8,
  },
  hudStopDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textShadow: '0 0 20px rgba(0,0,0,0.8)',
  },
  // Progress bar
  progressContainer: {
    position: 'absolute' as const,
    bottom: 70,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(10, 10, 30, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(253, 184, 19, 0.25)',
    borderRadius: 12,
    padding: '10px 18px',
    zIndex: 150,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  stopBtn: {
    background: 'rgba(255, 100, 100, 0.15)',
    border: '1px solid rgba(255, 100, 100, 0.3)',
    borderRadius: 6,
    color: '#FF6B6B',
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: 8,
  },
}

interface CinematicTourProps {
  /** External trigger to open the tour selector */
  externalOpen?: boolean
  onClose?: () => void
}

export function CinematicTour({ externalOpen, onClose }: CinematicTourProps) {
  const [showSelector, setShowSelector] = useState(false)
  const [activeTour, setActiveTour] = useState<TourPreset | null>(null)
  const [currentStop, setCurrentStop] = useState(0)
  const [showHUD, setShowHUD] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setCameraTarget = useStore((s) => s.setCameraTarget)
  const setSpeed = useStore((s) => s.setSpeed)
  const setPaused = useStore((s) => s.setPaused)
  const setSelectedPlanet = useStore((s) => s.setSelectedPlanet)

  // Handle external open
  useEffect(() => {
    if (externalOpen) setShowSelector(true)
  }, [externalOpen])

  const applyStop = useCallback((stop: TourStop) => {
    setCameraTarget(stop.target)
    setSpeed(stop.speed)
    setPaused(false)
    if (stop.target) {
      setSelectedPlanet(stop.target)
    }
  }, [setCameraTarget, setSpeed, setPaused, setSelectedPlanet])

  const advanceStop = useCallback(() => {
    if (!activeTour) return
    const nextIdx = currentStop + 1
    if (nextIdx >= activeTour.stops.length) {
      // Tour complete
      setActiveTour(null)
      setCurrentStop(0)
      setShowHUD(false)
      return
    }
    setCurrentStop(nextIdx)
    setShowHUD(true)
    applyStop(activeTour.stops[nextIdx])

    // Auto-hide HUD after 2.5s
    setTimeout(() => setShowHUD(false), 2500)

    // Schedule next stop
    timerRef.current = setTimeout(() => advanceStop(), activeTour.stops[nextIdx].durationMs)
  }, [activeTour, currentStop, applyStop])

  const startTour = useCallback((preset: TourPreset) => {
    setActiveTour(preset)
    setCurrentStop(0)
    setShowSelector(false)
    setShowHUD(true)
    applyStop(preset.stops[0])

    setTimeout(() => setShowHUD(false), 2500)
    timerRef.current = setTimeout(() => {
      // This will be called after the first stop duration
      setCurrentStop(0) // reset, advanceStop will increment
    }, preset.stops[0].durationMs)
  }, [applyStop])

  // Effect to handle stop advancement
  useEffect(() => {
    if (!activeTour) return

    const stop = activeTour.stops[currentStop]
    if (!stop) return

    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current)

    applyStop(stop)
    setShowHUD(true)
    setTimeout(() => setShowHUD(false), 2500)

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

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeTour, currentStop, applyStop])

  const stopTour = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setActiveTour(null)
    setCurrentStop(0)
    setShowHUD(false)
  }, [])

  const handleSelectorClose = () => {
    setShowSelector(false)
    onClose?.()
  }

  // Tour selector overlay
  if (showSelector && !activeTour) {
    return (
      <>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,5,0.4)',
            zIndex: 190,
          }}
          onClick={handleSelectorClose}
        />
        <div style={styles.selector}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#FDB813',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            🎬 Cinematic Tours
          </div>
          {TOUR_PRESETS.map((preset) => (
            <div
              key={preset.id}
              style={styles.presetCard}
              onClick={() => startTour(preset)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(253, 184, 19, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(253, 184, 19, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              }}
            >
              <span style={{ fontSize: 28 }}>{preset.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {preset.description}
                </div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>
                  {preset.stops.length} stops · ~{Math.round(preset.stops.reduce((a, s) => a + s.durationMs, 0) / 1000)}s
                </div>
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: '#555' }}>
            Press <span style={{ color: '#888', fontWeight: 600 }}>T</span> to toggle tours · <span style={{ color: '#888', fontWeight: 600 }}>Esc</span> to close
          </div>
        </div>
      </>
    )
  }

  // Active tour HUD
  if (activeTour) {
    const stop = activeTour.stops[currentStop]
    return (
      <>
        {/* Cinematic overlay text */}
        {showHUD && stop && (
          <div style={styles.hud}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{stop.icon}</div>
            <div style={styles.hudStopName}>{stop.name}</div>
            <div style={styles.hudStopDesc}>{stop.description}</div>
          </div>
        )}

        {/* Progress bar */}
        <div style={styles.progressContainer}>
          <span style={{ fontSize: 12, color: '#FDB813', fontWeight: 600 }}>
            {activeTour.icon} {activeTour.name}
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {activeTour.stops.map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.progressDot,
                  background: i === currentStop
                    ? '#FDB813'
                    : i < currentStop
                    ? 'rgba(253, 184, 19, 0.4)'
                    : 'rgba(255,255,255,0.15)',
                  width: i === currentStop ? 10 : 8,
                  height: i === currentStop ? 10 : 8,
                }}
              />
            ))}
          </div>
          <button style={styles.stopBtn} onClick={stopTour}>
            Stop
          </button>
        </div>
      </>
    )
  }

  // Default: tour button
  return (
    <button
      style={styles.menuBtn}
      onClick={() => setShowSelector(true)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(253, 184, 19, 0.6)'
        e.currentTarget.style.background = 'rgba(253, 184, 19, 0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(253, 184, 19, 0.3)'
        e.currentTarget.style.background = 'rgba(10, 10, 30, 0.85)'
      }}
    >
      🎬 Cinematic Tours
    </button>
  )
}
