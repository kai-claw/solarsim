import { useStore } from '../store/store'
import { PLANETS } from '../data/planets'
import { SUN_DATA } from '../data/planets'

const styles = {
  card: {
    position: 'absolute' as const,
    top: 20,
    right: 20,
    width: 320,
    background: 'rgba(10, 10, 30, 0.9)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 20,
    zIndex: 100,
    animation: 'fadeIn 0.3s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    color: '#888',
    width: 28,
    height: 28,
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  type: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    padding: '3px 8px',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.06)',
    display: 'inline-block',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#aaa',
    lineHeight: 1.5,
    marginBottom: 16,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  stat: {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding: '8px 10px',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#e0e0e0',
    marginTop: 2,
  },
  followBtn: {
    width: '100%',
    marginTop: 12,
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid rgba(0, 255, 136, 0.3)',
    background: 'rgba(0, 255, 136, 0.1)',
    color: '#00ff88',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
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
        <div style={styles.header}>
          <span style={{ ...styles.name, color: SUN_DATA.color }}>{SUN_DATA.name}</span>
          <button style={styles.closeBtn} onClick={() => setSelectedPlanet(null)}>✕</button>
        </div>
        <div style={{ ...styles.type, color: '#FDB813' }}>{SUN_DATA.type}</div>
        <p style={styles.description}>{SUN_DATA.description}</p>
        <div style={styles.statsGrid}>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Radius</div>
            <div style={styles.statValue}>{formatNumber(SUN_DATA.radius)} km</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Mass</div>
            <div style={styles.statValue}>{SUN_DATA.mass}</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Temperature</div>
            <div style={styles.statValue}>{SUN_DATA.temperature}</div>
          </div>
        </div>
      </div>
    )
  }

  const planet = PLANETS.find((p) => p.name === selectedPlanet)
  if (!planet) return null

  const isFollowing = cameraTarget === planet.name

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={{ ...styles.name, color: planet.color }}>{planet.name}</span>
        <button style={styles.closeBtn} onClick={() => setSelectedPlanet(null)}>✕</button>
      </div>

      <div style={{ ...styles.type, color: planet.color }}>{planet.type}</div>

      <p style={styles.description}>{planet.description}</p>

      <div style={styles.statsGrid}>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Radius</div>
          <div style={styles.statValue}>{formatNumber(planet.radius)} km</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Mass</div>
          <div style={styles.statValue}>{planet.mass}</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Distance from Sun</div>
          <div style={styles.statValue}>{formatDistance(planet.distanceFromSun)}</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Orbital Period</div>
          <div style={styles.statValue}>{formatNumber(Math.round(planet.orbitalPeriod))} days</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Rotation Period</div>
          <div style={styles.statValue}>{Math.abs(planet.rotationPeriod).toFixed(1)}h{planet.rotationPeriod < 0 ? ' ↺' : ''}</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Eccentricity</div>
          <div style={styles.statValue}>{planet.eccentricity.toFixed(4)}</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Surface Gravity</div>
          <div style={styles.statValue}>{planet.surfaceGravity} m/s²</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Escape Velocity</div>
          <div style={styles.statValue}>{planet.escapeVelocity} km/s</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Moons</div>
          <div style={styles.statValue}>{planet.moons}</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Temperature</div>
          <div style={styles.statValue}>{planet.temperature}</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Axial Tilt</div>
          <div style={styles.statValue}>{planet.axialTilt}°</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Rings</div>
          <div style={styles.statValue}>{planet.hasRings ? 'Yes' : 'No'}</div>
        </div>
      </div>

      <button
        style={{
          ...styles.followBtn,
          ...(isFollowing ? {
            background: 'rgba(0, 255, 136, 0.25)',
            borderColor: 'rgba(0, 255, 136, 0.5)',
          } : {}),
        }}
        onClick={() => setCameraTarget(isFollowing ? null : planet.name)}
      >
        {isFollowing ? '📷 Unfollow' : `📷 Follow ${planet.name}`}
      </button>
    </div>
  )
}
