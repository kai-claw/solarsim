import { create } from 'zustand'

export type ScaleMode = 'realistic' | 'exaggerated'
export type CameraTarget = string | null // planet name or null for free

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

  // Camera
  cameraTarget: CameraTarget
  selectedPlanet: string | null

  // Eclipse events
  eclipseEvents: EclipseEvent[]

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
  setCameraTarget: (target: CameraTarget) => void
  setSelectedPlanet: (name: string | null) => void
  addEclipseEvent: (event: EclipseEvent) => void
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

  cameraTarget: null,
  selectedPlanet: null,

  eclipseEvents: [],

  setPaused: (paused) => set({ paused }),
  togglePaused: () => set((s) => ({ paused: !s.paused })),
  setSpeed: (speed) => set({ speed }),
  advanceTime: (deltaDays) => set((s) => ({ elapsedDays: s.elapsedDays + deltaDays })),
  setScaleMode: (scaleMode) => set({ scaleMode }),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleAsteroidBelt: () => set((s) => ({ showAsteroidBelt: !s.showAsteroidBelt })),
  toggleEclipses: () => set((s) => ({ showEclipses: !s.showEclipses })),
  setCameraTarget: (cameraTarget) => set({ cameraTarget }),
  setSelectedPlanet: (selectedPlanet) => set({ selectedPlanet }),
  addEclipseEvent: (event) => set((s) => ({
    eclipseEvents: [...s.eclipseEvents.slice(-19), event],
  })),
}))
