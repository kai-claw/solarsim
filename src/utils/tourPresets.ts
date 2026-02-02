/**
 * Cinematic tour presets — curated "wow moments" that showcase
 * the simulation's best features.
 */

export interface TourStop {
  name: string
  description: string
  icon: string
  target: string | null   // camera target planet/null for free
  speed: number            // sim speed
  durationMs: number       // how long to stay at this stop
  days?: number            // jump to this elapsed day count
  showComets?: boolean
  showBelt?: boolean
}

export interface TourPreset {
  id: string
  name: string
  icon: string
  description: string
  stops: TourStop[]
}

export const TOUR_PRESETS: TourPreset[] = [
  {
    id: 'grand-tour',
    name: 'Grand Tour',
    icon: '🚀',
    description: 'Fly past every planet from Mercury to Neptune',
    stops: [
      { name: 'The Sun', description: 'Our star — the heart of the Solar System', icon: '☀️', target: null, speed: 1, durationMs: 4000 },
      { name: 'Mercury', description: 'Closest to the Sun, scarred by craters', icon: '🪨', target: 'Mercury', speed: 50, durationMs: 4000 },
      { name: 'Venus', description: "Earth's scorching twin", icon: '🌋', target: 'Venus', speed: 50, durationMs: 4000 },
      { name: 'Earth', description: 'Our pale blue dot', icon: '🌍', target: 'Earth', speed: 50, durationMs: 4000 },
      { name: 'Mars', description: 'The Red Planet', icon: '🔴', target: 'Mars', speed: 100, durationMs: 4000 },
      { name: 'Jupiter', description: 'King of the planets', icon: '🟠', target: 'Jupiter', speed: 500, durationMs: 4000 },
      { name: 'Saturn', description: 'The jewel of the Solar System', icon: '💍', target: 'Saturn', speed: 1000, durationMs: 5000 },
      { name: 'Uranus', description: 'The sideways ice giant', icon: '🧊', target: 'Uranus', speed: 5000, durationMs: 4000 },
      { name: 'Neptune', description: 'The windiest world', icon: '💨', target: 'Neptune', speed: 5000, durationMs: 4000 },
    ],
  },
  {
    id: 'earth-mars',
    name: 'Earth to Mars',
    icon: '🛸',
    description: 'Watch the Hohmann transfer window between Earth and Mars',
    stops: [
      { name: 'Departure', description: 'View from Earth orbit', icon: '🌍', target: 'Earth', speed: 10, durationMs: 4000 },
      { name: 'The Journey', description: 'Watch the inner solar system', icon: '🚀', target: null, speed: 100, durationMs: 6000 },
      { name: 'Arrival', description: 'Approaching Mars', icon: '🔴', target: 'Mars', speed: 50, durationMs: 5000 },
    ],
  },
  {
    id: 'comet-watch',
    name: 'Comet Watch',
    icon: '☄️',
    description: "Follow Encke's short-period orbit and watch its tail grow near the Sun",
    stops: [
      { name: 'Overview', description: 'The inner solar system with comets', icon: '🌌', target: null, speed: 50, durationMs: 4000, showComets: true },
      { name: "Encke's Orbit", description: 'The shortest-period comet (3.3 years)', icon: '☄️', target: null, speed: 500, durationMs: 8000, showComets: true },
      { name: 'Asteroid Belt', description: 'Thousands of rocky fragments between Mars and Jupiter', icon: '🪨', target: null, speed: 100, durationMs: 5000, showBelt: true },
    ],
  },
  {
    id: 'speed-of-light',
    name: 'Sense of Scale',
    icon: '📏',
    description: 'Appreciate the vast distances — from Mercury to Neptune',
    stops: [
      { name: 'Inner Worlds', description: 'Rocky planets huddle close to the Sun', icon: '🪨', target: 'Earth', speed: 10, durationMs: 5000 },
      { name: 'The Gap', description: 'The vast gulf between Mars and Jupiter', icon: '🌌', target: null, speed: 100, durationMs: 5000 },
      { name: 'Outer Giants', description: 'Gas and ice giants roam the distant reaches', icon: '🪐', target: 'Saturn', speed: 1000, durationMs: 5000 },
      { name: 'The Edge', description: "Neptune's lonely orbit at 30 AU from the Sun", icon: '💫', target: 'Neptune', speed: 5000, durationMs: 5000 },
    ],
  },
]

/**
 * Get a tour preset by ID.
 */
export function getTourPreset(id: string): TourPreset | undefined {
  return TOUR_PRESETS.find((t) => t.id === id)
}
