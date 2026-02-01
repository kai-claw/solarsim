import { useStore } from '../store/store'

const styles = {
  container: {
    position: 'absolute' as const,
    bottom: 80,
    right: 20,
    maxWidth: 280,
    maxHeight: 200,
    overflow: 'auto',
    background: 'rgba(10, 10, 30, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    zIndex: 100,
  },
  title: {
    fontSize: 11,
    fontWeight: 600,
    color: '#FF6B6B',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  event: {
    fontSize: 11,
    color: '#ccc',
    padding: '4px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  alignment: {
    display: 'inline-block',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginLeft: 6,
    verticalAlign: 'middle',
  },
}

export function EclipseLog() {
  const eclipseEvents = useStore((s) => s.eclipseEvents)
  const showEclipses = useStore((s) => s.showEclipses)

  if (!showEclipses || eclipseEvents.length === 0) return null

  return (
    <div style={styles.container}>
      <div style={styles.title}>🌑 Eclipse Events ({eclipseEvents.length})</div>
      {[...eclipseEvents].reverse().slice(0, 10).map((e, i) => {
        const years = Math.floor(e.time / 365.256)
        const days = Math.floor(e.time % 365.256)
        return (
          <div key={i} style={styles.event}>
            <span style={{ color: '#888', fontFamily: 'monospace' }}>
              {years > 0 ? `${years}y${days}d` : `${days}d`}
            </span>
            {' '}
            {e.innerPlanet}–{e.outerPlanet}
            <span style={{
              ...styles.alignment,
              background: `rgba(255, 107, 107, ${e.alignment})`,
            }} />
          </div>
        )
      })}
    </div>
  )
}
