import { ArrowDown, ChevronRight } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { KEYWORDS } from '../data/keywords.ts'
import type { TrackerEvent } from '../data/events.ts'
import { DISPLAY_AXIS } from '../lib/dates.ts'
import { CHECK_W, DATE_ORIGIN, DAY_COUNT, DAY_W, LABEL_W, NAME_W, RANK_W, TABLE_WIDTH, stickyClass } from '../lib/columns.ts'
import { COLUMN_WASH, type Span } from '../lib/highlight.ts'
import { cn, iconStroke } from '../lib/cn.ts'
import { EventRow } from './EventRow.tsx'
import { KeywordRow } from './KeywordRow.tsx'
import { Legend } from './Legend.tsx'
import { Wash } from './RankCell.tsx'

type TrackerTableProps = {
  events: TrackerEvent[]
  drawerOpen: boolean
  span: Span | null
  onSpanChange: (span: Span) => void
  selected: ReadonlySet<string>
  onToggleSelected: (id: string) => void
  enteredId: string | null
  onEntered: () => void
}

function legendBackground(span: Span | null): CSSProperties | undefined {
  if (!span) return undefined
  const left = DATE_ORIGIN + span.start * DAY_W
  const right = DATE_ORIGIN + (span.end + 1) * DAY_W
  return {
    backgroundImage: `linear-gradient(to right, transparent ${left}px, ${COLUMN_WASH} ${left}px, ${COLUMN_WASH} ${right}px, transparent ${right}px)`,
  }
}

