/**
 * Shared scale/distance utilities — single source of truth.
 *
 * Previously duplicated in Planet.tsx, CameraController.tsx,
 * AsteroidBelt.tsx, and EclipseDetector.tsx.
 */

import type { ScaleMode } from '../store/store'

/** 1 AU = 1 scene unit */
export const AU = 1

/** Convert km to AU */
export const KM_TO_AU = 1 / 149_597_870.7

/**
 * Convert a distance (in million km) to scene units.
 * In 'realistic' mode returns AU directly.
 * In 'exaggerated' mode applies a compressed power-law so inner planets are visible.
 */
export function getDistance(distMkm: number, scaleMode: ScaleMode | string): number {
  const au = distMkm / 149.6
  if (scaleMode === 'realistic') return au * AU
  return 2 + Math.pow(au, 0.55) * 4
}

/**
 * Overload: accept a value already in AU (used by AsteroidBelt).
 */
export function getDistanceAU(au: number, scaleMode: ScaleMode | string): number {
  if (scaleMode === 'realistic') return au
  return 2 + Math.pow(au, 0.55) * 4
}

/**
 * Planet radius helpers.
 */
export function getExaggeratedRadius(realRadiusKm: number): number {
  const earthRadius = 6371
  const ratio = realRadiusKm / earthRadius
  return 0.06 + Math.log(1 + ratio) * 0.08
}

export function getRealisticRadius(realRadiusKm: number): number {
  return realRadiusKm * KM_TO_AU * 100
}
