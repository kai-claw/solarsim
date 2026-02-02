import { useStore } from '../store/store'
import { PLANETS } from '../data/planets'
import { SUN_DATA } from '../data/planets'

const styles = {
  card: {
    position: 'absolute' as const,
    top: 20,
    right: 20,
    width: 320,
    background: 'rgba(8, 8, 28, 0.88)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 22,
    zIndex: 100,
    animation: 'slideInRight 0.45s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: -0.5,
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#555',
    width: 30,
    height: 30,
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  type: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    padding: '4px 10px',
    borderRadius: 6,
    background: 'rgba(255,255,255,0.04)',
    display: 'inline-block',
    marginBottom: 14,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.65,
    marginBottom: 18,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 5,
  },
  stat: {
    background: 'rgba(255,255,255,0.025)',
    borderRadius: 8,
    padding: '8px 10px',
    transition: 'all 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
    cursor: 'default',
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e0e0e0',
    marginTop: 2,
  },
  followBtn: {
    width: '100%',
    marginTop: 14,
    padding: '10px 16px',
    borderRadius: 10,
    border: '1px solid rgba(0, 255, 136, 0.2)',
    background: 'rgba(0, 255, 136, 0.06)',
    color: '#00ff88',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
    letterSpacing: 0.3,
  },
  accentLine: {
    position: 'absolute' as const,
    top: 0,
    left: 20,
    right: 20,
    height: 2,
    borderRadius: '0 0 2px 2px',
    opacity: 0.5,
  },
}

function formatNumber(n: number): string {
  if (n >= 1000) return n.toLocaleString()
  return n.toString()
}

function formatDistance(mkm: number): string {
  return `${mkm.toFixed(1)}M km (${(mkm / 149.6).toFixed(2)} AU)`
}

export function PlanetInfoCard() {
  const selectedPlanet = useStore((s) => s.selectedPlanet)
  const setSelectedPlanet = useStore((s) => s.setSelectedPlanet)
  const cameraTarget = useStore((s) => s.cameraTarget)
  const setCameraTarget = useStore((s) => s.setCameraTarget)

  if (!selectedPlanet) return null

  // Check if Sun is selected
  if (selectedPlanet === 'Sun') {
    return (
      <div style={styles.card}>
        <div style={{
          ...styles.accentLine,
          background: `linear-gradient(90deg, transparent, ${SUN_DATA.color}, transparent)`,
        }} />
        <div style={styles.header}>
          <span style={{ ...styles.name, color: SUN_DATA.color }}>{SUN_DATA.name}</span>
          <button
            style={styles.closeBtn}
            onClick={() => setSelectedPlanet(null)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = '#aaa'
              e.currentTarget.style.transform = 'rotate(90deg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = '#555'
              e.currentTarget.style.transform = 'rotate(0deg)'
            }}
          >✕</button>
        </div>
        <div style={{ ...styles.type, color: '#FDB813' }}>{SUN_DATA.type}</div>
        <p style={styles.description}>{SUN_DATA.description}</p>
        <div style={styles.statsGrid}>
          {[
            { label: 'Radius', value: `${formatNumber(SUN_DATA.radius)} km` },
            { label: 'Mass', value: SUN_DATA.mass },
            { label: 'Temperature', value: SUN_DATA.temperature },
          ].map((s, i) => (
            <div key={s.label} style={{
              ...styles.stat,
              animation: `staggerIn 0.3s ease ${i * 0.04}s both`,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}
            >
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statValue}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const planet = PLANETS.find((p) => p.name === selectedPlanet)
  if (!planet) return null

  const isFollowing = cameraTarget === planet.name

  return (
    <div style={styles.card}>
      {/* Color accent line at top */}
      <div style={{
        ...styles.accentLine,
        background: `linear-gradient(90deg, transparent, ${planet.color}, transparent)`,
      }} />

      <div style={styles.header}>
        <span style={{ ...styles.name, color: planet.color }}>{planet.name}</span>
        <button
          style={styles.closeBtn}
          onClick={() => setSelectedPlanet(null)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = '#aaa'
            e.currentTarget.style.transform = 'rotate(90deg)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.color = '#555'
            e.currentTarget.style.transform = 'rotate(0deg)'
          }}
        >✕</button>
      </div>

      <div style={{ ...styles.type, color: planet.color }}>{planet.type}</div>

      <p style={styles.description}>{planet.description}</p>

      <div style={styles.statsGrid}>
        {[
          { label: 'Radius', value: `${formatNumber(planet.radius)} km` },
          { label: 'Mass', value: planet.mass },
          { label: 'Distance from Sun', value: formatDistance(planet.distanceFromSun) },
          { label: 'Orbital Period', value: `${formatNumber(Math.round(planet.orbitalPeriod))} days` },
          { label: 'Rotation Period', value: `${Math.abs(planet.rotationPeriod).toFixed(1)}h${planet.rotationPeriod < 0 ? ' ↺' : ''}` },
          { label: 'Eccentricity', value: planet.eccentricity.toFixed(4) },
          { label: 'Surface Gravity', value: `${planet.surfaceGravity} m/s²` },
          { label: 'Escape Velocity', value: `${planet.escapeVelocity} km/s` },
          { label: 'Moons', value: `${planet.moons}` },
          { label: 'Temperature', value: planet.temperature },
          { label: 'Axial Tilt', value: `${planet.axialTilt}°` },
          { label: 'Rings', value: planet.hasRings ? 'Yes' : 'No' },
        ].map((s, i) => (
          <div key={s.label} style={{
            ...styles.stat,
            animation: `staggerIn 0.3s ease ${i * 0.03}s both`,
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}
          >
            <div style={styles.statLabel}>{s.label}</div>
            <div style={styles.statValue}>{s.value}</div>
          </div>
        ))}
      </div>

      <button
        style={{
          ...styles.followBtn,
          ...(isFollowing ? {
            background: 'rgba(0, 255, 136, 0.15)',
            borderColor: 'rgba(0, 255, 136, 0.4)',
            boxShadow: '0 0 16px rgba(0, 255, 136, 0.08)',
          } : {}),
        }}
        onClick={() => setCameraTarget(isFollowing ? null : planet.name)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isFollowing
            ? 'rgba(0, 255, 136, 0.22)'
            : 'rgba(0, 255, 136, 0.12)'
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 255, 136, 0.12)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isFollowing
            ? 'rgba(0, 255, 136, 0.15)'
            : 'rgba(0, 255, 136, 0.06)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = isFollowing
            ? '0 0 16px rgba(0, 255, 136, 0.08)'
            : 'none'
        }}
      >
        {isFollowing ? '📷 Unfollow' : `📷 Follow ${planet.name}`}
      </button>
    </div>
  )
}
