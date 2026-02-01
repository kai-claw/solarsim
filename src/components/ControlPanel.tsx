import { useStore } from '../store/store'
import type { ScaleMode } from '../store/store'
import { PLANETS } from '../data/planets'

const styles = {
  panel: {
    position: 'absolute' as const,
    top: 20,
    left: 20,
    background: 'rgba(10, 10, 30, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    zIndex: 100,
    minWidth: 200,
    animation: 'fadeIn 0.3s ease',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#FDB813',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 6,
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 0',
    fontSize: 13,
    color: '#ccc',
    cursor: 'pointer',
  },
  checkbox: {
    accentColor: '#00ff88',
    cursor: 'pointer',
  },
  scaleBtn: {
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: 12,
    marginRight: 6,
    transition: 'all 0.2s',
  },
  scaleBtnActive: {
    background: 'rgba(253, 184, 19, 0.2)',
    borderColor: 'rgba(253, 184, 19, 0.5)',
    color: '#FDB813',
  },
  planetBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    padding: '5px 8px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: 12,
    transition: 'background 0.2s',
  },
}

export function ControlPanel() {
  const scaleMode = useStore((s) => s.scaleMode)
  const showOrbits = useStore((s) => s.showOrbits)
  const showLabels = useStore((s) => s.showLabels)
  const showAsteroidBelt = useStore((s) => s.showAsteroidBelt)
  const showEclipses = useStore((s) => s.showEclipses)
  const cameraTarget = useStore((s) => s.cameraTarget)
  const setScaleMode = useStore((s) => s.setScaleMode)
  const toggleOrbits = useStore((s) => s.toggleOrbits)
  const toggleLabels = useStore((s) => s.toggleLabels)
  const toggleAsteroidBelt = useStore((s) => s.toggleAsteroidBelt)
  const toggleEclipses = useStore((s) => s.toggleEclipses)
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
      </div>

      {/* Camera Follow */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Follow Planet</div>
        <button
          style={{
            ...styles.planetBtn,
            background: cameraTarget === null ? 'rgba(255,255,255,0.1)' : 'transparent',
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
              background: cameraTarget === p.name ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: cameraTarget === p.name ? p.color : '#ccc',
            }}
            onClick={() => setCameraTarget(cameraTarget === p.name ? null : p.name)}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = cameraTarget === p.name ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
