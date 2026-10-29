import { useState } from 'react'
import { EVENT_COLORS, type EventColor } from '../data/events.ts'
import { DISPLAY_AXIS, formatRange } from '../lib/dates.ts'
import type { Span } from '../lib/highlight.ts'
import { cn } from '../lib/cn.ts'

type NewEventDrawerProps = {
  span: Span | null
  onClose: () => void
  onCreate: (event: { name: string; label: string; color: EventColor; startDate: string; endDate: string }) => void
}

export function NewEventDrawer({ span, onClose, onCreate }: NewEventDrawerProps) {
  const [name, setName] = useState('')
  const [label, setLabel] = useState('')
  const [color, setColor] = useState<EventColor>('purple')
  const start = span ? DISPLAY_AXIS[span.start] : undefined
  const end = span ? DISPLAY_AXIS[span.end] : undefined
  const range = start && end ? formatRange(start.iso, end.iso) : 'Select on the timeline'
  const canCreate = name.trim().length > 0 && Boolean(start && end)

  return (
    <aside
      className="drawer-in fixed top-0 right-0 z-50 flex h-full w-[380px] flex-col border-l border-border-primary bg-bg-modal shadow-overlay"
      role="dialog"
      aria-modal="false"
      aria-label="New event"
    >
      <form
        className="flex min-h-0 flex-1 flex-col gap-3 p-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!canCreate || !start || !end) return
          const [startDate, endDate] = start.iso <= end.iso ? [start.iso, end.iso] : [end.iso, start.iso]
          onCreate({
            name: name.trim(),
            label: label.trim() || name.trim(),
            color,
            startDate,
            endDate,
          })
        }}
      >
        <h2>New event</h2>
        <label className="flex flex-col gap-1 text-cell text-fg-secondary" htmlFor="event-name">
          Name
          <input id="event-name" className="field w-full px-2" value={name} autoFocus onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-cell text-fg-secondary" htmlFor="event-label">
          Label
          <input id="event-label" className="field w-full px-2" value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <fieldset className="flex flex-col gap-1">
          <legend className="text-cell text-fg-secondary">Color</legend>
          <div className="flex gap-2">
            {EVENT_COLORS.map((swatch) => {
              const selected = swatch === color
              return (
                <button
                  key={swatch}
                  type="button"
                  aria-label={swatch}
                  aria-pressed={selected}
                  className="h-6 w-6 rounded-chip"
                  style={{
                    background: `var(--bg-${swatch}-primary)`,
                    boxShadow: selected ? `0 0 0 2px var(--bg-modal), 0 0 0 4px var(--border-${swatch}-primary)` : undefined,
                  }}
                  onClick={() => setColor(swatch)}
                />
              )
            })}
          </div>
        </fieldset>
        <div className="flex flex-col gap-1 text-cell text-fg-secondary">
          Date range
          <div id="event-range" className="flex h-8 items-center rounded-control border border-border-input bg-bg-input px-2 text-fg-primary">
            {range}
          </div>
        </div>
        <div className="mt-auto flex justify-end gap-2">
          <button type="button" className="h-8 rounded-control border border-border-primary bg-bg-primary px-3 text-fg-primary hover:bg-bg-primary-hover" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            id="create-event"
            className={cn(
              'h-8 rounded-control px-3',
              canCreate ? 'bg-bg-brand-primary text-fg-on-brand hover:bg-bg-brand-primary-hover' : 'cursor-default bg-bg-disabled text-fg-disabled',
            )}
            disabled={!canCreate}
          >
            Create
          </button>
        </div>
      </form>
    </aside>
  )
}
