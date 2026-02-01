import { useFrame } from '@react-three/fiber'
import { useStore } from '../store/store'

export function SimLoop() {
  const paused = useStore((s) => s.paused)
  const speed = useStore((s) => s.speed)
  const advanceTime = useStore((s) => s.advanceTime)

  useFrame((_, delta) => {
    if (paused) return
    // delta is in seconds, convert to days with speed multiplier
    // At 60fps, delta ≈ 0.0167s. 1x speed = 1 day/second
    const daysDelta = delta * speed
    advanceTime(daysDelta)
  })

  return null
}
