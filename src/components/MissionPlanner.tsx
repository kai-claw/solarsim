import { useState, useMemo } from 'react'
import { useStore } from '../store/store'
import { PLANETS } from '../data/planets'
import { computeHohmann } from '../utils/hohmann'
import { PhysicsTooltips } from './PhysicsTooltips'

const panelStyles = {
  container: {
    position: 'absolute' as const,
    top: 20,
    right: 20,
    background: 'rgba(8, 8, 28, 0.88)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(100, 180, 255, 0.15)',
    borderRadius: 14,
    padding: 18,
    zIndex: 100,
    width: 280,
    maxHeight: '80vh',
    overflowY: 'auto' as const,
    animation: 'slideInRight 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: '#64B4FF',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginBottom: 4,
    marginTop: 10,
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e0e0e0',
    fontSize: 13,
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  resultBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 10,
    background: 'rgba(100, 180, 255, 0.06)',
    border: '1px solid rgba(100, 180, 255, 0.1)',
    animation: 'fadeIn 0.3s ease',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    padding: '4px 0',
  },
  statValue: {
    color: '#64B4FF',
    fontWeight: 600,
    fontFamily: 'monospace',
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 12,
    right: 14,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#666',
    fontSize: 14,
    cursor: 'pointer',
    padding: '4px 8px',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  toggleBtn: {
    position: 'absolute' as const,
    top: 20,
    right: 20,
    background: 'rgba(8, 8, 28, 0.82)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(100, 180, 255, 0.15)',
    borderRadius: 10,
    padding: '9px 16px',
    color: '#64B4FF',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    letterSpacing: 0.3,
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
      <button
        style={panelStyles.toggleBtn}
        onClick={handleToggle}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(100, 180, 255, 0.35)'
          e.currentTarget.style.background = 'rgba(100, 180, 255, 0.06)'
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.4), 0 0 16px rgba(100, 180, 255, 0.06)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(100, 180, 255, 0.15)'
          e.currentTarget.style.background = 'rgba(8, 8, 28, 0.82)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        🚀 Mission Planner
      </button>
    )
  }

  return (
    <div style={panelStyles.container}>
      {/* Accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        height: 2,
        borderRadius: '0 0 2px 2px',
        background: 'linear-gradient(90deg, transparent, rgba(100, 180, 255, 0.4), transparent)',
      }} />

      <button
        style={panelStyles.closeBtn}
        onClick={handleToggle}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#aaa' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#666' }}
      >✕</button>
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
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64B4FF', marginBottom: 10, letterSpacing: 0.3 }}>
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

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0' }} />

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
              marginTop: 10,
              padding: '7px 10px',
              borderRadius: 8,
              background: 'rgba(0, 255, 136, 0.06)',
              border: '1px solid rgba(0, 255, 136, 0.15)',
              fontSize: 11,
              color: '#00ff88',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease',
            }}>
              ✨ Transfer orbit displayed in 3D view
            </div>
          )}

          {/* Educational physics breakdown */}
          <PhysicsTooltips hohmann={hohmann} originName={origin} destName={destination} />
        </div>
      )}
    </div>
  )
}
