import type { EventColor } from '../data/events.ts'
import { barSegments, formatRange } from '../lib/dates.ts'
import { stickyClass } from '../lib/columns.ts'
import type { Span } from '../lib/highlight.ts'
import { cn } from '../lib/cn.ts'
import { EventBar } from './EventBar.tsx'
import { Wash } from './RankCell.tsx'

type EventRowProps = {
  name: string
  label: string
  color: EventColor
  startDate: string
  endDate: string
  span: Span | null
  scrolled: boolean
  animate?: boolean
  onAnimated?: () => void
  indent?: boolean
  chip?: string
}

export function EventRow({
  name,
  label,
  color,
  startDate,
  endDate,
  span,
  scrolled,
  animate,
  onAnimated,
  indent,
  chip,
}: EventRowProps) {
  const segments = barSegments(startDate, endDate)
  const range = formatRange(startDate, endDate)
  const sticky = { scrolled, tone: 'primary' as const }

  return (
    <tr data-event={name}>
      <td className={cn(stickyClass(0, sticky), 'h-9 border-b border-border-primary')} />
      <td className={cn(stickyClass(1, sticky), 'h-9 overflow-hidden border-b border-border-primary')}>
        <div className={cn('flex h-full items-center px-2', indent && 'pl-8', animate && 'rise-in')} onAnimationEnd={onAnimated}>
          <span className="truncate">{name}</span>
        </div>
      </td>
      <td className={cn(stickyClass(2, sticky), 'h-9 border-b border-border-primary px-2')}>
        {chip ? (
          <span className="inline-flex h-5 items-center rounded-chip bg-bg-tertiary px-1 text-cell text-fg-secondary">{chip}</span>
        ) : null}
      </td>
      <td className={cn(stickyClass(3, sticky), 'h-9 border-b border-border-primary')} />
      {segments.map((segment) =>
        segment.kind === 'bar' ? (
          <td key={segment.startIndex} colSpan={segment.length} className="relative h-9 border-b border-border-primary p-1">
            <div className={cn('h-full', animate && 'rise-in')}>
              <EventBar
                color={color}
                label={label}
                length={segment.length}
                tooltip={
                  <>
                    <span className="block">{name}</span>
                    <span className="block">{range}</span>
                  </>
                }
              />
            </div>
            <Wash startIndex={segment.startIndex} length={segment.length} span={span} />
          </td>
        ) : (
          <td key={segment.startIndex} colSpan={segment.length} className="relative h-9 border-b border-border-primary p-1">
            <div className={cn('hatch absolute inset-1 rounded-chip', animate && 'rise-in')} />
            <Wash startIndex={segment.startIndex} length={segment.length} span={span} />
          </td>
        ),
      )}
    </tr>
  )
}
