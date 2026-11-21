import { rankColor, rankText } from '../lib/rankColor.ts'
import { COLUMN_WASH, washFrame, type Span } from '../lib/highlight.ts'
import { displaySpan, type DayColumn } from '../lib/dates.ts'
import { formatSeriesValue, seriesRunLabel } from '../lib/rankLabel.ts'
import { formatRollBody } from '../lib/roll.ts'
import type { Run } from '../lib/runs.ts'
import { cn } from '../lib/cn.ts'
import { RollingNumber } from './RollingNumber.tsx'

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

type SeriesCellsProps = {
  runs: Run[]
  span: Span | null
  displayAxis: readonly DayColumn[]
  colorize: boolean
  suffix?: string
  collapseLeft?: number
  collapseRight?: number
  animate?: boolean
  rollFrom?: (run: Run) => number | null
}

export function SeriesCells({
  runs,
  span,
  displayAxis,
  colorize,
  suffix,
  collapseLeft,
  collapseRight,
  animate,
  rollFrom,
}: SeriesCellsProps) {
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
        const { startIso, endIso } = displaySpan(run.startIndex, run.length, displayAxis)
        const label = seriesRunLabel(
          { value: run.value, length: run.length, startIso, endIso },
          { kind: colorize ? 'rank' : 'value', suffix },
        )
        const body = run.value === null ? '' : formatSeriesValue(run.value)
        const source = run.value === null ? null : (rollFrom?.(run) ?? null)
        const from = source !== null && body !== '' && source !== run.value ? formatRollBody(source, body) : undefined
        return (
          <td
            key={run.startIndex}
            colSpan={run.length}
            data-rank={run.value ?? ''}
            className={cn(
              'relative h-9 border-b border-border-primary p-1',
              collapse === 'left' && 'collapse-left',
              collapse === 'right' && 'collapse-right',
            )}
          >
            <span className="sr-only">{label}</span>
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
              {body === '' ? null : <RollingNumber value={body} from={from} suffix={suffix} />}
            </div>
          </td>
        )
      })}
    </>
  )
}
