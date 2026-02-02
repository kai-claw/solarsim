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
    background: 'rgba(10, 10, 30, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '10px 16px',
    zIndex: 100,
  },
  btn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    color: '#e0e0e0',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  btnActive: {
    background: 'rgba(100, 180, 255, 0.25)',
    borderColor: 'rgba(100, 180, 255, 0.5)',
    color: '#64B4FF',
  },
  playBtn: {
    background: 'rgba(0, 255, 136, 0.15)',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    borderRadius: '50%',
    color: '#00ff88',
    width: 36,
    height: 36,
    cursor: 'pointer',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  time: {
    color: '#888',
    fontSize: 11,
    minWidth: 100,
    textAlign: 'center' as const,
    fontFamily: 'monospace',
  },
}

export function TimeControls() {
  const paused = useStore((s) => s.paused)
  const speed = useStore((s) => s.speed)
  const elapsedDays = useStore((s) => s.elapsedDays)
  const togglePaused = useStore((s) => s.togglePaused)
  const setSpeed = useStore((s) => s.setSpeed)

  const years = Math.floor(elapsedDays / 365.256)
  const days = Math.floor(elapsedDays % 365.256)

  return (
    <div style={styles.container}>
      <div style={styles.time}>
        {years > 0 ? `${years}y ${days}d` : `${days}d`}
      </div>

      <button
        style={styles.playBtn}
        onClick={togglePaused}
        title={paused ? 'Play' : 'Pause'}
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
        >
          {s >= 1000 ? `${s / 1000}K` : s}×
        </button>
      ))}
    </div>
  )
}
