/**
 * Famous astronomical events for the Time Machine feature.
 * Dates are stored as days from J2000 epoch (Jan 1, 2000 12:00 TT).
 */

export interface TimeEvent {
  id: string
  name: string
  date: string          // human-readable date
  elapsedDays: number   // days from J2000 epoch
  description: string
  category: 'comet' | 'transit' | 'eclipse' | 'alignment' | 'opposition' | 'historic'
  emoji: string
  focusPlanet?: string  // optional planet to focus camera on
}

/** Convert a Date to days from J2000 (Jan 1.5, 2000) */
export function dateToJ2000Days(year: number, month: number, day: number): number {
  const date = Date.UTC(year, month - 1, day, 12, 0, 0)
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0)
  return (date - j2000) / (24 * 60 * 60 * 1000)
}

export const TIME_EVENTS: TimeEvent[] = [
  {
    id: 'halley-1986',
    name: "Halley's Comet Return",
    date: 'Feb 9, 1986',
    elapsedDays: dateToJ2000Days(1986, 2, 9),
    description: "Halley's Comet reached perihelion at 0.586 AU from the Sun — the most famous periodic comet, visible every ~76 years. Five spacecraft (the 'Halley Armada') flew past to study it.",
    category: 'comet',
    emoji: '☄️',
  },
  {
    id: 'shoemaker-levy-1994',
    name: 'Shoemaker-Levy 9 Impact',
    date: 'Jul 16, 1994',
    elapsedDays: dateToJ2000Days(1994, 7, 16),
    description: 'Comet Shoemaker-Levy 9 broke apart and collided with Jupiter over 6 days. The impacts left dark scars larger than Earth visible for months. First direct observation of an extraterrestrial collision.',
    category: 'historic',
    emoji: '💥',
    focusPlanet: 'Jupiter',
  },
  {
    id: 'mars-opposition-2003',
    name: 'Mars Closest Approach',
    date: 'Aug 27, 2003',
    elapsedDays: dateToJ2000Days(2003, 8, 27),
    description: 'Mars came within 55.76 million km of Earth — the closest in nearly 60,000 years. Mars appeared 85× brighter than usual, easily visible as a brilliant orange "star."',
    category: 'opposition',
    emoji: '🔴',
    focusPlanet: 'Mars',
  },
  {
    id: 'venus-transit-2004',
    name: 'Transit of Venus',
    date: 'Jun 8, 2004',
    elapsedDays: dateToJ2000Days(2004, 6, 8),
    description: 'Venus passed directly between Earth and the Sun — a rare event occurring in pairs 8 years apart, separated by over a century. Historically used to calculate the distance to the Sun.',
    category: 'transit',
    emoji: '🌑',
    focusPlanet: 'Venus',
  },
  {
    id: 'venus-transit-2012',
    name: 'Last Transit of Venus',
    date: 'Jun 5, 2012',
    elapsedDays: dateToJ2000Days(2012, 6, 5),
    description: "The second of the 2004/2012 Venus transit pair. The next won't occur until December 2117 — no one alive today will see another one.",
    category: 'transit',
    emoji: '🌑',
    focusPlanet: 'Venus',
  },
  {
    id: 'total-eclipse-2024',
    name: 'Great American Eclipse',
    date: 'Apr 8, 2024',
    elapsedDays: dateToJ2000Days(2024, 4, 8),
    description: 'A total solar eclipse crossed North America from Mexico to Canada. Over 31 million people were in the path of totality, experiencing up to 4 minutes 28 seconds of darkness.',
    category: 'eclipse',
    emoji: '🌘',
    focusPlanet: 'Earth',
  },
  {
    id: 'jupiter-saturn-2020',
    name: 'Great Conjunction',
    date: 'Dec 21, 2020',
    elapsedDays: dateToJ2000Days(2020, 12, 21),
    description: "Jupiter and Saturn appeared just 0.1° apart — their closest conjunction since 1623. Called the 'Christmas Star,' they looked like a single bright point to the naked eye.",
    category: 'alignment',
    emoji: '⭐',
    focusPlanet: 'Jupiter',
  },
  {
    id: 'planetary-parade-2025',
    name: 'Planetary Parade',
    date: 'Feb 28, 2025',
    elapsedDays: dateToJ2000Days(2025, 2, 28),
    description: 'All visible planets (Mercury, Venus, Mars, Jupiter, Saturn) aligned in the evening sky. A rare planetary parade where all can be seen simultaneously with the naked eye.',
    category: 'alignment',
    emoji: '🪐',
  },
  {
    id: 'halley-2061',
    name: "Halley's Comet Return",
    date: 'Jul 28, 2061',
    elapsedDays: dateToJ2000Days(2061, 7, 28),
    description: "The next return of Halley's Comet — predicted to be much more spectacular than 1986 due to a more favorable viewing geometry from Earth.",
    category: 'comet',
    emoji: '☄️',
  },
  {
    id: 'mercury-transit-2032',
    name: 'Transit of Mercury',
    date: 'Nov 13, 2032',
    elapsedDays: dateToJ2000Days(2032, 11, 13),
    description: 'Mercury will pass across the face of the Sun. These transits occur about 13 times per century and reveal Mercury as a tiny black dot against the solar disk.',
    category: 'transit',
    emoji: '⚫',
    focusPlanet: 'Mercury',
  },
]

/** Get a category color */
export function getCategoryColor(category: TimeEvent['category']): string {
  switch (category) {
    case 'comet': return '#00BFFF'
    case 'transit': return '#FFD700'
    case 'eclipse': return '#FF6B6B'
    case 'alignment': return '#9B59B6'
    case 'opposition': return '#E67E22'
    case 'historic': return '#FF4444'
  }
}
