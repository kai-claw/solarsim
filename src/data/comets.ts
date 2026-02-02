/**
 * Famous comets with real orbital parameters.
 * Semi-major axes in AU, periods in years converted to days.
 */

export interface CometData {
  name: string
  semiMajorAxisAU: number     // AU
  eccentricity: number
  inclination: number         // degrees
  orbitalPeriodDays: number
  meanAnomalyDeg: number      // degrees at J2000 epoch
  color: string
  tailColor: string
  description: string
  perihelionAU: number        // closest approach to Sun
  lastPerihelion: string      // date string
}

export const COMETS: CometData[] = [
  {
    name: "Halley's Comet",
    semiMajorAxisAU: 17.834,
    eccentricity: 0.9671,
    inclination: 162.26,
    orbitalPeriodDays: 27510,     // ~75.3 years
    meanAnomalyDeg: 38.38,
    color: '#E8E8FF',
    tailColor: '#6699FF',
    description: 'The most famous periodic comet, visible from Earth every 75-79 years. Last seen in 1986.',
    perihelionAU: 0.586,
    lastPerihelion: '1986-02-09',
  },
  {
    name: 'Hale-Bopp',
    semiMajorAxisAU: 186.0,
    eccentricity: 0.995,
    inclination: 89.43,
    orbitalPeriodDays: 927375,    // ~2,539 years
    meanAnomalyDeg: 0.11,
    color: '#FFFFEE',
    tailColor: '#FFCC44',
    description: 'The "Great Comet of 1997". One of the brightest comets seen in the 20th century, visible to the naked eye for 18 months.',
    perihelionAU: 0.914,
    lastPerihelion: '1997-04-01',
  },
  {
    name: 'Encke',
    semiMajorAxisAU: 2.215,
    eccentricity: 0.8483,
    inclination: 11.78,
    orbitalPeriodDays: 1204,      // ~3.3 years
    meanAnomalyDeg: 186.55,
    color: '#DDDDCC',
    tailColor: '#88AAFF',
    description: 'Has the shortest orbital period of any known comet (3.3 years). Source of the Taurid meteor showers.',
    perihelionAU: 0.336,
    lastPerihelion: '2023-10-22',
  },
]
