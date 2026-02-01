import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PLANETS } from '../data/planets'
import { getPlanetPosition, checkEclipseAlignment } from '../utils/orbital'
import { useStore } from '../store/store'

function getDistance(distMkm: number, scaleMode: string): number {
  const au = distMkm / 149.6
  if (scaleMode === 'realistic') return au
  return 2 + Math.pow(au, 0.55) * 4
}

export function EclipseDetector() {
  const scaleMode = useStore((s) => s.scaleMode)
  const elapsedDays = useStore((s) => s.elapsedDays)
  const showEclipses = useStore((s) => s.showEclipses)
  const addEclipseEvent = useStore((s) => s.addEclipseEvent)
  const lastCheckRef = useRef(0)

  useFrame(() => {
    if (!showEclipses) return
    // Check every 10 days of sim time
    if (Math.abs(elapsedDays - lastCheckRef.current) < 10) return
    lastCheckRef.current = elapsedDays

    const positions = PLANETS.map((p) => ({
      name: p.name,
      pos: getPlanetPosition(
        getDistance(p.distanceFromSun, scaleMode),
        p.eccentricity,
        p.inclination,
        p.meanAnomaly,
        p.orbitalPeriod,
        elapsedDays,
      ),
    }))

    // Check all pairs for alignment
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const alignment = checkEclipseAlignment(
          positions[i].pos,
          positions[j].pos,
          0.08,
        )
        if (alignment > 0.3) {
          addEclipseEvent({
            time: elapsedDays,
            innerPlanet: positions[i].name,
            outerPlanet: positions[j].name,
            alignment,
          })
        }
      }
    }
  })

  // Suppress unused var warnings
  useEffect(() => {}, [scaleMode, elapsedDays, showEclipses, addEclipseEvent])

  return null
}
