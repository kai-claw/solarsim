import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { PLANETS } from '../data/planets'
import { getPlanetPosition } from '../utils/orbital'
import { useStore } from '../store/store'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

function getDistance(distMkm: number, scaleMode: string): number {
  const au = distMkm / 149.6
  if (scaleMode === 'realistic') return au
  return 2 + Math.pow(au, 0.55) * 4
}

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()
  const cameraTarget = useStore((s) => s.cameraTarget)
  const elapsedDays = useStore((s) => s.elapsedDays)
  const scaleMode = useStore((s) => s.scaleMode)

  useEffect(() => {
    if (!cameraTarget && controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0)
    }
  }, [cameraTarget])

  useFrame(() => {
    if (!cameraTarget || !controlsRef.current) return

    const planet = PLANETS.find((p) => p.name === cameraTarget)
    if (!planet) return

    const distance = getDistance(planet.distanceFromSun, scaleMode)
    const pos = getPlanetPosition(
      distance,
      planet.eccentricity,
      planet.inclination,
      planet.meanAnomaly,
      planet.orbitalPeriod,
      elapsedDays,
    )

    const targetVec = new THREE.Vector3(pos[0], pos[1], pos[2])
    controlsRef.current.target.lerp(targetVec, 0.05)

    // Move camera to follow
    const camOffset = new THREE.Vector3(1, 0.5, 1).normalize().multiplyScalar(2)
    const desiredCamPos = targetVec.clone().add(camOffset)
    camera.position.lerp(desiredCamPos, 0.03)
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan
      enableZoom
      enableRotate
      minDistance={0.5}
      maxDistance={100}
      dampingFactor={0.05}
      enableDamping
    />
  )
}
