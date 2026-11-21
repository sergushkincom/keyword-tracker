import { recentValues } from './dates.ts'

const NUMERIC = /^\d+(\.\d+)?$/

/** A higher number travels up. A lower number travels down. */
export type RollDirection = 'up' | 'down' | 'none'

export type RollColumn = {
  index: number
  kind: 'digit' | 'point'
  /** Top to bottom. A space is an empty place. */
  glyphs: string[]
  start: number
  end: number
  /** A new place opens as the digit arrives. */
  enter: boolean
  /** A place that is leaving closes as the digit goes. */
  collapse: boolean
  duration: number
  delay: number
}

export type RollPlan = {
  direction: RollDirection
  columns: RollColumn[]
}

type Wheel = {
  glyphs: string[]
  start: number
  end: number
}

function directionBetween(from: string, to: string): RollDirection {
  const delta = Number(to) - Number(from)
  if (delta > 0) return 'up'
  if (delta < 0) return 'down'
  return 'none'
}

function splitNumeric(text: string): { int: string; frac: string | null } {
  const [int, frac] = text.split('.')
  return { int: int ?? '', frac: frac ?? null }
}

function padStart(text: string, length: number): string[] {
  const glyphs = text.split('')
  while (glyphs.length < length) glyphs.unshift(' ')
  return glyphs
}

function padEnd(text: string, length: number): string[] {
  const glyphs = text.split('')
  while (glyphs.length < length) glyphs.push(' ')
  return glyphs
}

/** One step. The old glyph leaves and the new one arrives from the direction of the change. */
function wheel(fromGlyph: string, toGlyph: string, direction: RollDirection): Wheel {
  if (direction === 'none' || fromGlyph === toGlyph) return { glyphs: [toGlyph], start: 0, end: 0 }
  if (direction === 'up') return { glyphs: [fromGlyph, toGlyph], start: 0, end: 1 }
  return { glyphs: [toGlyph, fromGlyph], start: 1, end: 0 }
}

function placesFromRight(kinds: RollColumn['kind'][], index: number): number {
  let place = 0
  for (let cursor = kinds.length - 1; cursor > index; cursor -= 1) {
    if (kinds[cursor] === 'digit') place += 1
  }
  return place
}

/**
 * One column per place, aligned on the decimal point.
 * Returns null when either side is not a plain number (the em dash average).
 */
function stillPlan(text: string): RollPlan {
  const parts = splitNumeric(text)
  const glyphs = parts.frac === null ? parts.int.split('') : [...parts.int.split(''), '.', ...parts.frac.split('')]
  return {
    direction: 'none',
    columns: glyphs.map((glyph, index) => ({
      index,
      kind: glyph === '.' ? 'point' : 'digit',
      glyphs: [glyph],
      start: 0,
      end: 0,
      enter: false,
      collapse: false,
      duration: 0,
      delay: 0,
    })),
  }
}

export function planRoll(from: string, to: string): RollPlan | null {
  if (!NUMERIC.test(from) || !NUMERIC.test(to)) return null
  const direction = directionBetween(from, to)
  if (direction === 'none') return stillPlan(to)
  const fromParts = splitNumeric(from)
  const toParts = splitNumeric(to)
  const intLength = Math.max(fromParts.int.length, toParts.int.length)
  const fromInt = padStart(fromParts.int, intLength)
  const toInt = padStart(toParts.int, intLength)
  const useFrac = fromParts.frac !== null || toParts.frac !== null
  const fracLength = Math.max(fromParts.frac?.length ?? 0, toParts.frac?.length ?? 0)
  const fromGlyphs = useFrac ? [...fromInt, '.', ...padEnd(fromParts.frac ?? '', fracLength)] : fromInt
  const toGlyphs = useFrac ? [...toInt, '.', ...padEnd(toParts.frac ?? '', fracLength)] : toInt
  const kinds: RollColumn['kind'][] = fromGlyphs.map((glyph) => (glyph === '.' ? 'point' : 'digit'))

  const columns = fromGlyphs.map((fromGlyph, index) => {
    const toGlyph = toGlyphs[index] ?? ' '
    const spun = fromGlyph === '.' ? { glyphs: ['.'], start: 0, end: 0 } : wheel(fromGlyph, toGlyph, direction)
    const travel = Math.abs(spun.end - spun.start)
    const place = placesFromRight(kinds, index)
    return {
      index,
      kind: kinds[index] ?? 'digit',
      glyphs: spun.glyphs,
      start: spun.start,
      end: spun.end,
      enter: fromGlyph === ' ' && toGlyph !== ' ',
      collapse: toGlyph === ' ' && fromGlyph !== ' ' && fromGlyph !== '.',
      duration: travel === 0 ? 0 : 320,
      delay: travel === 0 ? 0 : place * 40,
    }
  })

  return { direction, columns }
}

/** Format `value` with the same decimal places as `sample`, and no suffix. */
export function formatRollBody(value: number, sample: string): string {
  const frac = NUMERIC.test(sample) ? sample.split('.')[1] : undefined
  if (!frac) return String(Math.round(value))
  return value.toFixed(frac.length)
}

export function valuesByIso(
  values: readonly (number | null)[],
  isos: readonly string[],
): Map<string, number | null> {
  const recent = recentValues(values, isos.length)
  const map = new Map<string, number | null>()
  isos.forEach((iso, index) => {
    map.set(iso, recent[recent.length - 1 - index] ?? null)
  })
  return map
}

export function sameValueMap(
  left: ReadonlyMap<string, number | null>,
  right: ReadonlyMap<string, number | null>,
): boolean {
  if (left.size !== right.size) return false
  for (const [iso, value] of left) {
    if (right.get(iso) !== value) return false
  }
  return true
}

function nearestNumber(
  isos: readonly string[],
  previous: ReadonlyMap<string, number | null>,
  startIndex: number,
  length: number,
): number | null {
  for (let index = startIndex - 1; index >= 0; index -= 1) {
    const prior = previous.get(isos[index] ?? '')
    if (typeof prior === 'number') return prior
  }
  for (let index = startIndex + length; index < isos.length; index += 1) {
    const prior = previous.get(isos[index] ?? '')
    if (typeof prior === 'number') return prior
  }
  return null
}

/**
 * Where a run's digits start when the window changes.
 * A run that was already on screen keeps its own value, so it does not roll.
 * A run that just appeared starts from the nearest rank that was already visible.
 */
export function sourceValueForRun(
  run: { value: number | null; startIndex: number; length: number },
  isos: readonly string[],
  previous: ReadonlyMap<string, number | null> | null,
): number | null {
  if (run.value === null || !previous) return run.value
  const covered = isos.slice(run.startIndex, run.startIndex + run.length)
  let sawKnown = false
  let mismatch: number | null = null
  for (const iso of covered) {
    if (!previous.has(iso)) continue
    sawKnown = true
    const prior = previous.get(iso)
    if (prior !== run.value && mismatch === null && typeof prior === 'number') mismatch = prior
  }
  if (sawKnown) return mismatch ?? run.value
  return nearestNumber(isos, previous, run.startIndex, run.length) ?? run.value
}
