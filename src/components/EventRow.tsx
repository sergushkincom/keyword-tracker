import type { EventColor } from '../data/events.ts'
import { barSegments, formatRange, spanHeaderIds, spanRelation, spokenSpan } from '../lib/dates.ts'
import { stickyClass } from '../lib/columns.ts'
import type { Span } from '../lib/highlight.ts'
import { cn } from '../lib/cn.ts'
import { EventBar } from './EventBar.tsx'
import { Wash } from './RankCell.tsx'

type EventRowProps = {
  rowId: string
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

function eventCellLabel(name: string, label: string, startIndex: number, length: number, kind: 'bar' | 'empty'): string {
  const when = spokenSpan(startIndex, length)
  const relation = spanRelation(length)
  if (kind === 'empty') return `No event ${relation} ${when}`
  const title = label && label !== name ? `${name}, ${label}` : name
  return `${title} ${relation} ${when}`
}

export function EventRow({
  rowId,
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
  const headerId = `row-${rowId}`

  return (
    <tr data-event={name}>
      <td className={cn(stickyClass(0, sticky), 'h-9 border-b border-border-primary')} />
      <th
        id={headerId}
        scope="row"
        className={cn(stickyClass(1, sticky), 'h-9 overflow-hidden border-b border-border-primary text-left font-normal')}
      >
        <div className={cn('flex h-full items-center px-2', indent && 'pl-8', animate && 'rise-in')} onAnimationEnd={onAnimated}>
          <span className="truncate">{name}</span>
        </div>
      </th>
      <td className={cn(stickyClass(2, sticky), 'h-9 border-b border-border-primary px-2')}>
        {chip ? (
          <span className="inline-flex h-5 items-center rounded-chip bg-bg-tertiary px-1 text-cell text-fg-secondary">{chip}</span>
        ) : null}
      </td>
      <td className={cn(stickyClass(3, sticky), 'h-9 border-b border-border-primary')} />
      {segments.map((segment) => (
        <td
          key={segment.startIndex}
          colSpan={segment.length}
          headers={spanHeaderIds(headerId, segment.startIndex, segment.length)}
          className="relative h-9 border-b border-border-primary p-1"
        >
          <span className="sr-only">{eventCellLabel(name, label, segment.startIndex, segment.length, segment.kind)}</span>
          {segment.kind === 'bar' ? (
            <div aria-hidden="true" className={cn('h-full', animate && 'rise-in')}>
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
          ) : (
            <div aria-hidden="true" className={cn('hatch absolute inset-1 rounded-chip', animate && 'rise-in')} />
          )}
          <Wash startIndex={segment.startIndex} length={segment.length} span={span} />
        </td>
      ))}
    </tr>
  )
}
