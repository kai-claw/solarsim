import { useStore } from '../store/store'

const styles = {
  container: {
    position: 'absolute' as const,
    bottom: 80,
    right: 20,
    maxWidth: 280,
    maxHeight: 200,
    overflow: 'auto',
    background: 'rgba(8, 8, 28, 0.82)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
    zIndex: 100,
    animation: 'slideInRight 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: 10,
    fontWeight: 600,
    color: '#FF6B6B',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  event: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    padding: '5px 0',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    transition: 'color 0.2s',
  },
  alignment: {
    display: 'inline-block',
    width: 40,
    height: 3,
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
      <div style={styles.title}>
        <span style={{ fontSize: 12 }}>🌑</span>
        Eclipse Events ({eclipseEvents.length})
      </div>
      {[...eclipseEvents].reverse().slice(0, 10).map((e, i) => {
        const years = Math.floor(e.time / 365.256)
        const days = Math.floor(e.time % 365.256)
        return (
          <div key={i} style={{
            ...styles.event,
            animation: i === 0 ? 'fadeIn 0.3s ease' : 'none',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 10 }}>
              {years > 0 ? `${years}y${days}d` : `${days}d`}
            </span>
            {' '}
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{e.innerPlanet}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>–</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{e.outerPlanet}</span>
            <span style={{
              ...styles.alignment,
              background: `rgba(255, 107, 107, ${Math.max(0.15, e.alignment)})`,
            }} />
          </div>
        )
      })}
    </div>
  )
}
