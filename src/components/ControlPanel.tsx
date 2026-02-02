import { useStore } from '../store/store'
import type { ScaleMode } from '../store/store'
import { PLANETS } from '../data/planets'

const styles = {
  panel: {
    position: 'absolute' as const,
    top: 20,
    left: 20,
    background: 'rgba(8, 8, 28, 0.82)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 18,
    zIndex: 100,
    minWidth: 210,
    animation: 'slideInLeft 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#FDB813',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    animation: 'titleEntrance 1s cubic-bezier(0.23, 1, 0.32, 1) forwards',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '5px 0',
    fontSize: 13,
    color: '#bbb',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  checkbox: {
    accentColor: '#00ff88',
    cursor: 'pointer',
  },
  scaleBtn: {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#999',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    marginRight: 6,
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  scaleBtnActive: {
    background: 'rgba(253, 184, 19, 0.15)',
    borderColor: 'rgba(253, 184, 19, 0.4)',
    color: '#FDB813',
    boxShadow: '0 0 12px rgba(253, 184, 19, 0.1)',
  },
  planetBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    padding: '6px 10px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: '#999',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    transition: 'all 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
    position: 'relative' as const,
  },
}

export function ControlPanel() {
  const scaleMode = useStore((s) => s.scaleMode)
  const showOrbits = useStore((s) => s.showOrbits)
  const showLabels = useStore((s) => s.showLabels)
  const showAsteroidBelt = useStore((s) => s.showAsteroidBelt)
  const showEclipses = useStore((s) => s.showEclipses)
  const showComets = useStore((s) => s.showComets)
  const cameraTarget = useStore((s) => s.cameraTarget)
  const setScaleMode = useStore((s) => s.setScaleMode)
  const toggleOrbits = useStore((s) => s.toggleOrbits)
  const toggleLabels = useStore((s) => s.toggleLabels)
  const toggleAsteroidBelt = useStore((s) => s.toggleAsteroidBelt)
  const toggleEclipses = useStore((s) => s.toggleEclipses)
  const toggleComets = useStore((s) => s.toggleComets)
  const setCameraTarget = useStore((s) => s.setCameraTarget)

  return (
    <div style={styles.panel}>
      <div style={styles.title}>
        ☀️ SolarSim
      </div>

      {/* Scale Mode */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Scale</div>
        <div style={{ display: 'flex' }}>
          {(['exaggerated', 'realistic'] as ScaleMode[]).map((mode) => (
            <button
              key={mode}
              style={{
                ...styles.scaleBtn,
                ...(scaleMode === mode ? styles.scaleBtnActive : {}),
              }}
              onClick={() => setScaleMode(mode)}
              onMouseEnter={(e) => {
                if (scaleMode !== mode) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = '#ccc'
                }
              }}
              onMouseLeave={(e) => {
                if (scaleMode !== mode) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = '#999'
                }
              }}
            >
              {mode === 'exaggerated' ? '🔭 Visible' : '📏 Realistic'}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Display</div>
        <label style={styles.toggle}>
          Orbits
          <input type="checkbox" checked={showOrbits} onChange={toggleOrbits} style={styles.checkbox} />
        </label>
        <label style={styles.toggle}>
          Labels
          <input type="checkbox" checked={showLabels} onChange={toggleLabels} style={styles.checkbox} />
        </label>
        <label style={styles.toggle}>
          Asteroid Belt
          <input type="checkbox" checked={showAsteroidBelt} onChange={toggleAsteroidBelt} style={styles.checkbox} />
        </label>
        <label style={styles.toggle}>
          Eclipse Detection
          <input type="checkbox" checked={showEclipses} onChange={toggleEclipses} style={styles.checkbox} />
        </label>
        <label style={styles.toggle}>
          Comets
          <input type="checkbox" checked={showComets} onChange={toggleComets} style={styles.checkbox} />
        </label>
      </div>

      {/* Camera Follow */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Follow Planet</div>
        <button
          style={{
            ...styles.planetBtn,
            background: cameraTarget === null ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: cameraTarget === null ? '#e0e0e0' : '#999',
          }}
          onClick={() => setCameraTarget(null)}
        >
          🌌 Free Camera
        </button>
        {PLANETS.map((p) => (
          <button
            key={p.name}
            style={{
              ...styles.planetBtn,
              background: cameraTarget === p.name ? `${p.color}18` : 'transparent',
              color: cameraTarget === p.name ? p.color : '#999',
              borderLeft: cameraTarget === p.name ? `2px solid ${p.color}` : '2px solid transparent',
              paddingLeft: cameraTarget === p.name ? 10 : 12,
            }}
            onClick={() => setCameraTarget(cameraTarget === p.name ? null : p.name)}
            onMouseEnter={(e) => {
              if (cameraTarget !== p.name) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = '#ccc'
                e.currentTarget.style.transform = 'translateX(2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (cameraTarget !== p.name) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#999'
                e.currentTarget.style.transform = 'translateX(0)'
              }
            }}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
