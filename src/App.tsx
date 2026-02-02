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
  const [uiReady, setUiReady] = useState(false)

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

  // Cinematic entrance sequence:
  // 1. Scene fades in (0.1s delay → 1.8s transition)
  // 2. Title appears with dramatic tracking animation
  // 3. UI panels slide in with stagger (after 1.2s)
  // 4. Title fades out (at 3.5s)
  useEffect(() => {
    const revealTimer = setTimeout(() => setSceneReady(true), 100)
    const uiTimer = setTimeout(() => setUiReady(true), 1200)
    const titleTimer = setTimeout(() => setShowTitle(false), 3800)
    return () => {
      clearTimeout(revealTimer)
      clearTimeout(uiTimer)
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
        transition: 'opacity 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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

      {/* Cinematic title entrance — first 3.5 seconds */}
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
          transition: 'opacity 0.8s ease',
        }}>
          <div style={{
            fontSize: 44,
            fontWeight: 200,
            color: '#FDB813',
            letterSpacing: 0,
            animation: 'titleEntrance 2.2s cubic-bezier(0.23, 1, 0.32, 1) forwards',
            textShadow: '0 0 60px rgba(253, 184, 19, 0.25), 0 0 120px rgba(253, 184, 19, 0.08)',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}>
            SolarSim
          </div>
          <div style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.35)',
            marginTop: 14,
            letterSpacing: 5,
            textTransform: 'uppercase',
            opacity: 0,
            animation: 'fadeIn 1.4s ease 0.8s forwards',
            fontWeight: 400,
          }}>
            Explore the Solar System
          </div>
          {/* Fade out the title smoothly */}
          <style>{`
            @keyframes titleExit {
              0% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>
          <div style={{
            position: 'absolute',
            inset: 0,
            animation: 'titleExit 1.2s ease 3s forwards',
            pointerEvents: 'none',
          }} />
        </div>
      )}

      {/* Ambient vignette — subtle depth feel */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)',
        zIndex: 50,
      }} />

      {/* UI Overlays — staggered entrance after scene settles */}
      <div style={{
        opacity: uiReady ? 1 : 0,
        transition: 'opacity 0.6s ease',
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
