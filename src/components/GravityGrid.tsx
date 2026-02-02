/**
 * GravityGrid — Spacetime curvature visualization.
 *
 * Renders a grid plane that warps downward around massive objects,
 * creating the classic "rubber sheet" spacetime curvature diagram.
 * The Sun creates a deep well, planets create smaller dips.
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PLANETS } from '../data/planets'
import { getPlanetPosition } from '../utils/orbital'
import { getDistance } from '../utils/scale'
import { useStore } from '../store/store'

/** Grid resolution */
const GRID_SIZE = 80
const GRID_EXTENT = 35 // scene units each side

/** Gravitational well depth multipliers (visual, not physical) */
const SUN_WELL_DEPTH = 4.0
const SUN_WELL_RADIUS = 8.0
const PLANET_WELL_BASE = 0.6

/** Per-planet visual gravity strength (relative to mass) */
const PLANET_GRAVITY: Record<string, number> = {
  Mercury: 0.15,
  Venus: 0.3,
  Earth: 0.35,
  Mars: 0.2,
  Jupiter: 2.5,
  Saturn: 1.8,
  Uranus: 0.8,
  Neptune: 0.8,
}

/** Custom shader material for the gravity grid */
const gridVertexShader = `
  attribute float displacement;
  varying float vDisp;
  varying vec2 vUv;

  void main() {
    vDisp = displacement;
    vUv = uv;
    vec3 pos = position;
    pos.y += displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const gridFragmentShader = `
  varying float vDisp;
  varying vec2 vUv;

  void main() {
    // Grid lines
    float gridFreq = 40.0;
    vec2 grid = abs(fract(vUv * gridFreq - 0.5) - 0.5);
    float line = min(grid.x, grid.y);
    float gridLine = 1.0 - smoothstep(0.0, 0.04, line);

    // Depth-based color: blue → cyan → white at deep wells
    float depth = clamp(-vDisp / 4.0, 0.0, 1.0);
    vec3 baseColor = mix(
      vec3(0.05, 0.15, 0.4),   // quiet blue
      vec3(0.0, 0.8, 1.0),      // bright cyan at wells
      depth
    );

    // White-hot at deepest points (Sun)
    baseColor = mix(baseColor, vec3(1.0, 0.95, 0.8), smoothstep(0.7, 1.0, depth));

    // Grid line intensity increases near wells
    float lineIntensity = mix(0.15, 0.9, depth);
    float alpha = gridLine * lineIntensity + (1.0 - gridLine) * depth * 0.05;

    // Fade out at edges
    vec2 edge = smoothstep(0.0, 0.08, vUv) * smoothstep(0.0, 0.08, 1.0 - vUv);
    float edgeFade = edge.x * edge.y;

    gl_FragColor = vec4(baseColor, alpha * edgeFade);
  }
`

export function GravityGrid() {
  const meshRef = useRef<THREE.Mesh>(null)
  const showGravityGrid = useStore((s) => s.showGravityGrid)
  const scaleMode = useStore((s) => s.scaleMode)
  const elapsedDays = useStore((s) => s.elapsedDays)

  // Create geometry with displacement attribute
  const { geometry, displacementAttr } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      GRID_EXTENT * 2,
      GRID_EXTENT * 2,
      GRID_SIZE,
      GRID_SIZE,
    )
    // Rotate to XZ plane
    geo.rotateX(-Math.PI / 2)

    const count = geo.attributes.position.count
    const disp = new Float32Array(count)
    const attr = new THREE.BufferAttribute(disp, 1)
    geo.setAttribute('displacement', attr)

    return { geometry: geo, displacementAttr: attr }
  }, [])

  // Shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: gridVertexShader,
      fragmentShader: gridFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  // Dispose Three.js resources on unmount
  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  // Smooth fade for visibility
  const opacityRef = useRef(0)

  useFrame(() => {
    if (!meshRef.current) return

    // Animate opacity
    const targetOpacity = showGravityGrid ? 1 : 0
    opacityRef.current += (targetOpacity - opacityRef.current) * 0.08
    meshRef.current.visible = opacityRef.current > 0.01

    if (!meshRef.current.visible) return

    material.uniforms = material.uniforms || {}

    const positions = geometry.attributes.position
    const displacement = displacementAttr.array as Float32Array

    // Get planet positions
    const planetPositions = PLANETS.map((p) => {
      const dist = getDistance(p.distanceFromSun, scaleMode)
      const pos = getPlanetPosition(
        dist,
        p.eccentricity,
        p.inclination,
        p.meanAnomaly,
        p.orbitalPeriod,
        elapsedDays,
      )
      return {
        x: pos[0],
        z: pos[2],
        strength: PLANET_GRAVITY[p.name] || 0.3,
      }
    })

    // Update displacement for each vertex
    for (let i = 0; i < positions.count; i++) {
      const vx = positions.getX(i)
      const vz = positions.getZ(i)

      // Sun well (center)
      const sunDist = Math.sqrt(vx * vx + vz * vz)
      let disp = -SUN_WELL_DEPTH / (1 + sunDist / SUN_WELL_RADIUS)

      // Planet wells
      for (const planet of planetPositions) {
        const dx = vx - planet.x
        const dz = vz - planet.z
        const pDist = Math.sqrt(dx * dx + dz * dz)
        disp -= (PLANET_WELL_BASE * planet.strength) / (1 + pDist * 3)
      }

      displacement[i] = disp * opacityRef.current
    }

    displacementAttr.needsUpdate = true
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, -1.5, 0]}
      visible={false}
    />
  )
}
