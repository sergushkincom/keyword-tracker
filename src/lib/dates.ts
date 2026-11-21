export const TODAY = new Date('2026-09-24T00:00:00Z')

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export type DayColumn = {
  iso: string
  weekday: (typeof WEEKDAYS)[number]
  day: number
  isToday: boolean
  isWeekend: boolean
}

function dayAt(offsetFromSep4: number): DayColumn {
  const date = new Date(Date.UTC(2026, 8, 4 + offsetFromSep4))
  const iso = date.toISOString().slice(0, 10)
  const dow = date.getUTCDay()
  return {
    iso,
    weekday: WEEKDAYS[dow] ?? 'Sun',
    day: date.getUTCDate(),
    isToday: iso === '2026-09-24',
    isWeekend: dow === 0 || dow === 6,
  }
}

/** Chronological axis, Sep 4 → Sep 24 2026. The full series the seed covers. */
export const AXIS: DayColumn[] = Array.from({ length: 21 }, (_, index) => dayAt(index))

/** Display axis, newest on the left. */
export const DISPLAY_AXIS: DayColumn[] = [...AXIS].reverse()

export const PERIODS = [
  { id: '7d', days: 7, name: 'Last 7d' },
  { id: '14d', days: 14, name: 'Last 2w' },
  { id: '21d', days: 21, name: 'Last 3w' },
] as const

export type PeriodId = (typeof PERIODS)[number]['id']
export type Period = (typeof PERIODS)[number]

export function periodById(id: PeriodId): Period {
  return PERIODS.find((period) => period.id === id) ?? PERIODS[2]
}

/** Newest `days` of the full axis, still chronological. */
export function axisForDays(days: number): DayColumn[] {
  const count = Math.min(AXIS.length, Math.max(1, days))
  return AXIS.slice(AXIS.length - count)
}

export function displayAxisFor(axis: readonly DayColumn[]): DayColumn[] {
  return [...axis].reverse()
}

/** Values are chronological, oldest first, aligned with `AXIS`. */
export function recentValues<T>(values: readonly T[], days: number): T[] {
  if (days >= values.length) return [...values]
  return values.slice(values.length - days)
}

export function periodLabel(period: Period): string {
  const axis = axisForDays(period.days)
  const start = axis[0]
  const end = axis[axis.length - 1]
  if (!start || !end) return period.name
  return `${period.name} · ${formatRange(start.iso, end.iso)}`
}

/** ISO dates covered by a display-axis cell, chronological order. */
export function displaySpan(
  startIndex: number,
  length: number,
  displayAxis: readonly DayColumn[] = DISPLAY_AXIS,
): { startIso: string; endIso: string } {
  const start = displayAxis[startIndex]
  const end = displayAxis[startIndex + Math.max(length, 1) - 1]
  const startIso = start?.iso ?? ''
  const endIso = end?.iso ?? startIso
  return startIso <= endIso ? { startIso, endIso } : { startIso: endIso, endIso: startIso }
}

export function displayIndex(iso: string, displayAxis: readonly DayColumn[] = DISPLAY_AXIS): number {
  return displayAxis.findIndex((day) => day.iso === iso)
}

export function formatDay(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`)
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`
}

export function formatRange(startIso: string, endIso: string): string {
  const [start, end] = startIso <= endIso ? [startIso, endIso] : [endIso, startIso]
  if (start === end) return formatDay(start)
  return `${formatDay(start)} – ${formatDay(end)}`
}

export type DateSegment =
  | { kind: 'empty'; startIndex: number; length: number }
  | { kind: 'bar'; startIndex: number; length: number }

export function barSegments(
  startDate: string,
  endDate: string,
  displayAxis: readonly DayColumn[] = DISPLAY_AXIS,
): DateSegment[] {
  const count = displayAxis.length
  if (count === 0) return []
  const oldest = displayAxis[count - 1]?.iso ?? ''
  const newest = displayAxis[0]?.iso ?? ''
  const [eventStart, eventEnd] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate]
  if (!oldest || !newest || eventEnd < oldest || eventStart > newest) {
    return [{ kind: 'empty', startIndex: 0, length: count }]
  }
  const clippedStart = eventStart < oldest ? oldest : eventStart
  const clippedEnd = eventEnd > newest ? newest : eventEnd
  const start = displayIndex(clippedStart, displayAxis)
  const end = displayIndex(clippedEnd, displayAxis)
  if (start < 0 || end < 0) return [{ kind: 'empty', startIndex: 0, length: count }]
  const from = Math.min(start, end)
  const to = Math.max(start, end)
  const segments: DateSegment[] = []
  if (from > 0) segments.push({ kind: 'empty', startIndex: 0, length: from })
  segments.push({ kind: 'bar', startIndex: from, length: to - from + 1 })
  if (to < count - 1) {
    const startIndex = to + 1
    segments.push({ kind: 'empty', startIndex, length: count - startIndex })
  }
  return segments
}
