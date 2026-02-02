import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* Two-layer starfield for parallax depth:
   - Near layer: fewer, brighter, larger stars with subtle twinkle
   - Far layer: dense, tiny pinpoints — deep-space background */

const NEAR_STARS = 2000
const FAR_STARS = 6000
const NEAR_SPREAD = 200
const FAR_SPREAD = 400

function createStarLayer(count: number, spread: number, sizeBase: number) {
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  const starColors = [
    new THREE.Color('#FFFFFF'),
    new THREE.Color('#FFE4C4'),  // warm white
    new THREE.Color('#B8C8FF'),  // blue-white
    new THREE.Color('#FFFACD'),  // pale yellow
    new THREE.Color('#FFD2A1'),  // warm orange
  ]

  for (let i = 0; i < count; i++) {
    // Spherical distribution for even sky coverage
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = spread * (0.6 + Math.random() * 0.4)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)

    const col = starColors[Math.floor(Math.random() * starColors.length)]
    colors[i * 3] = col.r
    colors[i * 3 + 1] = col.g
    colors[i * 3 + 2] = col.b

    // Size variation — most are small, a few are bright
    sizes[i] = sizeBase * (0.3 + Math.random() * 0.7 + (Math.random() > 0.95 ? 1.5 : 0))
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  return geo
}

export function Starfield() {
  const nearRef = useRef<THREE.Points>(null)
  const farRef = useRef<THREE.Points>(null)

  const nearGeo = useMemo(() => createStarLayer(NEAR_STARS, NEAR_SPREAD, 0.18), [])
  const farGeo = useMemo(() => createStarLayer(FAR_STARS, FAR_SPREAD, 0.08), [])

  // Subtle twinkling via opacity modulation + slow rotation
  useFrame((state, delta) => {
    if (nearRef.current) {
      nearRef.current.rotation.y += delta * 0.003
      nearRef.current.rotation.x += delta * 0.0005
      // Gentle opacity twinkle
      const mat = nearRef.current.material as THREE.PointsMaterial
      mat.opacity = 0.75 + Math.sin(state.clock.elapsedTime * 0.3) * 0.08
    }
    if (farRef.current) {
      farRef.current.rotation.y += delta * 0.001
    }
  })

  return (
    <>
      {/* Near stars — brighter, parallax */}
      <points ref={nearRef} geometry={nearGeo}>
        <pointsMaterial
          vertexColors
          size={0.18}
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Far stars — dense, tiny, nearly static */}
      <points ref={farRef} geometry={farGeo}>
        <pointsMaterial
          vertexColors
          size={0.06}
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  )
}
