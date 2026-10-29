import { ListPlus, Star, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { iconStroke } from '../lib/cn.ts'
import { Tooltip } from './Tooltip.tsx'

type SelectionBarProps = {
  count: number
  onSelectAll: () => void
  onDeselectAll: () => void
}

function IconAction({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip label={label}>
      <button type="button" aria-label={label} className="flex h-8 w-8 items-center justify-center rounded-control">
        {children}
      </button>
    </Tooltip>
  )
}

export function SelectionBar({ count, onSelectAll, onDeselectAll }: SelectionBarProps) {
  if (count === 0) return null
  const noun = count === 1 ? 'keyword' : 'keywords'
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center">
      <div className="selection-in pointer-events-auto flex items-center gap-3 rounded-card bg-bg-dark px-3 py-2 text-fg-white-inverse shadow-overlay">
        <span>
          {count} {noun} selected
        </span>
        <button type="button" onClick={onSelectAll}>
          Select all
        </button>
        <button type="button" onClick={onDeselectAll}>
          Deselect all
        </button>
        <span className="h-4 w-px" style={{ background: 'color-mix(in oklch, var(--fg-white-inverse) 28%, transparent)' }} />
        <IconAction label="Create list">
          <ListPlus size={16} strokeWidth={iconStroke} />
        </IconAction>
        <IconAction label="Add to favourites">
          <Star size={16} strokeWidth={iconStroke} />
        </IconAction>
        <IconAction label="Delete">
          <Trash2 size={16} strokeWidth={iconStroke} />
        </IconAction>
      </div>
    </div>
  )
}
