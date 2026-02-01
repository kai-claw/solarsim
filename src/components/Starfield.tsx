import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STAR_COUNT = 5000
const STAR_SPREAD = 300

export function Starfield() {
  const pointsRef = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(STAR_COUNT * 3)
    const colors = new Float32Array(STAR_COUNT * 3)

    const starColors = [
      new THREE.Color('#FFFFFF'),
      new THREE.Color('#FFE4C4'),
      new THREE.Color('#ADD8E6'),
      new THREE.Color('#FFFACD'),
    ]

    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * STAR_SPREAD
      positions[i * 3 + 1] = (Math.random() - 0.5) * STAR_SPREAD
      positions[i * 3 + 2] = (Math.random() - 0.5) * STAR_SPREAD

      const col = starColors[Math.floor(Math.random() * starColors.length)]
      colors[i * 3] = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    return geo
  }, [])

  // Slow rotation for parallax
  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.002
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.12}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
