import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sun } from './components/Sun'
import { Planet } from './components/Planet'
import { Comet } from './components/Comet'
import { AsteroidBelt } from './components/AsteroidBelt'
import { Starfield } from './components/Starfield'
import { CameraController } from './components/CameraController'
import { EclipseDetector } from './components/EclipseDetector'
import { MissionTrajectory } from './components/MissionTrajectory'
import { GravityGrid } from './components/GravityGrid'
import { SimLoop } from './components/SimLoop'
import { TimeControls } from './components/TimeControls'
import { ControlPanel } from './components/ControlPanel'
import { PlanetInfoCard } from './components/PlanetInfoCard'
import { EclipseLog } from './components/EclipseLog'
import { MissionPlanner } from './components/MissionPlanner'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { CinematicTour } from './components/CinematicTour'
import { TimeMachine } from './components/TimeMachine'
import { URLStateSync } from './components/URLStateSync'
import { PLANETS } from './data/planets'
import { COMETS } from './data/comets'

export default function App() {
  const [tourOpen, setTourOpen] = useState(false)
  const [timeMachineOpen, setTimeMachineOpen] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [showTitle, setShowTitle] = useState(true)

  const handleTourToggle = useCallback(() => {
    setTourOpen((v) => !v)
  }, [])

  const handleTourClose = useCallback(() => {
    setTourOpen(false)
  }, [])

  const handleTimeMachineToggle = useCallback(() => {
    setTimeMachineOpen((v) => !v)
  }, [])

  const handleTimeMachineClose = useCallback(() => {
    setTimeMachineOpen(false)
  }, [])

  // First 3 seconds: dramatic scene reveal + title
  useEffect(() => {
    const revealTimer = setTimeout(() => setSceneReady(true), 100)
    const titleTimer = setTimeout(() => setShowTitle(false), 3800)
    return () => {
      clearTimeout(revealTimer)
      clearTimeout(titleTimer)
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 3D Canvas with cinematic reveal */}
      <div style={{
        width: '100%',
        height: '100%',
        opacity: sceneReady ? 1 : 0,
        transition: 'opacity 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}>
        <Canvas
          camera={{ position: [0, 12, 20], fov: 60, near: 0.01, far: 1000 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: '#000' }}
        >
          <color attach="background" args={['#000005']} />
          <ambientLight intensity={0.08} />
          <fog attach="fog" args={['#000008', 80, 250]} />

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
          <GravityGrid />
        </Canvas>
      </div>

      {/* Cinematic title entrance — first 3 seconds */}
      {showTitle && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 500,
          opacity: sceneReady ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          <div style={{
            fontSize: 42,
            fontWeight: 200,
            color: '#FDB813',
            letterSpacing: 0,
            animation: 'titleEntrance 2s cubic-bezier(0.23, 1, 0.32, 1) forwards',
            textShadow: '0 0 60px rgba(253, 184, 19, 0.3), 0 0 120px rgba(253, 184, 19, 0.1)',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}>
            SolarSim
          </div>
          <div style={{
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: 12,
            letterSpacing: 4,
            textTransform: 'uppercase',
            opacity: 0,
            animation: 'fadeIn 1.2s ease 1s forwards',
          }}>
            Explore the Solar System
          </div>
          {/* Fade out the title */}
          <style>{`
            @keyframes titleExit {
              0% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>
          <div style={{
            position: 'absolute',
            inset: 0,
            animation: 'titleExit 1s ease 3s forwards',
            pointerEvents: 'none',
          }} />
        </div>
      )}

      {/* Ambient vignette — subtle depth feel */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
        zIndex: 50,
      }} />

      {/* UI Overlays — staggered entrance */}
      <div style={{
        opacity: sceneReady ? 1 : 0,
        transition: 'opacity 0.8s ease 1.5s',
      }}>
        <ControlPanel />
        <TimeControls />
        <PlanetInfoCard />
        <EclipseLog />
        <MissionPlanner />
        <CinematicTour externalOpen={tourOpen} onClose={handleTourClose} />
        <TimeMachine open={timeMachineOpen} onClose={handleTimeMachineClose} />
        <KeyboardShortcuts onTourToggle={handleTourToggle} onTimeMachineToggle={handleTimeMachineToggle} />
        <URLStateSync />
      </div>
    </div>
  )
}
