import { create } from 'zustand'
import type { HohmannResult } from '../utils/hohmann'

export type ScaleMode = 'realistic' | 'exaggerated'
export type CameraTarget = string | null // planet name or null for free

export interface MissionData {
  origin: string
  destination: string
  hohmann: HohmannResult
}

interface SolarSimState {
  // Time
  paused: boolean
  speed: number // multiplier
  elapsedDays: number

  // Display
  scaleMode: ScaleMode
  showOrbits: boolean
  showLabels: boolean
  showAsteroidBelt: boolean
  showEclipses: boolean
  showComets: boolean

  // Camera
  cameraTarget: CameraTarget
  selectedPlanet: string | null

  // Eclipse events
  eclipseEvents: EclipseEvent[]

  // Mission planner
  showMission: MissionData | null

  // Actions
  setPaused: (paused: boolean) => void
  togglePaused: () => void
  setSpeed: (speed: number) => void
  advanceTime: (deltaDays: number) => void
  setScaleMode: (mode: ScaleMode) => void
  toggleOrbits: () => void
  toggleLabels: () => void
  toggleAsteroidBelt: () => void
  toggleEclipses: () => void
  toggleComets: () => void
  setCameraTarget: (target: CameraTarget) => void
  setSelectedPlanet: (name: string | null) => void
  addEclipseEvent: (event: EclipseEvent) => void
  setMission: (mission: MissionData | null) => void
}

export interface EclipseEvent {
  time: number
  innerPlanet: string
  outerPlanet: string
  alignment: number
}

export const useStore = create<SolarSimState>((set) => ({
  paused: false,
  speed: 1,
  elapsedDays: 0,

  scaleMode: 'exaggerated',
  showOrbits: true,
  showLabels: true,
  showAsteroidBelt: true,
  showEclipses: true,
  showComets: true,

  cameraTarget: null,
  selectedPlanet: null,

  eclipseEvents: [],
  showMission: null,

  setPaused: (paused) => set({ paused }),
  togglePaused: () => set((s) => ({ paused: !s.paused })),
  setSpeed: (speed) => set({ speed }),
  advanceTime: (deltaDays) => set((s) => ({ elapsedDays: s.elapsedDays + deltaDays })),
  setScaleMode: (scaleMode) => set({ scaleMode }),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleAsteroidBelt: () => set((s) => ({ showAsteroidBelt: !s.showAsteroidBelt })),
  toggleEclipses: () => set((s) => ({ showEclipses: !s.showEclipses })),
  toggleComets: () => set((s) => ({ showComets: !s.showComets })),
  setCameraTarget: (cameraTarget) => set({ cameraTarget }),
  setSelectedPlanet: (selectedPlanet) => set({ selectedPlanet }),
  addEclipseEvent: (event) => set((s) => ({
    eclipseEvents: [...s.eclipseEvents.slice(-19), event],
  })),
  setMission: (showMission) => set({ showMission }),
}))
