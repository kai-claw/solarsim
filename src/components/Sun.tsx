import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/store'

const SUN_REALISTIC_RADIUS = 696340 / 149600000 // AU
const SUN_EXAGGERATED_RADIUS = 0.8

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const outerGlowRef = useRef<THREE.Mesh>(null)
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
        color3: { value: new THREE.Color('#FFEE88') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        // Simplex-style noise for turbulence
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          // Multi-octave turbulence
          float n = noise(vPosition.xy * 6.0 + time * 0.4) * 0.5
                  + noise(vPosition.yz * 12.0 + time * 0.6) * 0.25
                  + noise(vPosition.xz * 24.0 + time * 0.8) * 0.125;

          // Hot spots
          float spots = smoothstep(0.55, 0.7, n);

          vec3 baseColor = mix(color1, color2, n);
          baseColor = mix(baseColor, color3, spots * 0.4);

          // Limb darkening — edges of the sun appear slightly darker/redder
          float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          float limb = pow(rim, 1.5);
          baseColor = mix(baseColor, color2 * 0.8, limb * 0.5);

          // Bright center
          baseColor += (1.0 - rim) * 0.15 * color3;

          gl_FragColor = vec4(baseColor, 1.0);
        }
      `,
    })
  }, [])

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05
    }
    coronaMaterial.uniforms.time.value += delta

    // Gentle breathing glow
    if (glowRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03
      glowRef.current.scale.setScalar(s)
    }
    // Outer corona pulse (slower, larger)
    if (outerGlowRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.4) * 0.04
      outerGlowRef.current.scale.setScalar(s)
    }
  })

  return (
    <group>
      {/* Sun body */}
      <mesh ref={meshRef} material={coronaMaterial} onClick={handleClick}>
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>

      {/* Inner glow — warm bright corona */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.25, 32, 32]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>

      {/* Outer glow — subtle warmth that fills nearby space */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[radius * 2.0, 32, 32]} />
        <meshBasicMaterial color="#FF8C00" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      {/* Volumetric haze — very large, very faint */}
      <mesh>
        <sphereGeometry args={[radius * 4.0, 16, 16]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.015} side={THREE.BackSide} />
      </mesh>

      {/* Warm lighting */}
      <pointLight color="#FFF5E0" intensity={3} distance={200} decay={0.5} />
      <pointLight color="#FDB813" intensity={1.5} distance={100} decay={1} />
      {/* Subtle fill light for ambient warmth */}
      <pointLight color="#FF6B00" intensity={0.3} distance={50} decay={2} />
    </group>
  )
}
