import { ListPlus, Star, Trash2 } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { cn, iconStroke } from '../lib/cn.ts'
import { useReducedMotion } from '../lib/useReducedMotion.ts'
import { RollingNumber } from './RollingNumber.tsx'
import { Tooltip } from './Tooltip.tsx'

type SelectionBarProps = {
  count: number
  onSelectAll: () => void
  onDeselectAll: () => void
}

/** Matches the selection-bar transition in index.css. */
const EXIT_MS = 200

type Presence = 'closed' | 'open' | 'leaving'

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
  const reduced = useReducedMotion()
  const [shownCount, setShownCount] = useState(count)
  const [presence, setPresence] = useState<Presence>(count > 0 ? 'open' : 'closed')
  if (count > 0 && shownCount !== count) setShownCount(count)
  if (count > 0 && presence !== 'open') setPresence('open')
  else if (count === 0 && presence === 'open') setPresence(reduced ? 'closed' : 'leaving')
  else if (count === 0 && reduced && presence === 'leaving') setPresence('closed')

  useEffect(() => {
    if (presence !== 'leaving') return
    const timer = window.setTimeout(() => setPresence('closed'), EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [presence])

  if (presence === 'closed' || shownCount === 0) return null

  const noun = shownCount === 1 ? 'keyword' : 'keywords'
  const leaving = presence === 'leaving'

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-12 z-40 flex justify-center">
      <div
        className={cn(
          'selection-bar flex items-center gap-3 rounded-card bg-bg-dark px-3 py-2 text-fg-white-inverse shadow-overlay',
          leaving ? 'pointer-events-none' : 'pointer-events-auto',
        )}
        data-state={leaving ? 'closed' : 'open'}
      >
        <span className="inline-flex items-center">
          <span className="sr-only">
            {shownCount} {noun} selected
          </span>
          <span aria-hidden="true" className="inline-flex items-center">
            <RollingNumber value={String(shownCount)} />
            <span className="whitespace-pre"> {noun} selected</span>
          </span>
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
