/**
 * Kepler's equation solver and orbital mechanics utilities
 */

const DEG_TO_RAD = Math.PI / 180
const TWO_PI = 2 * Math.PI

/**
 * Solve Kepler's equation M = E - e*sin(E) using Newton-Raphson iteration.
 *
 * Returns the eccentric anomaly E (radians).
 * If the solver does not converge within `maxIter`, the best approximation
 * is returned (guaranteed finite) rather than silently diverging.
 */
export function solveKepler(M: number, e: number, tolerance = 1e-8, maxIter = 50): number {
  // Guard: eccentricity must be in [0, 1) for elliptical orbits
  const eSafe = Math.min(Math.max(e, 0), 0.9999)

  // Normalize M to [0, 2π)
  let Mn = M % TWO_PI
  if (Mn < 0) Mn += TWO_PI

  // Initial guess (Markley-style for better convergence at high e)
  let E = Mn + eSafe * Math.sin(Mn) * (1 + eSafe * Math.cos(Mn))

  for (let i = 0; i < maxIter; i++) {
    const sinE = Math.sin(E)
    const cosE = Math.cos(E)
    const denom = 1 - eSafe * cosE

    // Protect against division by zero (denom ≈ 0 only if e ≈ 1 and E ≈ 0)
    if (Math.abs(denom) < 1e-12) break

    const dE = (E - eSafe * sinE - Mn) / denom
    E -= dE
    if (Math.abs(dE) < tolerance) break
  }

  return E
}

/**
 * Compute true anomaly from eccentric anomaly
 */
export function trueAnomaly(E: number, e: number): number {
  const eSafe = Math.min(Math.max(e, 0), 0.9999)
  return 2 * Math.atan2(
    Math.sqrt(1 + eSafe) * Math.sin(E / 2),
    Math.sqrt(1 - eSafe) * Math.cos(E / 2)
  )
}

/**
 * Compute radius from semi-major axis, eccentricity, and true anomaly
 */
export function orbitalRadius(a: number, e: number, v: number): number {
  const eSafe = Math.min(Math.max(e, 0), 0.9999)
  const denom = 1 + eSafe * Math.cos(v)
  if (Math.abs(denom) < 1e-12) return a // fallback to semi-major axis
  return a * (1 - eSafe * eSafe) / denom
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
  // Guard: avoid division by zero for zero-period orbits
  if (orbitalPeriodDays <= 0) return [a, 0, 0]

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
  if (innerDist < 1e-12 || outerDist < 1e-12) return 0 // degenerate

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
