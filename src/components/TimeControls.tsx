import { useRef, useEffect } from 'react'
import { useStore } from '../store/store'
import { SPEED_OPTIONS } from '../utils/constants'

const styles = {
  container: {
    position: 'absolute' as const,
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(8, 8, 28, 0.82)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '10px 18px',
    zIndex: 100,
    animation: 'slideInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
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
    width: 38,
    height: 38,
    cursor: 'pointer',
    fontSize: 16,
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
    minWidth: 90,
    textAlign: 'center' as const,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  speedIndicator: {
    position: 'absolute' as const,
    bottom: -6,
    left: '50%',
    transform: 'translateX(-50%)',
    height: 2,
    borderRadius: 1,
    background: 'rgba(100, 180, 255, 0.5)',
    transition: 'width 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
  },
}

export function TimeControls() {
  const paused = useStore((s) => s.paused)
  const speed = useStore((s) => s.speed)
  const elapsedDays = useStore((s) => s.elapsedDays)
  const togglePaused = useStore((s) => s.togglePaused)
  const setSpeed = useStore((s) => s.setSpeed)
  const containerRef = useRef<HTMLDivElement>(null)

  const years = Math.floor(elapsedDays / 365.256)
  const days = Math.floor(elapsedDays % 365.256)

  // Speed change flash effect
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.borderColor = 'rgba(100, 180, 255, 0.35)'
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
    <div ref={containerRef} style={{
      ...styles.container,
      transition: 'border-color 0.5s ease',
    }}>
      {/* Speed intensity indicator bar */}
      <div style={{
        ...styles.speedIndicator,
        width: `${Math.max(10, speedRatio * 80)}%`,
        opacity: speed > 1 ? 0.6 : 0,
      }} />

      <div style={styles.time}>
        {years > 0 ? `${years}y ${days}d` : `${days}d`}
      </div>

      <button
        style={{
          ...styles.playBtn,
          animation: paused ? 'playPulse 2s ease-in-out infinite' : 'none',
          background: paused ? 'rgba(0, 255, 136, 0.18)' : 'rgba(255, 180, 50, 0.12)',
          borderColor: paused ? 'rgba(0, 255, 136, 0.35)' : 'rgba(255, 180, 50, 0.25)',
          color: paused ? '#00ff88' : '#FFB432',
        }}
        onClick={togglePaused}
        title={paused ? 'Play' : 'Pause'}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = paused
            ? '0 0 16px rgba(0, 255, 136, 0.3)'
            : '0 0 16px rgba(255, 180, 50, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 0 0 0 rgba(0, 255, 136, 0)'
        }}
      >
        {paused ? '▶' : '⏸'}
      </button>

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
            }
          }}
          onMouseLeave={(e) => {
            if (speed !== s) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = '#999'
            }
          }}
        >
          {s >= 1000 ? `${s / 1000}K` : s}×
        </button>
      ))}
    </div>
  )
}
