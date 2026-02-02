/**
 * Hohmann transfer orbit calculator.
 *
 * Computes the parameters for a minimum-energy transfer between two circular
 * (or near-circular) orbits around the Sun.
 */

/** Gravitational parameter of the Sun in km³/s² */
const MU_SUN = 1.327124e11

/** 1 AU in km */
const AU_KM = 149_597_870.7

export interface HohmannResult {
  /** Semi-major axis of transfer ellipse in AU */
  transferSMA: number
  /** Eccentricity of transfer ellipse */
  transferEccentricity: number
  /** Δv at departure (km/s) */
  deltaV1: number
  /** Δv at arrival (km/s) */
  deltaV2: number
  /** Total Δv (km/s) */
  totalDeltaV: number
  /** Transfer time in Earth days */
  transferDays: number
  /** Phase angle needed at departure (degrees) */
  phaseAngle: number
  /** Departure orbit radius in AU */
  r1AU: number
  /** Arrival orbit radius in AU */
  r2AU: number
}

/**
 * Compute Hohmann transfer between two planets given their semi-major axes
 * in million km (matching PlanetData.distanceFromSun).
 */
export function computeHohmann(r1Mkm: number, r2Mkm: number): HohmannResult {
  const r1 = r1Mkm * 1e6  // km
  const r2 = r2Mkm * 1e6  // km

  // Ensure r1 < r2 for canonical Hohmann (inner to outer)
  const inner = Math.min(r1, r2)
  const outer = Math.max(r1, r2)

  // Transfer orbit semi-major axis
  const aTransfer = (inner + outer) / 2  // km

  // Orbital velocities (circular approximation)
  const v1Circ = Math.sqrt(MU_SUN / inner)
  const v2Circ = Math.sqrt(MU_SUN / outer)

  // Transfer orbit velocities at periapsis and apoapsis
  const vTransferPeri = Math.sqrt(MU_SUN * (2 / inner - 1 / aTransfer))
  const vTransferApo = Math.sqrt(MU_SUN * (2 / outer - 1 / aTransfer))

  // Delta-v requirements
  const dv1 = Math.abs(vTransferPeri - v1Circ)
  const dv2 = Math.abs(v2Circ - vTransferApo)

  // Transfer time (half the orbital period of the transfer ellipse)
  const transferPeriodS = 2 * Math.PI * Math.sqrt(Math.pow(aTransfer, 3) / MU_SUN)
  const transferTimeS = transferPeriodS / 2
  const transferDays = transferTimeS / 86400

  // Transfer eccentricity
  const eTransfer = (outer - inner) / (outer + inner)

  // Phase angle: angle the target planet must lead (or trail) at departure
  const outerPeriodS = 2 * Math.PI * Math.sqrt(Math.pow(outer, 3) / MU_SUN)
  const angleTraversed = (transferTimeS / outerPeriodS) * 360  // degrees outer planet moves
  const phaseAngle = 180 - angleTraversed

  return {
    transferSMA: aTransfer / AU_KM,
    transferEccentricity: eTransfer,
    deltaV1: dv1,
    deltaV2: dv2,
    totalDeltaV: dv1 + dv2,
    transferDays,
    phaseAngle,
    r1AU: inner / AU_KM,
    r2AU: outer / AU_KM,
  }
}

/**
 * Generate points along a Hohmann transfer ellipse for 3D visualization.
 * Returns points in AU that can be scaled to scene units.
 */
export function getHohmannPath(
  r1AU: number,
  r2AU: number,
  segments = 64,
): [number, number, number][] {
  const inner = Math.min(r1AU, r2AU)
  const outer = Math.max(r1AU, r2AU)
  const a = (inner + outer) / 2
  const e = (outer - inner) / (outer + inner)

  const points: [number, number, number][] = []

  // Only draw the half-ellipse (the transfer arc)
  for (let i = 0; i <= segments; i++) {
    const v = (i / segments) * Math.PI  // 0 to π (half orbit)
    const r = a * (1 - e * e) / (1 + e * Math.cos(v))
    const x = r * Math.cos(v)
    const z = r * Math.sin(v)
    points.push([x, 0, z])
  }

  return points
}
