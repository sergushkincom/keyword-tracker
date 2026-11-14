import { useState } from 'react'
import { RAMP } from '../lib/rankColor.ts'
import { cn, focusRing } from '../lib/cn.ts'

const STEPS = [1, 2, 3, 4, 5, 6] as const
const TICKS = ['1', '5', '15', '40', '70', '100+']

export function Legend() {
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const open = hover || focus
  const prefix = RAMP === 'trafficLight' ? 'rank-tl' : 'rank-seq'

  return (
    <div className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button
        type="button"
        className={cn('flex items-center gap-1 text-cell text-fg-secondary', focusRing)}
        aria-expanded={open}
        aria-label="Position, 1 to 100+"
        aria-controls={open ? 'rank-legend' : undefined}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      >
        <span>Position</span>
        <span className="text-fg-tertiary">1</span>
        {STEPS.map((step) => (
          <span key={step} aria-hidden="true" className={cn('h-3 w-3 rounded-chip', `${prefix}-${step}`)} />
        ))}
        <span className="text-fg-tertiary">100+</span>
      </button>
      {open ? (
        <div
          id="rank-legend"
          role="region"
          aria-label="Position definition"
          className="absolute top-full right-0 z-30 mt-1 w-80 rounded-card border border-border-primary bg-bg-primary p-3 text-fg-primary shadow-overlay"
        >
          <p>Definition: Amazon position</p>
          <p className="mt-2 text-cell text-fg-secondary">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.
          </p>
          <p className="mt-2 text-cell text-fg-secondary">
            Sed posuere consectetur est at lobortis. Aenean lacinia bibendum nulla sed consectetur cras mattis consectetur purus.
          </p>
          <p className="mt-2 text-cell text-fg-tertiary">Timeframe: 1 week</p>
          <div className="mt-3 flex h-2 overflow-hidden rounded-chip">
            {STEPS.map((step) => (
              <div key={step} aria-hidden="true" className={cn('h-full flex-1', `${prefix}-${step}`)} />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-cell text-fg-tertiary">
            {TICKS.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
