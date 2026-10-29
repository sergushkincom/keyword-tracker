import { useState, type ReactNode } from 'react'
import { cn } from '../lib/cn.ts'

type TooltipProps = {
  label: ReactNode
  children: ReactNode
  className?: string
}

export function Tooltip({ label, children, className }: TooltipProps) {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null)

  return (
    <span
      className={cn('inline-flex', className)}
      onMouseEnter={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setAnchor({ x: rect.left + rect.width / 2, y: rect.top })
      }}
      onMouseLeave={() => setAnchor(null)}
    >
      {children}
      {anchor ? (
        <span
          role="tooltip"
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-card bg-bg-tooltip px-2 py-1 text-left text-cell text-fg-white-inverse shadow-overlay"
          style={{ left: anchor.x, top: anchor.y - 8 }}
        >
          {label}
        </span>
      ) : null}
    </span>
  )
}
