export type Span = {
  start: number
  end: number
}

export const COLUMN_WASH = 'color-mix(in oklch, var(--bg-brand-tertiary) 72%, transparent)'

export function washFrame(
  startIndex: number,
  length: number,
  span: Span | null,
): { left: string; width: string } | null {
  if (!span || length <= 0) return null
  const from = Math.max(startIndex, span.start)
  const to = Math.min(startIndex + length - 1, span.end)
  if (from > to) return null
  return {
    left: `${((from - startIndex) / length) * 100}%`,
    width: `${((to - from + 1) / length) * 100}%`,
  }
}
