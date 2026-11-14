import { spanHeaderIds, spanRelation, spokenSpan } from '../lib/dates.ts'
import { rankColor, rankText } from '../lib/rankColor.ts'
import { COLUMN_WASH, washFrame, type Span } from '../lib/highlight.ts'
import type { Run } from '../lib/runs.ts'
import { cn } from '../lib/cn.ts'

export function Wash({ startIndex, length, span }: { startIndex: number; length: number; span: Span | null }) {
  const frame = washFrame(startIndex, length, span)
  if (!frame) return null
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 z-[1]"
      style={{ left: frame.left, width: frame.width, background: COLUMN_WASH }}
    />
  )
}

function formatValue(value: number, suffix?: string): string {
  const body = Number.isInteger(value) ? String(value) : value.toFixed(1)
  return suffix ? `${body}${suffix}` : body
}

type SeriesCellsProps = {
  runs: Run[]
  span: Span | null
  colorize: boolean
  rowHeaderId: string
  suffix?: string
  collapseLeft?: number
  collapseRight?: number
  animate?: boolean
}

function seriesLabel(run: Run, colorize: boolean, suffix?: string): string {
  const when = spokenSpan(run.startIndex, run.length)
  const relation = spanRelation(run.length)
  if (run.value === null) return `${colorize ? 'No rank' : 'No value'} ${relation} ${when}`
  const value = formatValue(run.value, suffix)
  return colorize ? `Rank ${value} ${relation} ${when}` : `${value} ${relation} ${when}`
}

export function SeriesCells({ runs, span, colorize, rowHeaderId, suffix, collapseLeft, collapseRight, animate }: SeriesCellsProps) {
  return (
    <>
      {runs.map((run) => {
        const collapse =
          run.length === 1 && run.startIndex === collapseLeft
            ? 'left'
            : run.length === 1 && run.startIndex === collapseRight
              ? 'right'
              : null
        const fill =
          run.value === null ? 'hatch' : colorize ? rankColor(run.value) : 'bg-bg-secondary text-fg-primary'
        const value = run.value === null ? '' : formatValue(run.value, suffix)
        return (
          <td
            key={run.startIndex}
            colSpan={run.length}
            headers={spanHeaderIds(rowHeaderId, run.startIndex, run.length)}
            data-rank={run.value ?? ''}
            className={cn(
              'relative h-9 border-b border-border-primary p-1',
              collapse === 'left' && 'collapse-left',
              collapse === 'right' && 'collapse-right',
            )}
          >
            <span className="sr-only">{seriesLabel(run, colorize, suffix)}</span>
            <div aria-hidden="true" className={cn('absolute inset-1 rounded-chip', fill, animate && 'rise-in')} />
            <Wash startIndex={run.startIndex} length={run.length} span={span} />
            <div
              aria-hidden="true"
              className={cn(
                'relative z-[2] flex h-full items-center justify-center tabular-nums',
                run.value !== null && (colorize ? rankText(run.value) : 'text-fg-primary'),
                animate && 'rise-in',
              )}
            >
              {value}
            </div>
          </td>
        )
      })}
    </>
  )
}
