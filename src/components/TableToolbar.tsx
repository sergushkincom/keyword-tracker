import { ChevronDown, Download, Maximize2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn, iconStroke } from '../lib/cn.ts'

const POSITIONS = ['Organic', 'Sponsored', 'Side-by-side'] as const
type PositionType = (typeof POSITIONS)[number]

type TableToolbarProps = {
  drawerOpen: boolean
  onNewEvent: () => void
}

export function TableToolbar({ drawerOpen, onNewEvent }: TableToolbarProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<PositionType>('Organic')
  const [positionOpen, setPositionOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    if (drawerOpen) {
      setAddOpen(false)
      setPositionOpen(false)
    }
  }, [drawerOpen])

  useEffect(() => {
    if (!positionOpen && !addOpen) return
    const close = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return
      if (rootRef.current?.contains(event.target)) return
      setPositionOpen(false)
      setAddOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'e' || event.key === 'E') {
        setPositionOpen(false)
        setAddOpen(false)
      }
    }
    window.addEventListener('mousedown', close)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', close)
      window.removeEventListener('keydown', onKey)
    }
  }, [positionOpen, addOpen])

  return (
    <div ref={rootRef} className="flex shrink-0 items-center gap-2">
      <input className="field w-60 px-2" placeholder="Search keywords" aria-label="Search keywords" />
      <div className="flex h-8 overflow-hidden rounded-control border border-border-input" role="group" aria-label="Granularity">
        <span className="flex items-center bg-bg-brand-tertiary px-2 text-fg-brand-primary">D</span>
        <span className="flex items-center px-2 text-fg-secondary">W</span>
      </div>
      <div className="relative">
        <button
          type="button"
          className="flex h-8 items-center gap-2 rounded-control border border-border-input bg-bg-input px-2"
          aria-expanded={positionOpen}
          onClick={() => {
            setPositionOpen((open) => !open)
            setAddOpen(false)
          }}
        >
          <span className="text-fg-tertiary">Position type</span>
          <span>{position}</span>
          <ChevronDown size={16} strokeWidth={iconStroke} className="text-fg-tertiary" />
        </button>
        {positionOpen ? (
          <div className="absolute top-full left-0 z-40 mt-1 w-full rounded-card border border-border-primary bg-bg-dropdown py-1 shadow-overlay">
            {POSITIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  'block w-full px-2 py-1 text-left hover:bg-bg-primary-hover',
                  option === position && 'text-fg-brand-primary',
                )}
                onClick={() => {
                  setPosition(option)
                  setPositionOpen(false)
                }}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-control border border-border-input text-fg-secondary" aria-label="Export">
          <Download size={16} strokeWidth={iconStroke} />
        </button>
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-control border border-border-input text-fg-secondary" aria-label="Fullscreen">
          <Maximize2 size={16} strokeWidth={iconStroke} />
        </button>
        <div className="relative">
          <button
            type="button"
            id="add-menu-button"
            className="flex h-8 items-center gap-1 rounded-control bg-bg-brand-primary px-3 text-fg-on-brand hover:bg-bg-brand-primary-hover"
            aria-expanded={addOpen}
            onClick={() => {
              setAddOpen((open) => !open)
              setPositionOpen(false)
            }}
          >
            Add
            <ChevronDown size={16} strokeWidth={iconStroke} />
          </button>
          {addOpen ? (
            <div className="absolute top-full right-0 z-40 mt-1 w-40 rounded-card border border-border-primary bg-bg-dropdown py-1 shadow-overlay">
              <button
                type="button"
                className="block w-full px-2 py-1 text-left hover:bg-bg-primary-hover"
                onClick={() => {
                  setAddOpen(false)
                  onNewEvent()
                }}
              >
                New event
              </button>
              <button type="button" className="block w-full px-2 py-1 text-left hover:bg-bg-primary-hover" onClick={() => setAddOpen(false)}>
                New keyword
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
