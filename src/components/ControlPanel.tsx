import { useCallback } from 'react'
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
    borderRadius: 16,
    padding: '18px 18px 14px',
    zIndex: 100,
    minWidth: 210,
    animation: 'slideInLeft 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 17,
    fontWeight: 700,
    color: '#FDB813',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    userSelect: 'none' as const,
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

/* Inline toggle switch — replaces plain checkbox for premium feel */
function ToggleSwitch({ checked, onChange, accentColor = '#00ff88' }: {
  checked: boolean
  onChange: () => void
  accentColor?: string
}) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    onChange()
  }, [onChange])

  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange() } }}
      style={{
        width: 32,
        height: 18,
        borderRadius: 10,
        background: checked ? `${accentColor}30` : 'rgba(255,255,255,0.08)',
        border: `1px solid ${checked ? `${accentColor}50` : 'rgba(255,255,255,0.12)'}`,
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: checked ? accentColor : 'rgba(255,255,255,0.3)',
        position: 'absolute',
        top: 2,
        left: checked ? 16 : 3,
        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        boxShadow: checked ? `0 0 6px ${accentColor}40` : 'none',
      }} />
    </div>
  )
}

export function ControlPanel() {
  const scaleMode = useStore((s) => s.scaleMode)
  const showOrbits = useStore((s) => s.showOrbits)
  const showLabels = useStore((s) => s.showLabels)
  const showAsteroidBelt = useStore((s) => s.showAsteroidBelt)
  const showEclipses = useStore((s) => s.showEclipses)
  const showComets = useStore((s) => s.showComets)
  const showGravityGrid = useStore((s) => s.showGravityGrid)
  const cameraTarget = useStore((s) => s.cameraTarget)
  const setScaleMode = useStore((s) => s.setScaleMode)
  const toggleOrbits = useStore((s) => s.toggleOrbits)
  const toggleLabels = useStore((s) => s.toggleLabels)
  const toggleAsteroidBelt = useStore((s) => s.toggleAsteroidBelt)
  const toggleEclipses = useStore((s) => s.toggleEclipses)
  const toggleComets = useStore((s) => s.toggleComets)
  const toggleGravityGrid = useStore((s) => s.toggleGravityGrid)
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
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (scaleMode !== mode) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = '#999'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              {mode === 'exaggerated' ? '🔭 Visible' : '📏 Realistic'}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles — premium switch style */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Display</div>
        {[
          { label: 'Orbits', checked: showOrbits, toggle: toggleOrbits },
          { label: 'Labels', checked: showLabels, toggle: toggleLabels },
          { label: 'Asteroid Belt', checked: showAsteroidBelt, toggle: toggleAsteroidBelt },
          { label: 'Eclipse Detection', checked: showEclipses, toggle: toggleEclipses },
          { label: 'Comets', checked: showComets, toggle: toggleComets },
          { label: 'Gravity Wells', checked: showGravityGrid, toggle: toggleGravityGrid, accent: '#64B4FF' },
        ].map((item) => (
          <div key={item.label} style={styles.toggle} onClick={item.toggle}>
            <span style={{ color: item.checked ? '#ddd' : 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>
              {item.label}
            </span>
            <ToggleSwitch
              checked={item.checked}
              onChange={item.toggle}
              accentColor={item.accent}
            />
          </div>
        ))}
      </div>

      {/* Camera Follow */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Follow Planet</div>
        <button
          style={{
            ...styles.planetBtn,
            background: cameraTarget === null ? 'rgba(255,255,255,0.06)' : 'transparent',
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
              background: cameraTarget === p.name ? `${p.color}15` : 'transparent',
              color: cameraTarget === p.name ? p.color : '#999',
              borderLeft: cameraTarget === p.name ? `2px solid ${p.color}` : '2px solid transparent',
              paddingLeft: cameraTarget === p.name ? 10 : 12,
            }}
            onClick={() => setCameraTarget(cameraTarget === p.name ? null : p.name)}
            onMouseEnter={(e) => {
              if (cameraTarget !== p.name) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.color = '#ccc'
                e.currentTarget.style.transform = 'translateX(3px)'
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
