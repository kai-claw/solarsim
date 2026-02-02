import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { PLANETS } from '../data/planets'
import { getPlanetPosition } from '../utils/orbital'
import { getDistance } from '../utils/scale'
import { useStore } from '../store/store'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()
  const cameraTarget = useStore((s) => s.cameraTarget)
  const elapsedDays = useStore((s) => s.elapsedDays)
  const scaleMode = useStore((s) => s.scaleMode)

  // Track whether we're transitioning to a new target
  const prevTarget = useRef<string | null>(null)
  const transitionProgress = useRef(1)

  useEffect(() => {
    if (!cameraTarget && controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0)
    }
    // Reset transition on target change for cinematic feel
    if (cameraTarget !== prevTarget.current) {
      transitionProgress.current = 0
      prevTarget.current = cameraTarget
    }
  }, [cameraTarget])

  useFrame((_, delta) => {
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

    // Smooth ease-in-out: starts slow, accelerates, then decelerates
    transitionProgress.current = Math.min(1, transitionProgress.current + delta * 0.7)
    const t = transitionProgress.current
    // Quintic ease-out for buttery cinematic camera motion
    const ease = t < 1 ? 1 - Math.pow(1 - t, 3) : 1
    const lerpFactor = 0.015 + ease * 0.065

    controlsRef.current.target.lerp(targetVec, lerpFactor)

    // Move camera to follow with weighted feel
    const camOffset = new THREE.Vector3(1, 0.5, 1).normalize().multiplyScalar(2)
    const desiredCamPos = targetVec.clone().add(camOffset)
    camera.position.lerp(desiredCamPos, lerpFactor * 0.7)
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
      zoomSpeed={0.6}
      rotateSpeed={0.5}
    />
  )
}
