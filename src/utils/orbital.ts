/**
 * Kepler's equation solver and orbital mechanics utilities
 */

const DEG_TO_RAD = Math.PI / 180
const TWO_PI = 2 * Math.PI

/**
 * Solve Kepler's equation M = E - e*sin(E) using Newton-Raphson iteration
 */
export function solveKepler(M: number, e: number, tolerance = 1e-8, maxIter = 50): number {
  // Normalize M to [0, 2π)
  let Mn = M % TWO_PI
  if (Mn < 0) Mn += TWO_PI

  // Initial guess
  let E = Mn + e * Math.sin(Mn) * (1 + e * Math.cos(Mn))

  for (let i = 0; i < maxIter; i++) {
    const dE = (E - e * Math.sin(E) - Mn) / (1 - e * Math.cos(E))
    E -= dE
    if (Math.abs(dE) < tolerance) break
  }

  return E
}

/**
 * Compute true anomaly from eccentric anomaly
 */
export function trueAnomaly(E: number, e: number): number {
  return 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  )
}

/**
 * Compute radius from semi-major axis, eccentricity, and true anomaly
 */
export function orbitalRadius(a: number, e: number, v: number): number {
  return a * (1 - e * e) / (1 + e * Math.cos(v))
}

/**
 * Get 3D position of a planet at a given time
 * Returns [x, y, z] in AU (or whatever unit `a` is in)
 */
export function getPlanetPosition(
  a: number,           // semi-major axis
  e: number,           // eccentricity
  inclination: number, // degrees
  meanAnomalyDeg: number, // degrees at epoch
  orbitalPeriodDays: number,
  elapsedDays: number,
): [number, number, number] {
  // Mean motion (rad/day)
  const n = TWO_PI / orbitalPeriodDays

  // Mean anomaly at time t
  const M = (meanAnomalyDeg * DEG_TO_RAD) + n * elapsedDays

  // Solve Kepler's equation
  const E = solveKepler(M, e)

  // True anomaly
  const v = trueAnomaly(E, e)

  // Orbital radius
  const r = orbitalRadius(a, e, v)

  // Convert to 3D with inclination
  const incRad = inclination * DEG_TO_RAD
  const x = r * Math.cos(v)
  const y = r * Math.sin(v) * Math.cos(incRad)
  const z = r * Math.sin(v) * Math.sin(incRad)

  return [x, y, z]
}

/**
 * Generate orbit path points for visualization
 */
export function getOrbitPath(
  a: number,
  e: number,
  inclination: number,
  segments = 128,
): [number, number, number][] {
  const points: [number, number, number][] = []
  const incRad = inclination * DEG_TO_RAD

  for (let i = 0; i <= segments; i++) {
    const v = (i / segments) * TWO_PI
    const r = orbitalRadius(a, e, v)
    const x = r * Math.cos(v)
    const y = r * Math.sin(v) * Math.cos(incRad)
    const z = r * Math.sin(v) * Math.sin(incRad)
    points.push([x, y, z])
  }

  return points
}

/**
 * Check for eclipse-like alignment between two planets and the Sun
 * Returns alignment score (0 = no alignment, 1 = perfect alignment)
 */
export function checkEclipseAlignment(
  innerPos: [number, number, number],
  outerPos: [number, number, number],
  threshold = 0.05,
): number {
  // Check if inner planet is roughly between Sun and outer planet
  const innerDist = Math.sqrt(innerPos[0] ** 2 + innerPos[1] ** 2 + innerPos[2] ** 2)
  const outerDist = Math.sqrt(outerPos[0] ** 2 + outerPos[1] ** 2 + outerPos[2] ** 2)

  if (innerDist >= outerDist) return 0

  // Normalize vectors
  const innerNorm: [number, number, number] = [
    innerPos[0] / innerDist,
    innerPos[1] / innerDist,
    innerPos[2] / innerDist,
  ]
  const outerNorm: [number, number, number] = [
    outerPos[0] / outerDist,
    outerPos[1] / outerDist,
    outerPos[2] / outerDist,
  ]

  // Dot product (1 = same direction = alignment)
  const dot = innerNorm[0] * outerNorm[0] + innerNorm[1] * outerNorm[1] + innerNorm[2] * outerNorm[2]
  const angle = Math.acos(Math.min(1, Math.max(-1, dot)))

  if (angle < threshold) {
    return 1 - angle / threshold
  }
  return 0
}
