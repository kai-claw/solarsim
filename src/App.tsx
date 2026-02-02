import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sun } from './components/Sun'
import { Planet } from './components/Planet'
import { Comet } from './components/Comet'
import { AsteroidBelt } from './components/AsteroidBelt'
import { Starfield } from './components/Starfield'
import { CameraController } from './components/CameraController'
import { EclipseDetector } from './components/EclipseDetector'
import { MissionTrajectory } from './components/MissionTrajectory'
import { SimLoop } from './components/SimLoop'
import { TimeControls } from './components/TimeControls'
import { ControlPanel } from './components/ControlPanel'
import { PlanetInfoCard } from './components/PlanetInfoCard'
import { EclipseLog } from './components/EclipseLog'
import { MissionPlanner } from './components/MissionPlanner'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { CinematicTour } from './components/CinematicTour'
import { URLStateSync } from './components/URLStateSync'
import { PLANETS } from './data/planets'
import { COMETS } from './data/comets'

export default function App() {
  const [tourOpen, setTourOpen] = useState(false)

  const handleTourToggle = useCallback(() => {
    setTourOpen((v) => !v)
  }, [])

  const handleTourClose = useCallback(() => {
    setTourOpen(false)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 12, 20], fov: 60, near: 0.01, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#000' }}
      >
        <color attach="background" args={['#000005']} />
        <ambientLight intensity={0.08} />

        <SimLoop />
        <CameraController />
        <Starfield />
        <Sun />
        {PLANETS.map((planet) => (
          <Planet key={planet.name} data={planet} />
        ))}
        {COMETS.map((comet) => (
          <Comet key={comet.name} data={comet} />
        ))}
        <AsteroidBelt />
        <EclipseDetector />
        <MissionTrajectory />
      </Canvas>

      {/* UI Overlays */}
      <ControlPanel />
      <TimeControls />
      <PlanetInfoCard />
      <EclipseLog />
      <MissionPlanner />
      <CinematicTour externalOpen={tourOpen} onClose={handleTourClose} />
      <KeyboardShortcuts onTourToggle={handleTourToggle} />
      <URLStateSync />
    </div>
  )
}
