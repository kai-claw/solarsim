import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/store'

const ASTEROID_COUNT = 3000
const BELT_INNER_REAL = 2.2 // AU
const BELT_OUTER_REAL = 3.2 // AU

function getDistance(au: number, scaleMode: string): number {
  if (scaleMode === 'realistic') return au
  return 2 + Math.pow(au, 0.55) * 4
}

export function AsteroidBelt() {
  const pointsRef = useRef<THREE.Points>(null)
  const scaleMode = useStore((s) => s.scaleMode)
  const showAsteroidBelt = useStore((s) => s.showAsteroidBelt)
  const elapsedDays = useStore((s) => s.elapsedDays)

  const innerR = getDistance(BELT_INNER_REAL, scaleMode)
  const outerR = getDistance(BELT_OUTER_REAL, scaleMode)

  const { geometry, speeds, angles } = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(ASTEROID_COUNT * 3)
    const spd = new Float32Array(ASTEROID_COUNT)
    const ang = new Float32Array(ASTEROID_COUNT)

    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const r = innerR + Math.random() * (outerR - innerR)
      const angle = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 0.3

      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = Math.sin(angle) * r

      // Kepler's 3rd law: period ∝ a^(3/2)
      spd[i] = 0.001 / Math.pow(r, 1.5)
      ang[i] = angle
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return { geometry: geo, speeds: spd, angles: ang }
  }, [innerR, outerR])

  useFrame(() => {
    if (!pointsRef.current || !showAsteroidBelt) return
    const posAttr = pointsRef.current.geometry.getAttribute('position')
    const posArray = posAttr.array as Float32Array

    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const r = Math.sqrt(posArray[i * 3] ** 2 + posArray[i * 3 + 2] ** 2)
      const newAngle = angles[i] + speeds[i] * elapsedDays
      posArray[i * 3] = Math.cos(newAngle) * r
      posArray[i * 3 + 2] = Math.sin(newAngle) * r
    }

    posAttr.needsUpdate = true
  })

  if (!showAsteroidBelt) return null

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#8B7355"
        size={0.02}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