export function TrackerTable({
  events,
  drawerOpen,
  span,
  onSpanChange,
  selected,
  onToggleSelected,
  enteredId,
  onEntered,
}: TrackerTableProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [eventsOpen, setEventsOpen] = useState(true)
  const [keywordsOpen, setKeywordsOpen] = useState(true)
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set())
  const headerSticky = { scrolled, header: true, tone: 'secondary' as const }

  useLayoutEffect(() => {
    const element = scrollerRef.current
    if (!element) return
    const update = () => setViewportWidth(element.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  function indexFromClientX(clientX: number): number {
    const element = scrollerRef.current
    if (!element) return 0
    const x = clientX - element.getBoundingClientRect().left + element.scrollLeft
    const raw = Math.floor((x - DATE_ORIGIN) / DAY_W)
    return Math.min(DAY_COUNT - 1, Math.max(0, raw))
  }

  function onHeaderPointerDown(event: ReactPointerEvent<HTMLTableCellElement>, index: number) {
    if (!drawerOpen) return
    event.preventDefault()
    onSpanChange({ start: index, end: index })
    const move = (pointer: PointerEvent) => {
      const next = indexFromClientX(pointer.clientX)
      onSpanChange({ start: Math.min(index, next), end: Math.max(index, next) })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div
      ref={scrollerRef}
      className="min-h-0 flex-1 overflow-auto rounded-card border border-border-primary bg-bg-primary"
      onScroll={(event) => setScrolled(event.currentTarget.scrollLeft > 0)}
    >
      <table className="border-separate border-spacing-0 text-cell" style={{ width: TABLE_WIDTH, minWidth: TABLE_WIDTH }}>
        <colgroup>
          <col style={{ width: CHECK_W }} />
          <col style={{ width: NAME_W }} />
          <col style={{ width: LABEL_W }} />
          <col style={{ width: RANK_W }} />
          {DISPLAY_AXIS.map((day) => (
            <col key={day.iso} style={{ width: DAY_W }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className={cn(stickyClass(0, headerSticky), 'border-b border-border-primary')} />
            <th className={cn(stickyClass(1, headerSticky), 'border-b border-border-primary px-2 text-left font-normal text-fg-secondary')}>
              Events
            </th>
            <th className={cn(stickyClass(2, headerSticky), 'border-b border-border-primary px-2 text-left font-normal text-fg-secondary')}>
              Label
            </th>
            <th className={cn(stickyClass(3, headerSticky), 'border-b border-border-primary px-2 text-right font-normal text-fg-secondary')}>
              <span className="inline-flex items-center gap-1">
                Av.Rank
                <ArrowDown size={16} strokeWidth={iconStroke} className="text-fg-tertiary" />
              </span>
            </th>
            {DISPLAY_AXIS.map((day, index) => {
              const selectedColumn = span !== null && index >= span.start && index <= span.end
              return (
                <th
                  key={day.iso}
                  data-date={day.iso}
                  className={cn(
                    'sticky top-0 z-20 border-b border-border-primary bg-bg-secondary py-1 text-center font-normal',
                    drawerOpen && 'cursor-crosshair',
                    day.isToday && 'text-fg-brand-primary',
                    day.isWeekend && !day.isToday && 'text-fg-quaternary',
                    !day.isToday && !day.isWeekend && 'text-fg-secondary',
                  )}
                  style={selectedColumn ? { background: 'var(--bg-brand-tertiary)' } : undefined}
                  onPointerDown={(event) => onHeaderPointerDown(event, index)}
                >
                  <span className="block leading-4">{day.weekday}</span>
                  <span className="block leading-4 tabular-nums">{day.day}</span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          <GroupHeader
            label={`Global events (${events.length})`}
            open={eventsOpen}
            scrolled={scrolled}
            span={span}
            onToggle={() => setEventsOpen((open) => !open)}
          />
          {eventsOpen
            ? events.map((event) => (
                <EventRow
                  key={event.id}
                  name={event.name}
                  label={event.label}
                  color={event.color}
                  startDate={event.startDate}
                  endDate={event.endDate}
                  span={span}
                  scrolled={scrolled}
                  animate={event.id === enteredId}
                  onAnimated={event.id === enteredId ? onEntered : undefined}
                />
              ))
            : null}
          <tr>
            <td colSpan={4 + DAY_COUNT} className="border-b border-border-primary bg-bg-primary p-1" style={legendBackground(span)}>
              <div className="sticky left-0 flex justify-end" style={{ width: viewportWidth || undefined }}>
                <Legend />
              </div>
            </td>
          </tr>
          <GroupHeader
            label={`Keywords (${KEYWORDS.length})`}
            open={keywordsOpen}
            scrolled={scrolled}
            span={span}
            onToggle={() => setKeywordsOpen((open) => !open)}
          />
          {keywordsOpen
            ? KEYWORDS.map((keyword) => (
                <KeywordRow
                  key={keyword.id}
                  keyword={keyword}
                  selected={selected.has(keyword.id)}
                  expanded={expanded.has(keyword.id)}
                  scrolled={scrolled}
                  span={span}
                  onToggleSelected={onToggleSelected}
                  onToggleExpanded={toggleExpanded}
                />
              ))
            : null}
        </tbody>
      </table>
    </div>
  )
}

function GroupHeader({
  label,
  open,
  scrolled,
  span,
  onToggle,
}: {
  label: string
  open: boolean
  scrolled: boolean
  span: Span | null
  onToggle: () => void
}) {
  const sticky = { scrolled, tone: 'secondary' as const }
  return (
    <tr>
      <td className={cn(stickyClass(0, sticky), 'h-9 border-b border-border-primary bg-bg-secondary')} />
      <td className={cn(stickyClass(1, sticky), 'h-9 border-b border-border-primary')}>
        <button type="button" className="flex h-full items-center gap-1 px-2 text-fg-secondary" aria-expanded={open} onClick={onToggle}>
          <ChevronRight size={16} strokeWidth={iconStroke} className={open ? 'rotate-90' : undefined} />
          {label}
        </button>
      </td>
      <td className={cn(stickyClass(2, sticky), 'h-9 border-b border-border-primary')} />
      <td className={cn(stickyClass(3, sticky), 'h-9 border-b border-border-primary')} />
      {DISPLAY_AXIS.map((day, index) => (
        <td key={day.iso} className="relative h-9 border-b border-border-primary bg-bg-secondary">
          <Wash startIndex={index} length={1} span={span} />
        </td>
      ))}
    </tr>
  )
}
