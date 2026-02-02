import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { useStore } from '../store/store'
import { PLANETS } from '../data/planets'
import { getHohmannPath } from '../utils/hohmann'
import { getDistance } from '../utils/scale'

/**
 * Renders the Hohmann transfer orbit arc in 3D when a mission is active.
 */
export function MissionTrajectory() {
  const mission = useStore((s) => s.showMission)
  const scaleMode = useStore((s) => s.scaleMode)

  const trajectoryPoints = useMemo(() => {
    if (!mission) return null

    const originPlanet = PLANETS.find((p) => p.name === mission.origin)
    const destPlanet = PLANETS.find((p) => p.name === mission.destination)
    if (!originPlanet || !destPlanet) return null

    // Get scene-unit distances for orbits
    const r1Scene = getDistance(originPlanet.distanceFromSun, scaleMode)
    const r2Scene = getDistance(destPlanet.distanceFromSun, scaleMode)

    // Generate transfer ellipse in AU
    const r1AU = originPlanet.distanceFromSun / 149.6
    const r2AU = destPlanet.distanceFromSun / 149.6
    const pathAU = getHohmannPath(r1AU, r2AU, 96)

    // Scale path from AU to scene units
    // We need to map [r1AU -> r1Scene] and [r2AU -> r2Scene]
    return pathAU.map(([px, _py, pz]) => {
      const rAU = Math.sqrt(px * px + pz * pz)
      if (rAU < 1e-12) return [0, 0, 0] as [number, number, number]
      // Interpolate scale factor based on distance
      const t = (rAU - Math.min(r1AU, r2AU)) / (Math.max(r1AU, r2AU) - Math.min(r1AU, r2AU) + 1e-12)
      const rScene = r1Scene + (r2Scene - r1Scene) * t
      const scale = rScene / (r1AU + (r2AU - r1AU) * t + 1e-12)
      return [px * scale, 0, pz * scale] as [number, number, number]
    })
  }, [mission, scaleMode])

  if (!trajectoryPoints || !mission) return null

  return (
    <>
      {/* Transfer orbit arc */}
      <Line
        points={trajectoryPoints}
        color="#00ff88"
        lineWidth={2.5}
        transparent
        opacity={0.8}
      />

      {/* Departure and arrival orbit highlights */}
      {/* These are rendered by the Planet component's existing orbit lines */}
    </>
  )
}
