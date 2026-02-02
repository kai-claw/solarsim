import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Ring, Line } from '@react-three/drei'
import * as THREE from 'three'
import type { PlanetData } from '../data/planets'
import { getPlanetPosition, getOrbitPath } from '../utils/orbital'
import { getDistance, getExaggeratedRadius, getRealisticRadius } from '../utils/scale'
import { useStore } from '../store/store'

interface PlanetProps {
  data: PlanetData
}

export function Planet({ data }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  const scaleMode = useStore((s) => s.scaleMode)
  const elapsedDays = useStore((s) => s.elapsedDays)
  const showOrbits = useStore((s) => s.showOrbits)
  const showLabels = useStore((s) => s.showLabels)
  const selectedPlanet = useStore((s) => s.selectedPlanet)
  const setSelectedPlanet = useStore((s) => s.setSelectedPlanet)
  const cameraTarget = useStore((s) => s.cameraTarget)

  const isSelected = selectedPlanet === data.name
  const isFollowed = cameraTarget === data.name

  const radius = scaleMode === 'exaggerated'
    ? getExaggeratedRadius(data.radius)
    : getRealisticRadius(data.radius)

  const distance = getDistance(data.distanceFromSun, scaleMode)

  // Orbit path points for drei <Line>
  const orbitPoints = useMemo(() => {
    const a = distance
    return getOrbitPath(a, data.eccentricity, data.inclination)
  }, [distance, data.eccentricity, data.inclination])

  const handleClick = useCallback((e: THREE.Event) => {
    if (e && typeof e === 'object' && 'stopPropagation' in e) {
      (e as { stopPropagation: () => void }).stopPropagation()
    }
    setSelectedPlanet(isSelected ? null : data.name)
  }, [data.name, isSelected, setSelectedPlanet])

  // Update position each frame
  useFrame(() => {
    if (!groupRef.current) return

    const pos = getPlanetPosition(
      distance,
      data.eccentricity,
      data.inclination,
      data.meanAnomaly,
      data.orbitalPeriod,
      elapsedDays,
    )

    groupRef.current.position.set(pos[0], pos[1], pos[2])

    if (meshRef.current) {
      const rotSpeed = (2 * Math.PI) / (Math.abs(data.rotationPeriod) * 3600)
      meshRef.current.rotation.y += rotSpeed * 100 * (data.rotationPeriod < 0 ? -1 : 1)
    }
  })

  const planetColor = new THREE.Color(data.color)

  return (
    <>
      {/* Orbit line using drei Line */}
      {showOrbits && (
        <Line
          points={orbitPoints}
          color={data.color}
          lineWidth={1}
          transparent
          opacity={isFollowed ? 0.6 : 0.2}
        />
      )}

      {/* Planet group */}
      <group ref={groupRef}>
        {/* Planet sphere */}
        <mesh ref={meshRef} onClick={handleClick}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            color={planetColor}
            roughness={0.7}
            metalness={0.1}
            emissive={planetColor}
            emissiveIntensity={0.1}
          />
        </mesh>

        {/* Selection ring */}
        {isSelected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.5, radius * 1.7, 64]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Planet rings (Saturn, etc.) — multi-band for realism */}
        {data.hasRings && data.ringInner && data.ringOuter && (
          <group rotation={[Math.PI / 2.5, 0, 0]}>
            {/* Main ring bands with varying opacity for gap effect */}
            {data.name === 'Saturn' ? (
              <>
                {/* C Ring (inner, faint) */}
                <Ring args={[radius * 1.3, radius * 1.55, 64]}>
                  <meshBasicMaterial color="#8B7355" transparent opacity={0.2} side={THREE.DoubleSide} />
                </Ring>
                {/* B Ring (brightest) */}
                <Ring args={[radius * 1.6, radius * 2.2, 64]}>
                  <meshBasicMaterial color="#D4B896" transparent opacity={0.65} side={THREE.DoubleSide} />
                </Ring>
                {/* Cassini Division (gap — very faint) */}
                <Ring args={[radius * 2.2, radius * 2.35, 64]}>
                  <meshBasicMaterial color="#3a3020" transparent opacity={0.08} side={THREE.DoubleSide} />
                </Ring>
                {/* A Ring (outer, moderately bright) */}
                <Ring args={[radius * 2.35, radius * 3.0, 64]}>
                  <meshBasicMaterial color="#C4A882" transparent opacity={0.5} side={THREE.DoubleSide} />
                </Ring>
                {/* F Ring (thin outer) */}
                <Ring args={[radius * 3.1, radius * 3.2, 64]}>
                  <meshBasicMaterial color="#A09070" transparent opacity={0.25} side={THREE.DoubleSide} />
                </Ring>
              </>
            ) : (
              <Ring args={[radius * data.ringInner, radius * data.ringOuter, 64]}>
                <meshBasicMaterial
                  color={data.ringColor || '#C4A882'}
                  transparent
                  opacity={0.4}
                  side={THREE.DoubleSide}
                />
              </Ring>
            )}
          </group>
        )}

        {/* Label */}
        {showLabels && (
          <Html
            position={[0, radius + 0.15, 0]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div style={{
              color: data.color,
              fontSize: '11px',
              fontWeight: 600,
              textShadow: '0 0 8px rgba(0,0,0,0.8)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              opacity: 0.9,
            }}>
              {data.name}
            </div>
          </Html>
        )}
      </group>
    </>
  )
}
