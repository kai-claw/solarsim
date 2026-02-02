import { useRef, useEffect } from 'react'
import { useStore } from '../store/store'
import { SPEED_OPTIONS } from '../utils/constants'
import { TIME_EVENTS, getCategoryColor } from '../data/timeEvents'

const styles = {
  container: {
    position: 'absolute' as const,
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(8, 8, 28, 0.82)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '10px 16px',
    zIndex: 100,
    animation: 'slideInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  btn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#999',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  btnActive: {
    background: 'rgba(100, 180, 255, 0.18)',
    borderColor: 'rgba(100, 180, 255, 0.4)',
    color: '#64B4FF',
    boxShadow: '0 0 12px rgba(100, 180, 255, 0.1)',
  },
  playBtn: {
    background: 'rgba(0, 255, 136, 0.12)',
    border: '1px solid rgba(0, 255, 136, 0.25)',
    borderRadius: '50%',
    color: '#00ff88',
    width: 36,
    height: 36,
    cursor: 'pointer',
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: '0 0 0 0 rgba(0, 255, 136, 0)',
    flexShrink: 0,
  },
  time: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    minWidth: 80,
    textAlign: 'center' as const,
    fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
    letterSpacing: 0.5,
  },
  speedIndicator: {
    position: 'absolute' as const,
    bottom: -1,
    left: '50%',
    transform: 'translateX(-50%)',
    height: 2,
    borderRadius: 1,
    background: 'linear-gradient(90deg, rgba(100, 180, 255, 0.3), rgba(100, 180, 255, 0.6), rgba(100, 180, 255, 0.3))',
    transition: 'width 0.5s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s ease',
  },
  divider: {
    width: 1,
    height: 20,
    background: 'rgba(255,255,255,0.06)',
    margin: '0 4px',
    flexShrink: 0,
  },
}

export function TimeControls() {
  const paused = useStore((s) => s.paused)
  const speed = useStore((s) => s.speed)
  const elapsedDays = useStore((s) => s.elapsedDays)
  const activeEvent = useStore((s) => s.activeEvent)
  const togglePaused = useStore((s) => s.togglePaused)
  const setSpeed = useStore((s) => s.setSpeed)
  const containerRef = useRef<HTMLDivElement>(null)

  const years = Math.floor(elapsedDays / 365.256)
  const days = Math.floor(elapsedDays % 365.256)

  // Active time machine event
  const currentEvent = activeEvent ? TIME_EVENTS.find((e) => e.id === activeEvent) : null
  const eventColor = currentEvent ? getCategoryColor(currentEvent.category) : '#fff'

  // Speed change flash effect
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.borderColor = 'rgba(100, 180, 255, 0.3)'
      const timer = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.borderColor = 'rgba(255,255,255,0.08)'
        }
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [speed])

  // Speed intensity — maps to visual feedback
  const speedRatio = SPEED_OPTIONS.indexOf(speed) / (SPEED_OPTIONS.length - 1)

  return (
    <>
    {currentEvent && (
      <div style={{
        position: 'absolute',
        bottom: 72,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(8, 8, 28, 0.88)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${eventColor}40`,
        borderRadius: 10,
        padding: '8px 16px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        animation: 'slideInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        boxShadow: `0 4px 20px ${eventColor}15`,
      }}>
        <span style={{ fontSize: 16 }}>{currentEvent.emoji}</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: eventColor }}>
            {currentEvent.name}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            {currentEvent.date}
          </div>
        </div>
      </div>
    )}
    <div ref={containerRef} style={{
      ...styles.container,
      transition: 'border-color 0.5s ease',
    }}>
      {/* Speed intensity indicator bar */}
      <div style={{
        ...styles.speedIndicator,
        width: `${Math.max(10, speedRatio * 80)}%`,
        opacity: speed > 1 ? 0.8 : 0,
      }} />

      <div style={styles.time}>
        {years > 0 ? `${years}y ${days}d` : `${days}d`}
      </div>

      <div style={styles.divider} />

      <button
        style={{
          ...styles.playBtn,
          animation: paused ? 'playPulse 2s ease-in-out infinite' : 'none',
          background: paused ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 180, 50, 0.1)',
          borderColor: paused ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 180, 50, 0.2)',
          color: paused ? '#00ff88' : '#FFB432',
        }}
        onClick={togglePaused}
        title={paused ? 'Play' : 'Pause'}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.12)'
          e.currentTarget.style.boxShadow = paused
            ? '0 0 18px rgba(0, 255, 136, 0.3)'
            : '0 0 18px rgba(255, 180, 50, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 0 0 0 rgba(0, 255, 136, 0)'
        }}
      >
        {paused ? '▶' : '⏸'}
      </button>

      <div style={styles.divider} />

      {SPEED_OPTIONS.map((s) => (
        <button
          key={s}
          style={{
            ...styles.btn,
            ...(speed === s ? styles.btnActive : {}),
          }}
          onClick={() => setSpeed(s)}
          onMouseEnter={(e) => {
            if (speed !== s) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = '#ccc'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={(e) => {
            if (speed !== s) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = '#999'
              e.currentTarget.style.transform = 'translateY(0)'
            }
          }}
        >
          {s >= 1000 ? `${s / 1000}K` : s}×
        </button>
      ))}
    </div>
    </>
  )
}
