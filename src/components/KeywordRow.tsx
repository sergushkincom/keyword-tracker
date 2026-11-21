import { Check, ChevronRight, Pin } from 'lucide-react'
import { averageRank, type Keyword } from '../data/keywords.ts'
import { displayIndex, recentValues, type DayColumn } from '../lib/dates.ts'
import { stickyClass } from '../lib/columns.ts'
import type { Span } from '../lib/highlight.ts'
import { displayOrder, toRuns } from '../lib/runs.ts'
import { useRollFrom } from '../lib/useRollFrom.ts'
import { cn, iconStroke } from '../lib/cn.ts'
import { EventRow } from './EventRow.tsx'
import { RollingNumber } from './RollingNumber.tsx'
import { SeriesCells } from './RankCell.tsx'

type KeywordRowProps = {
  keyword: Keyword
  displayAxis: readonly DayColumn[]
  selected: boolean
  expanded: boolean
  scrolled: boolean
  span: Span | null
  onToggleSelected: (id: string) => void
  onToggleExpanded: (id: string) => void
}

function Chip({ children }: { children: string }) {
  return <span className="inline-flex h-5 items-center rounded-chip bg-bg-tertiary px-1 text-cell text-fg-secondary">{children}</span>
}

function ValueSeries({
  values,
  suffix,
  displayAxis,
  span,
}: {
  values: readonly number[]
  suffix?: string
  displayAxis: readonly DayColumn[]
  span: Span | null
}) {
  const rollFrom = useRollFrom(values, displayAxis.map((day) => day.iso))
  return (
    <SeriesCells
      runs={toRuns(displayOrder(recentValues(values, displayAxis.length)))}
      span={span}
      displayAxis={displayAxis}
      colorize={false}
      suffix={suffix}
      rollFrom={rollFrom}
    />
  )
}

export function KeywordRow({
  keyword,
  displayAxis,
  selected,
  expanded,
  scrolled,
  span,
  onToggleSelected,
  onToggleExpanded,
}: KeywordRowProps) {
  const days = displayAxis.length
  const ranks = recentValues(keyword.ranks, days)
  const runs = toRuns(displayOrder(ranks))
  const collapseLeft = displayIndex('2026-09-21', displayAxis)
  const collapseRight = displayIndex('2026-09-20', displayAxis)
  const expandable = Boolean(keyword.children?.length)
  const sticky = { scrolled, tone: 'primary' as const }
  const shown = keyword.labels.slice(0, 2)
  const extra = keyword.labels.length - shown.length
  const isos = displayAxis.map((day) => day.iso)
  const rollFrom = useRollFrom(keyword.ranks, isos)
  const average = averageRank(ranks)

  return (
    <>
      <tr data-keyword={keyword.id}>
        <td className={cn(stickyClass(0, sticky), 'h-9 border-b border-border-primary')}>
          <div className="flex h-full items-center justify-center">
            <button
              type="button"
              role="checkbox"
              aria-checked={selected}
              aria-label={`Select ${keyword.name}`}
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded-chip border',
                selected ? 'border-border-brand-primary bg-bg-brand-primary text-fg-on-brand' : 'border-border-input bg-bg-input',
              )}
              onClick={() => onToggleSelected(keyword.id)}
            >
              {selected ? <Check size={12} strokeWidth={iconStroke} /> : null}
            </button>
          </div>
        </td>
        <th
          scope="row"
          aria-labelledby={`${keyword.id}-name`}
          className={cn(stickyClass(1, sticky), 'h-9 overflow-hidden border-b border-border-primary text-left font-normal')}
        >
          <div className="flex h-full items-center gap-1 px-2">
            {expandable ? (
              <button
                type="button"
                className="flex h-4 w-4 items-center justify-center text-fg-tertiary"
                aria-expanded={expanded}
                aria-label={`${expanded ? 'Collapse' : 'Expand'} ${keyword.name}`}
                onClick={() => onToggleExpanded(keyword.id)}
              >
                <ChevronRight size={16} strokeWidth={iconStroke} className={expanded ? 'rotate-90' : undefined} />
              </button>
            ) : null}
            {expandable ? <Pin size={16} strokeWidth={iconStroke} className="shrink-0 text-fg-tertiary" /> : null}
            <span id={`${keyword.id}-name`} className="truncate">{keyword.name}</span>
          </div>
        </th>
        <td className={cn(stickyClass(2, sticky), 'h-9 border-b border-border-primary px-2')}>
          <div className="flex items-center gap-1">
            {shown.map((label) => (
              <Chip key={label}>{label}</Chip>
            ))}
            {extra > 0 ? <Chip>{`+${extra}`}</Chip> : null}
          </div>
        </td>
        <td className={cn(stickyClass(3, sticky), 'h-9 border-b border-border-primary px-2 text-right tabular-nums text-fg-primary')}>
          <span className="sr-only">{average}</span>
          <RollingNumber value={average} />
        </td>
        <SeriesCells
          runs={runs}
          span={span}
          displayAxis={displayAxis}
          colorize
          rollFrom={rollFrom}
          collapseLeft={keyword.id === 'shampoo' && collapseLeft >= 0 ? collapseLeft : undefined}
          collapseRight={keyword.id === 'shampoo' && collapseRight >= 0 ? collapseRight : undefined}
        />
      </tr>
      {expanded
        ? keyword.children?.map((child) =>
            child.kind === 'bar' ? (
              <EventRow
                key={child.id}
                name={child.name}
                label={child.label}
                color={child.color}
                displayAxis={displayAxis}
                startDate={child.startDate}
                endDate={child.endDate}
                span={span}
                scrolled={scrolled}
                indent
                chip={child.chip}
              />
            ) : (
              <tr key={child.id} data-subrow={child.id}>
                <td className={cn(stickyClass(0, sticky), 'h-9 border-b border-border-primary')} />
                <th
                  scope="row"
                  aria-labelledby={`${child.id}-name`}
                  className={cn(stickyClass(1, sticky), 'h-9 overflow-hidden border-b border-border-primary text-left font-normal')}
                >
                  <div className="flex h-full items-center px-2 pl-8">
                    <span id={`${child.id}-name`} className="truncate">{child.name}</span>
                  </div>
                </th>
                <td className={cn(stickyClass(2, sticky), 'h-9 border-b border-border-primary px-2')}>
                  <Chip>{child.chip}</Chip>
                </td>
                <td className={cn(stickyClass(3, sticky), 'h-9 border-b border-border-primary')} />
                <ValueSeries values={child.values} suffix={child.suffix} displayAxis={displayAxis} span={span} />
              </tr>
            ),
          )
        : null}
    </>
  )
}
