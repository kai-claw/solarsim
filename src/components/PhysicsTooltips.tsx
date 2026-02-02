/**
 * Educational physics tooltips — shows the math behind orbital mechanics.
 * Activated via a "Learn" toggle in the Mission Planner.
 */

import { useState } from 'react'
import type { HohmannResult } from '../utils/hohmann'

const styles = {
  container: {
    marginTop: 12,
    borderTop: '1px solid rgba(100, 180, 255, 0.15)',
    paddingTop: 12,
  },
  toggleBtn: {
    width: '100%',
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid rgba(180, 140, 255, 0.3)',
    background: 'rgba(180, 140, 255, 0.1)',
    color: '#B48CFF',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'all 0.2s',
  },
  section: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    background: 'rgba(180, 140, 255, 0.06)',
    border: '1px solid rgba(180, 140, 255, 0.12)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#B48CFF',
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  equation: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#e0e0e0',
    background: 'rgba(0,0,0,0.3)',
    padding: '6px 10px',
    borderRadius: 6,
    marginBottom: 4,
    textAlign: 'center' as const,
    letterSpacing: 0.5,
  },
  explanation: {
    fontSize: 11,
    color: '#999',
    lineHeight: 1.5,
    marginTop: 4,
  },
  value: {
    color: '#64B4FF',
    fontWeight: 600,
    fontFamily: 'monospace',
  },
}

interface PhysicsTooltipsProps {
  hohmann: HohmannResult
  originName: string
  destName: string
}

export function PhysicsTooltips({ hohmann, originName, destName }: PhysicsTooltipsProps) {
  const [showLearn, setShowLearn] = useState(false)

  if (!showLearn) {
    return (
      <div style={styles.container}>
        <button
          style={styles.toggleBtn}
          onClick={() => setShowLearn(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(180, 140, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(180, 140, 255, 0.1)'
          }}
        >
          📐 Show the Math
        </button>
      </div>
    )
  }

  const r1 = hohmann.r1AU
  const r2 = hohmann.r2AU
  const aT = hohmann.transferSMA

  return (
    <div style={styles.container}>
      <button
        style={{ ...styles.toggleBtn, background: 'rgba(180, 140, 255, 0.2)', borderColor: 'rgba(180, 140, 255, 0.5)' }}
        onClick={() => setShowLearn(false)}
      >
        📐 Hide the Math
      </button>

      {/* Vis-viva equation */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>📖 Vis-Viva Equation</div>
        <div style={styles.equation}>
          v² = μ(2/r − 1/a)
        </div>
        <div style={styles.explanation}>
          This fundamental equation relates orbital velocity <b>v</b> to position <b>r</b> and 
          semi-major axis <b>a</b>, with <b>μ</b> as the Sun's gravitational parameter.
          It's how we calculate the speeds needed at each point in the transfer.
        </div>
        <div style={{ ...styles.explanation, marginTop: 8 }}>
          At {originName} (r = <span style={styles.value}>{r1.toFixed(3)} AU</span>):
          circular velocity → transfer velocity gives Δv₁ = <span style={styles.value}>{hohmann.deltaV1.toFixed(2)} km/s</span>
        </div>
      </div>

      {/* Hohmann transfer */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>🔄 Hohmann Transfer</div>
        <div style={styles.equation}>
          a_transfer = (r₁ + r₂) / 2
        </div>
        <div style={styles.explanation}>
          The transfer orbit is an ellipse tangent to both circular orbits.
          Its semi-major axis is the average of the two orbital radii:
        </div>
        <div style={{ ...styles.explanation, marginTop: 4 }}>
          (<span style={styles.value}>{r1.toFixed(3)}</span> + <span style={styles.value}>{r2.toFixed(3)}</span>) / 2 
          = <span style={styles.value}>{aT.toFixed(3)} AU</span>
        </div>
      </div>

      {/* Kepler's Third Law */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>⏱️ Kepler's Third Law</div>
        <div style={styles.equation}>
          T² = (4π²/μ) · a³
        </div>
        <div style={styles.explanation}>
          The transfer time is half the period of the transfer ellipse.
          With a = <span style={styles.value}>{aT.toFixed(3)} AU</span>, 
          the half-period gives a travel time of{' '}
          <span style={styles.value}>
            {hohmann.transferDays < 365
              ? `${Math.round(hohmann.transferDays)} days`
              : `${(hohmann.transferDays / 365.256).toFixed(1)} years`}
          </span>.
        </div>
      </div>

      {/* Phase angle */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>📐 Phase Angle</div>
        <div style={styles.equation}>
          θ = 180° − (T_transfer/T_outer) × 360°
        </div>
        <div style={styles.explanation}>
          {destName} must be <span style={styles.value}>{Math.abs(hohmann.phaseAngle).toFixed(1)}°</span>{' '}
          {hohmann.phaseAngle > 0 ? 'ahead of' : 'behind'} {originName} at departure so they 
          meet at the right place. This is why launch windows are rare!
        </div>
      </div>

      {/* Total energy */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>⚡ Energy Budget</div>
        <div style={styles.explanation}>
          Total Δv = <span style={styles.value}>{hohmann.totalDeltaV.toFixed(2)} km/s</span> — this is the minimum 
          energy transfer between {originName} and {destName}. Any other trajectory requires more fuel. 
          The Hohmann transfer is beautifully efficient: it uses just two engine burns.
        </div>
      </div>
    </div>
  )
}
