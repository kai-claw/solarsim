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
  // Tour selector overlay
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
  // Active tour HUD
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
  // Cinematic letterbox bars
  letterboxTop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    background: '#000',
    zIndex: 140,
    animation: 'letterboxIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards',
    pointerEvents: 'none' as const,
  },
  letterboxBottom: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: '#000',
    zIndex: 140,
    animation: 'letterboxIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards',
    pointerEvents: 'none' as const,
  },
  // Progress bar
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
      setCurrentStop(0)
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
            background: 'rgba(0,0,5,0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 190,
            animation: 'sceneReveal 0.3s ease',
          }}
          onClick={handleSelectorClose}
        />
        <div style={styles.selector}>
          <div style={{
            fontSize: 16,
            fontWeight: 300,
            color: '#FDB813',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            letterSpacing: 1,
          }}>
            🎬 <span style={{ fontWeight: 600 }}>Cinematic Tours</span>
          </div>
          {TOUR_PRESETS.map((preset, i) => (
            <div
              key={preset.id}
              style={{
                ...styles.presetCard,
                animation: `fadeIn 0.3s ease ${i * 0.06}s both`,
              }}
              onClick={() => startTour(preset)}
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

  // Active tour HUD
  if (activeTour) {
    const stop = activeTour.stops[currentStop]
    return (
      <>
        {/* Cinematic letterbox bars */}
        <div style={styles.letterboxTop} />
        <div style={styles.letterboxBottom} />

        {/* Cinematic overlay text */}
        {showHUD && stop && (
          <div style={styles.hud}>
            <div style={{
              fontSize: 44,
              marginBottom: 12,
              filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))',
            }}>{stop.icon}</div>
            <div style={styles.hudStopName}>{stop.name}</div>
            <div style={styles.hudStopDesc}>{stop.description}</div>
          </div>
        )}

        {/* Progress bar */}
        <div style={styles.progressContainer}>
          <span style={{ fontSize: 12, color: '#FDB813', fontWeight: 600, letterSpacing: 0.5 }}>
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
            onClick={stopTour}
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

  // Default: tour button
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
