import { useState, useMemo } from 'react'
import { useStore } from '../store/store'
import { PLANETS } from '../data/planets'
import { computeHohmann } from '../utils/hohmann'

const panelStyles = {
  container: {
    position: 'absolute' as const,
    top: 20,
    right: 20,
    background: 'rgba(10, 10, 30, 0.9)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(100, 180, 255, 0.25)',
    borderRadius: 12,
    padding: 16,
    zIndex: 100,
    width: 280,
    maxHeight: '80vh',
    overflowY: 'auto' as const,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: '#64B4FF',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: 8,
  },
  select: {
    width: '100%',
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#e0e0e0',
    fontSize: 13,
    cursor: 'pointer',
    outline: 'none',
  },
  resultBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    background: 'rgba(100, 180, 255, 0.08)',
    border: '1px solid rgba(100, 180, 255, 0.15)',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: '#ccc',
    padding: '3px 0',
  },
  statValue: {
    color: '#64B4FF',
    fontWeight: 600,
    fontFamily: 'monospace',
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 10,
    right: 12,
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: 16,
    cursor: 'pointer',
    padding: 4,
  },
  toggleBtn: {
    position: 'absolute' as const,
    top: 20,
    right: 20,
    background: 'rgba(10, 10, 30, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(100, 180, 255, 0.25)',
    borderRadius: 8,
    padding: '8px 14px',
    color: '#64B4FF',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
}

export function MissionPlanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [origin, setOrigin] = useState('Earth')
  const [destination, setDestination] = useState('Mars')
  const showMission = useStore((s) => s.showMission)
  const setMission = useStore((s) => s.setMission)

  const originPlanet = PLANETS.find((p) => p.name === origin)
  const destPlanet = PLANETS.find((p) => p.name === destination)

  const hohmann = useMemo(() => {
    if (!originPlanet || !destPlanet || origin === destination) return null
    return computeHohmann(originPlanet.distanceFromSun, destPlanet.distanceFromSun)
  }, [originPlanet, destPlanet, origin, destination])

  const handleToggle = () => {
    const next = !isOpen
    setIsOpen(next)
    if (!next) {
      setMission(null)
    }
  }

  // Update store with mission data when computed
  useMemo(() => {
    if (hohmann && isOpen) {
      setMission({ origin, destination, hohmann })
    }
  }, [hohmann, isOpen, origin, destination, setMission])

  if (!isOpen) {
    return (
      <button style={panelStyles.toggleBtn} onClick={handleToggle}>
        🚀 Mission Planner
      </button>
    )
  }

  return (
    <div style={panelStyles.container}>
      <button style={panelStyles.closeBtn} onClick={handleToggle}>✕</button>
      <div style={panelStyles.title}>🚀 Mission Planner</div>

      <div style={panelStyles.label}>Origin</div>
      <select
        style={panelStyles.select}
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
      >
        {PLANETS.map((p) => (
          <option key={p.name} value={p.name}>{p.name}</option>
        ))}
      </select>

      <div style={panelStyles.label}>Destination</div>
      <select
        style={panelStyles.select}
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      >
        {PLANETS.filter((p) => p.name !== origin).map((p) => (
          <option key={p.name} value={p.name}>{p.name}</option>
        ))}
      </select>

      {hohmann && (
        <div style={panelStyles.resultBox}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64B4FF', marginBottom: 8 }}>
            Hohmann Transfer Orbit
          </div>

          <div style={panelStyles.stat}>
            <span>Departure Δv</span>
            <span style={panelStyles.statValue}>{hohmann.deltaV1.toFixed(2)} km/s</span>
          </div>
          <div style={panelStyles.stat}>
            <span>Arrival Δv</span>
            <span style={panelStyles.statValue}>{hohmann.deltaV2.toFixed(2)} km/s</span>
          </div>
          <div style={panelStyles.stat}>
            <span>Total Δv</span>
            <span style={panelStyles.statValue}>{hohmann.totalDeltaV.toFixed(2)} km/s</span>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '6px 0' }} />

          <div style={panelStyles.stat}>
            <span>Travel Time</span>
            <span style={panelStyles.statValue}>
              {hohmann.transferDays < 365
                ? `${Math.round(hohmann.transferDays)} days`
                : `${(hohmann.transferDays / 365.256).toFixed(1)} years`}
            </span>
          </div>
          <div style={panelStyles.stat}>
            <span>Phase Angle</span>
            <span style={panelStyles.statValue}>{hohmann.phaseAngle.toFixed(1)}°</span>
          </div>
          <div style={panelStyles.stat}>
            <span>Transfer SMA</span>
            <span style={panelStyles.statValue}>{hohmann.transferSMA.toFixed(2)} AU</span>
          </div>
          <div style={panelStyles.stat}>
            <span>Eccentricity</span>
            <span style={panelStyles.statValue}>{hohmann.transferEccentricity.toFixed(4)}</span>
          </div>

          {showMission && (
            <div style={{
              marginTop: 8,
              padding: '6px 8px',
              borderRadius: 6,
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.2)',
              fontSize: 11,
              color: '#00ff88',
              textAlign: 'center',
            }}>
              ✨ Transfer orbit displayed in 3D view
            </div>
          )}
        </div>
      )}
    </div>
  )
}
