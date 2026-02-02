/**
 * URL state encoding/decoding for shareable views.
 * Encodes simulation state into the URL hash so users can share specific moments.
 */

export interface URLState {
  speed?: number
  paused?: boolean
  days?: number
  target?: string | null
  selected?: string | null
  scale?: 'realistic' | 'exaggerated'
  orbits?: boolean
  labels?: boolean
  belt?: boolean
  comets?: boolean
  tour?: string // tour preset name
}

/**
 * Encode simulation state into URL hash parameters.
 */
export function encodeURLState(state: URLState): string {
  const params = new URLSearchParams()

  if (state.speed !== undefined && state.speed !== 1) params.set('spd', String(state.speed))
  if (state.paused) params.set('p', '1')
  if (state.days !== undefined && state.days > 0) params.set('d', String(Math.round(state.days)))
  if (state.target) params.set('t', state.target)
  if (state.selected) params.set('s', state.selected)
  if (state.scale === 'realistic') params.set('sc', 'r')
  if (state.orbits === false) params.set('o', '0')
  if (state.labels === false) params.set('l', '0')
  if (state.belt === false) params.set('b', '0')
  if (state.comets === false) params.set('c', '0')
  if (state.tour) params.set('tour', state.tour)

  const str = params.toString()
  return str ? `#${str}` : ''
}

/**
 * Decode URL hash into simulation state.
 */
export function decodeURLState(hash: string): URLState {
  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash
  if (!cleaned) return {}

  const params = new URLSearchParams(cleaned)
  const state: URLState = {}

  const spd = params.get('spd')
  if (spd) state.speed = Number(spd)

  if (params.get('p') === '1') state.paused = true

  const days = params.get('d')
  if (days) state.days = Number(days)

  const target = params.get('t')
  if (target) state.target = target

  const selected = params.get('s')
  if (selected) state.selected = selected

  if (params.get('sc') === 'r') state.scale = 'realistic'

  if (params.get('o') === '0') state.orbits = false
  if (params.get('l') === '0') state.labels = false
  if (params.get('b') === '0') state.belt = false
  if (params.get('c') === '0') state.comets = false

  const tour = params.get('tour')
  if (tour) state.tour = tour

  return state
}

/**
 * Update browser URL hash without triggering navigation.
 */
export function updateURLHash(state: URLState): void {
  const hash = encodeURLState(state)
  const newUrl = window.location.pathname + window.location.search + hash
  window.history.replaceState(null, '', newUrl)
}
