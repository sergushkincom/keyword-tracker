const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const WEEKDAYS: Record<string, string> = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
}

type IsoParts = {
  year: number
  month: number
  day: number
}

function parseIso(iso: string): IsoParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return { year, month, day }
}

function monthName(month: number): string {
  return MONTHS[month - 1] ?? ''
}

/** "24 September" */
export function formatLongDay(iso: string): string {
  const parts = parseIso(iso)
  if (!parts) return iso
  return `${parts.day} ${monthName(parts.month)}`
}

/** "24 September 2026" */
export function formatLongDate(iso: string): string {
  const parts = parseIso(iso)
  if (!parts) return iso
  return `${parts.day} ${monthName(parts.month)} ${parts.year}`
}

/**
 * Chronological day span.
 * One day: "24 September".
 * Same month: "12–15 September".
 * Otherwise: "28 September – 2 October".
 */
export function formatDaySpan(startIso: string, endIso: string): string {
  const [fromIso, toIso] = startIso <= endIso ? [startIso, endIso] : [endIso, startIso]
  const from = parseIso(fromIso)
  const to = parseIso(toIso)
  if (!from || !to) {
    if (fromIso === toIso) return formatLongDay(fromIso)
    return `${formatLongDay(fromIso)} – ${formatLongDay(toIso)}`
  }
  if (fromIso === toIso) return `${from.day} ${monthName(from.month)}`
  if (from.year === to.year && from.month === to.month) return `${from.day}–${to.day} ${monthName(from.month)}`
  if (from.year !== to.year) {
    return `${from.day} ${monthName(from.month)} ${from.year} – ${to.day} ${monthName(to.month)} ${to.year}`
  }
  return `${from.day} ${monthName(from.month)} – ${to.day} ${monthName(to.month)}`
}

/** Adds ", 4 days" when the span covers more than one day. */
export function spanWithDuration(startIso: string, endIso: string, length: number): string {
  const range = formatDaySpan(startIso, endIso)
  if (length <= 1) return range
  return `${range}, ${length} days`
}

export function formatSeriesValue(value: number, suffix?: string): string {
  const body = Number.isInteger(value) ? String(value) : value.toFixed(1)
  return suffix ? `${body}${suffix}` : body
}

export type SeriesLabelInput = {
  value: number | null
  length: number
  startIso: string
  endIso: string
}

export type SeriesLabelOptions = {
  kind?: 'rank' | 'value'
  suffix?: string
}

/**
 * Accessible name for a merged series cell.
 * "Rank 3, 12–15 September, 4 days"
 */
export function seriesRunLabel(run: SeriesLabelInput, options: SeriesLabelOptions = {}): string {
  const kind = options.kind ?? 'rank'
  const when = spanWithDuration(run.startIso, run.endIso, run.length)
  if (run.value === null) {
    const missing = kind === 'rank' ? 'No rank' : 'No value'
    return `${missing}, ${when}`
  }
  const shown = formatSeriesValue(run.value, options.suffix)
  if (kind === 'rank') return `Rank ${shown}, ${when}`
  return `${shown}, ${when}`
}

export function eventSpanLabel(name: string, startIso: string, endIso: string, length: number): string {
  return `${name}, ${spanWithDuration(startIso, endIso, length)}`
}

/** "Thursday 24 September" or "Thursday 24 September, today". */
export function columnDayLabel(weekday: string, iso: string, isToday = false): string {
  const longWeekday = WEEKDAYS[weekday] ?? weekday
  const base = `${longWeekday} ${formatLongDay(iso)}`
  return isToday ? `${base}, today` : base
}

export function trackerTableLabel(startIso: string, endIso: string): string {
  const [from, to] = startIso <= endIso ? [startIso, endIso] : [endIso, startIso]
  return `Keyword ranks and events, ${formatLongDate(from)} to ${formatLongDate(to)}`
}
