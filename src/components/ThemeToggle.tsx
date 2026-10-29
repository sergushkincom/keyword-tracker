import { Moon, Sun } from 'lucide-react'
import { iconStroke } from '../lib/cn.ts'

export type ThemeName = 'light' | 'dark'

type ThemeToggleProps = {
  theme: ThemeName
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const next: ThemeName = theme === 'light' ? 'dark' : 'light'
  const Icon = theme === 'light' ? Moon : Sun
  return (
    <button
      type="button"
      className="flex h-8 w-8 items-center justify-center rounded-control border border-border-input text-fg-secondary"
      aria-label={`Switch to ${next} theme`}
      onClick={onToggle}
    >
      <Icon size={16} strokeWidth={iconStroke} />
    </button>
  )
}
