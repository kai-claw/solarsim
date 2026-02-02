import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { CometData } from '../data/comets'
import { solveKepler, trueAnomaly, orbitalRadius, getOrbitPath } from '../utils/orbital'
import { getDistanceAU } from '../utils/scale'
import { useStore } from '../store/store'

const TWO_PI = 2 * Math.PI
const DEG_TO_RAD = Math.PI / 180

interface CometProps {
  data: CometData
}

/**
 * Get comet position using its AU-based orbital elements.
 * Returns position in scene units.
 */
function getCometPosition(
  semiMajorAU: number,
  e: number,
  inclination: number,
  meanAnomalyDeg: number,
  orbitalPeriodDays: number,
  elapsedDays: number,
  scaleMode: string,
): { pos: [number, number, number]; distToSun: number; trueAnom: number } {
  if (orbitalPeriodDays <= 0) return { pos: [semiMajorAU, 0, 0], distToSun: semiMajorAU, trueAnom: 0 }

  const n = TWO_PI / orbitalPeriodDays
  const M = (meanAnomalyDeg * DEG_TO_RAD) + n * elapsedDays
  const E = solveKepler(M, e)
  const v = trueAnomaly(E, e)
  const rAU = orbitalRadius(semiMajorAU, e, v)

  // Convert AU distance to scene units via the scale system
  const sceneR = getDistanceAU(rAU, scaleMode)

  const incRad = inclination * DEG_TO_RAD
  const x = sceneR * Math.cos(v)
  const y = sceneR * Math.sin(v) * Math.cos(incRad)
  const z = sceneR * Math.sin(v) * Math.sin(incRad)

  return { pos: [x, y, z], distToSun: rAU, trueAnom: v }
}

export function Comet({ data }: CometProps) {
  const groupRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Mesh>(null)
  const cometDataRef = useRef({ distToSun: 1, trueAnom: 0 })

  const scaleMode = useStore((s) => s.scaleMode)
  const elapsedDays = useStore((s) => s.elapsedDays)
  const showOrbits = useStore((s) => s.showOrbits)
  const showLabels = useStore((s) => s.showLabels)
  const showComets = useStore((s) => s.showComets)

  // Generate orbit path — clamp to visible region
  const orbitPoints = useMemo(() => {
    // For highly elliptical orbits, generate the path in AU then convert
    const pts = getOrbitPath(data.semiMajorAxisAU, data.eccentricity, data.inclination, 256)
    return pts.map(([px, py, pz]) => {
      const rAU = Math.sqrt(px * px + py * py + pz * pz)
      if (rAU < 1e-12) return [0, 0, 0] as [number, number, number]
      const sceneR = getDistanceAU(rAU, scaleMode)
      const scale = sceneR / rAU
      return [px * scale, py * scale, pz * scale] as [number, number, number]
    })
  }, [data.semiMajorAxisAU, data.eccentricity, data.inclination, scaleMode])

  useFrame(() => {
    if (!groupRef.current || !showComets) return

    const result = getCometPosition(
      data.semiMajorAxisAU,
      data.eccentricity,
      data.inclination,
      data.meanAnomalyDeg,
      data.orbitalPeriodDays,
      elapsedDays,
      scaleMode,
    )

    groupRef.current.position.set(result.pos[0], result.pos[1], result.pos[2])
    cometDataRef.current = { distToSun: result.distToSun, trueAnom: result.trueAnom }

    // Tail: always points away from Sun, length inversely proportional to distance
    if (tailRef.current) {
      const dist = Math.max(result.distToSun, 0.1)
      // Tail is longer and brighter near perihelion
      const tailLength = Math.min(0.8, 0.15 / (dist * dist)) * getDistanceAU(1, scaleMode)
      tailRef.current.scale.set(1, 1, tailLength)

      // Point tail away from sun (away from origin)
      const px = result.pos[0]
      const py = result.pos[1]
      const pz = result.pos[2]
      const d = Math.sqrt(px * px + py * py + pz * pz) || 1
      tailRef.current.lookAt(
        result.pos[0] + (px / d) * 5,
        result.pos[1] + (py / d) * 5,
        result.pos[2] + (pz / d) * 5,
      )

      // Tail opacity based on distance to sun
      const mat = tailRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = Math.min(0.8, 0.3 / dist)
    }
  })

  if (!showComets) return null

  const cometRadius = 0.03

  return (
    <>
      {/* Orbit path */}
      {showOrbits && (
        <Line
          points={orbitPoints}
          color={data.tailColor}
          lineWidth={1}
          transparent
          opacity={0.15}
        />
      )}

      <group ref={groupRef}>
        {/* Comet nucleus */}
        <mesh>
          <sphereGeometry args={[cometRadius, 16, 16]} />
          <meshBasicMaterial color={data.color} />
        </mesh>

        {/* Coma (glowing halo) */}
        <mesh>
          <sphereGeometry args={[cometRadius * 3, 16, 16]} />
          <meshBasicMaterial
            color={data.tailColor}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>

        {/* Ion tail (cone pointing away from Sun) */}
        <mesh ref={tailRef}>
          <coneGeometry args={[cometRadius * 2, 1, 8, 1, true]} />
          <meshBasicMaterial
            color={data.tailColor}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Label */}
        {showLabels && (
          <Html
            position={[0, cometRadius + 0.1, 0]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div style={{
              color: data.tailColor,
              fontSize: '10px',
              fontWeight: 600,
              textShadow: '0 0 8px rgba(0,0,0,0.8)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              opacity: 0.85,
            }}>
              ☄️ {data.name}
            </div>
          </Html>
        )}
      </group>
    </>
  )
}
