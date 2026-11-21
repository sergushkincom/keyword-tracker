import { Calendar, ChevronDown, MapPin, Package } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { PERIODS, periodById, periodLabel, type PeriodId } from '../lib/dates.ts'
import { cn, iconStroke } from '../lib/cn.ts'

function Field({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex h-8 items-center gap-2 rounded-control border border-border-input bg-bg-input px-2 text-fg-primary">
      <span className="text-fg-tertiary">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  )
}

type FilterRowProps = {
  periodId: PeriodId
  onPeriodChange: (id: PeriodId) => void
}

export function FilterRow({ periodId, onPeriodChange }: FilterRowProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const period = periodById(periodId)
  const label = periodLabel(period)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return
      if (rootRef.current?.contains(event.target)) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', close)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', close)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative z-20 grid shrink-0 grid-cols-3 gap-2">
      <Field icon={<Package size={16} strokeWidth={iconStroke} />} text="Search or select product" />
      <Field icon={<MapPin size={16} strokeWidth={iconStroke} />} text="Miami, USA" />
      <div ref={rootRef} className="relative">
        <button
          type="button"
          className="flex h-8 w-full items-center gap-2 rounded-control border border-border-input bg-bg-input px-2 text-left text-fg-primary"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`Time period, ${label}`}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="text-fg-tertiary">
            <Calendar size={16} strokeWidth={iconStroke} />
          </span>
          <span className="truncate">{label}</span>
          <ChevronDown size={16} strokeWidth={iconStroke} className="ml-auto text-fg-tertiary" />
        </button>
        {open ? (
          <div
            role="listbox"
            aria-label="Time period"
            className="absolute top-full right-0 left-0 z-40 mt-1 rounded-card border border-border-primary bg-bg-dropdown py-1 shadow-overlay"
          >
            {[...PERIODS].reverse().map((option) => {
              const selected = option.id === periodId
              const optionLabel = periodLabel(option)
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    'block w-full px-2 py-1 text-left hover:bg-bg-primary-hover',
                    selected && 'text-fg-brand-primary',
                  )}
                  onClick={() => {
                    onPeriodChange(option.id)
                    setOpen(false)
                  }}
                >
                  {optionLabel}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}
