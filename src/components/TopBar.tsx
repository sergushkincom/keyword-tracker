import { Bell, ChevronDown, Moon, Search, Sun } from 'lucide-react'
import { iconStroke } from '../lib/cn.ts'

type TopBarProps = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function TopBar({ theme, onToggleTheme }: TopBarProps) {
  const next = theme === 'light' ? 'dark' : 'light'
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border-primary bg-bg-primary px-3">
      <div className="relative w-80">
        <Search size={16} strokeWidth={iconStroke} className="pointer-events-none absolute top-2 left-2 text-fg-tertiary" />
        <input className="field w-full pr-14 pl-8" placeholder="Search" aria-label="Search" />
        <span className="pointer-events-none absolute top-1 right-1 flex h-6 items-center rounded-chip bg-bg-tertiary px-1 text-cell text-fg-tertiary">
          ⌘K
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-control border border-border-input text-fg-secondary"
          aria-label={`Switch to ${next} theme`}
          onClick={onToggleTheme}
        >
          {theme === 'light' ? <Moon size={16} strokeWidth={iconStroke} /> : <Sun size={16} strokeWidth={iconStroke} />}
        </button>
        <div className="flex h-8 w-8 items-center justify-center text-fg-secondary" aria-hidden="true">
          <Bell size={16} strokeWidth={iconStroke} />
        </div>
        <div className="flex h-8 items-center gap-1 rounded-control border border-border-input bg-bg-input px-2 text-fg-primary">
          US · USD
          <ChevronDown size={16} strokeWidth={iconStroke} className="text-fg-tertiary" />
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary text-cell text-fg-secondary" aria-hidden="true">
          M
        </div>
      </div>
    </header>
  )
}
