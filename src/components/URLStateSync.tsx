/**
 * Syncs simulation state to/from the URL hash.
 * On mount: reads URL and applies state.
 * On state change: debounced write to URL hash.
 */

import { useEffect, useRef } from 'react'
import { useStore } from '../store/store'
import { decodeURLState, updateURLHash } from '../utils/urlState'

export function URLStateSync() {
  const speed = useStore((s) => s.speed)
  const paused = useStore((s) => s.paused)
  const elapsedDays = useStore((s) => s.elapsedDays)
  const cameraTarget = useStore((s) => s.cameraTarget)
  const selectedPlanet = useStore((s) => s.selectedPlanet)
  const scaleMode = useStore((s) => s.scaleMode)
  const showOrbits = useStore((s) => s.showOrbits)
  const showLabels = useStore((s) => s.showLabels)
  const showAsteroidBelt = useStore((s) => s.showAsteroidBelt)
  const showComets = useStore((s) => s.showComets)
  const showGravityGrid = useStore((s) => s.showGravityGrid)
  const activeEvent = useStore((s) => s.activeEvent)

  const setSpeed = useStore((s) => s.setSpeed)
  const setPaused = useStore((s) => s.setPaused)
  const setCameraTarget = useStore((s) => s.setCameraTarget)
  const setSelectedPlanet = useStore((s) => s.setSelectedPlanet)
  const setScaleMode = useStore((s) => s.setScaleMode)

  const initializedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // On mount: read URL state
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const hash = window.location.hash
    if (!hash) return

    const state = decodeURLState(hash)

    if (state.speed) setSpeed(state.speed)
    if (state.paused) setPaused(true)
    if (state.target) {
      setCameraTarget(state.target)
      setSelectedPlanet(state.target)
    }
    if (state.selected) setSelectedPlanet(state.selected)
    if (state.scale) setScaleMode(state.scale)
    // Note: toggle states use store defaults (true) and URL only encodes "off"
    if (state.orbits === false) useStore.getState().toggleOrbits()
    if (state.labels === false) useStore.getState().toggleLabels()
    if (state.belt === false) useStore.getState().toggleAsteroidBelt()
    if (state.comets === false) useStore.getState().toggleComets()
    if (state.gravity) useStore.getState().toggleGravityGrid()
    if (state.event) useStore.getState().setActiveEvent(state.event)
  }, [setSpeed, setPaused, setCameraTarget, setSelectedPlanet, setScaleMode])

  // Debounced URL update on state changes
  useEffect(() => {
    if (!initializedRef.current) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateURLHash({
        speed,
        paused,
        days: elapsedDays,
        target: cameraTarget,
        selected: selectedPlanet,
        scale: scaleMode,
        orbits: showOrbits,
        labels: showLabels,
        belt: showAsteroidBelt,
        comets: showComets,
        gravity: showGravityGrid,
        event: activeEvent || undefined,
      })
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [speed, paused, elapsedDays, cameraTarget, selectedPlanet, scaleMode, showOrbits, showLabels, showAsteroidBelt, showComets, showGravityGrid, activeEvent])

  return null
}
