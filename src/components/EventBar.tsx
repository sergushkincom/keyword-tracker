import type { ReactNode } from 'react'
import type { EventColor } from '../data/events.ts'
import { DAY_W } from '../lib/columns.ts'
import { Tooltip } from './Tooltip.tsx'

type EventBarProps = {
  color: EventColor
  label: string
  length: number
  tooltip: ReactNode
}

export function EventBar({ color, label, length, tooltip }: EventBarProps) {
  const showLabel = length * DAY_W >= label.length * 7 + 16
  return (
    <Tooltip className="h-full w-full" label={tooltip}>
      <div
        className="flex h-full w-full items-center overflow-hidden rounded-chip pl-2 text-cell"
        style={{
          background: `color-mix(in oklch, var(--bg-${color}-primary) 18%, transparent)`,
          borderLeft: `3px solid var(--bg-${color}-primary)`,
          color: `var(--fg-${color}-primary)`,
        }}
      >
        {showLabel ? <span className="truncate">{label}</span> : null}
      </div>
    </Tooltip>
  )
}
