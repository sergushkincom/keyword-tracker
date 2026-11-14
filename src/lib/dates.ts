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

/** Chronological axis, Sep 4 → Sep 24 2026. */
export const AXIS: DayColumn[] = Array.from({ length: 21 }, (_, index) => dayAt(index))

/** Display axis, newest on the left. */
export const DISPLAY_AXIS: DayColumn[] = [...AXIS].reverse()

export function displayIndex(iso: string): number {
  return DISPLAY_AXIS.findIndex((day) => day.iso === iso)
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

const WEEKDAY_LONG: Record<(typeof WEEKDAYS)[number], string> = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
}

export function weekdayLong(weekday: (typeof WEEKDAYS)[number]): string {
  return WEEKDAY_LONG[weekday]
}

/** Column header id for one day. Shared by header cells and `headers` on spanned cells. */
export function columnHeaderId(iso: string): string {
  return `col-${iso}`
}

/** Screen-reader day, day then month: "5 Nov". */
export function spokenDay(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`)
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`
}

/**
 * Chronological spoken range. One day is "5 Nov"; a same-month run is "2 to 5 Nov".
 * Display order is newest-first, so callers pass the two ends in either order.
 */
export function spokenRange(startIso: string, endIso: string): string {
  const [start, end] = startIso <= endIso ? [startIso, endIso] : [endIso, startIso]
  if (start === end) return spokenDay(start)
  const from = new Date(`${start}T00:00:00Z`)
  const to = new Date(`${end}T00:00:00Z`)
  const sameMonth = from.getUTCFullYear() === to.getUTCFullYear() && from.getUTCMonth() === to.getUTCMonth()
  if (sameMonth) return `${from.getUTCDate()} to ${to.getUTCDate()} ${MONTHS[from.getUTCMonth()]}`
  return `${spokenDay(start)} to ${spokenDay(end)}`
}

export function spokenSpan(startIndex: number, length: number): string {
  const left = DISPLAY_AXIS[startIndex]
  const right = DISPLAY_AXIS[startIndex + length - 1]
  if (!left || !right) return ''
  return spokenRange(left.iso, right.iso)
}

/** `on` for one day, `from` for a run: "Rank 3 on 5 Nov" / "Rank 3 from 2 to 5 Nov". */
export function spanRelation(length: number): 'on' | 'from' {
  return length === 1 ? 'on' : 'from'
}

export function spanHeaderIds(rowHeaderId: string, startIndex: number, length: number): string {
  const ids = [rowHeaderId]
  for (let offset = 0; offset < length; offset += 1) {
    const day = DISPLAY_AXIS[startIndex + offset]
    if (day) ids.push(columnHeaderId(day.iso))
  }
  return ids.join(' ')
}

export type DateSegment =
  | { kind: 'empty'; startIndex: number; length: number }
  | { kind: 'bar'; startIndex: number; length: number }

export function barSegments(startDate: string, endDate: string): DateSegment[] {
  const start = displayIndex(startDate)
  const end = displayIndex(endDate)
  const from = Math.min(start, end)
  const to = Math.max(start, end)
  const segments: DateSegment[] = []
  if (from > 0) segments.push({ kind: 'empty', startIndex: 0, length: from })
  segments.push({ kind: 'bar', startIndex: from, length: to - from + 1 })
  if (to < DISPLAY_AXIS.length - 1) {
    const startIndex = to + 1
    segments.push({ kind: 'empty', startIndex, length: DISPLAY_AXIS.length - startIndex })
  }
  return segments
}
