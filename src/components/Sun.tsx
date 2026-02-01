import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/store'

const SUN_REALISTIC_RADIUS = 696340 / 149600000 // AU
const SUN_EXAGGERATED_RADIUS = 0.8

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const scaleMode = useStore((s) => s.scaleMode)
  const selectedPlanet = useStore((s) => s.selectedPlanet)
  const setSelectedPlanet = useStore((s) => s.setSelectedPlanet)

  const handleClick = useCallback((e: THREE.Event) => {
    if (e && typeof e === 'object' && 'stopPropagation' in e) {
      (e as { stopPropagation: () => void }).stopPropagation()
    }
    setSelectedPlanet(selectedPlanet === 'Sun' ? null : 'Sun')
  }, [selectedPlanet, setSelectedPlanet])

  const radius = scaleMode === 'realistic' ? SUN_REALISTIC_RADIUS * 200 : SUN_EXAGGERATED_RADIUS

  const coronaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#FDB813') },
        color2: { value: new THREE.Color('#FF6B00') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float noise = sin(vPosition.x * 10.0 + time) * sin(vPosition.y * 10.0 + time * 0.7) * 0.5 + 0.5;
          vec3 color = mix(color1, color2, noise);
          float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          color += rim * 0.3;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
  }, [])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05
    }
    coronaMaterial.uniforms.time.value += delta
    if (glowRef.current) {
      const s = 1 + Math.sin(Date.now() * 0.001) * 0.02
      glowRef.current.scale.setScalar(s)
    }
  })

  return (
    <group>
      {/* Sun body */}
      <mesh ref={meshRef} material={coronaMaterial} onClick={handleClick}>
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.3, 32, 32]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>
      {/* Point light */}
      <pointLight color="#FFF5E0" intensity={3} distance={200} decay={0.5} />
      <pointLight color="#FDB813" intensity={1.5} distance={100} decay={1} />
    </group>
  )
}
