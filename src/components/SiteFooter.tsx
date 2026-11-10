import { ArrowUpRight } from 'lucide-react'

const REPO = 'https://github.com/sergushkincom/keyword-tracker'
const LINKS = [
  { label: 'GitHub', href: REPO },
  { label: 'README', href: `${REPO}#readme` },
]
const link =
  'rounded-chip underline-offset-2 hover:text-fg-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring-primary'

/** Who made this and where the code is. One thin row under the app, never over it. */
export function SiteFooter() {
  return (
    <footer className="flex h-8 shrink-0 items-center justify-between gap-3 border-t border-border-primary bg-bg-primary px-3 text-cell text-fg-tertiary">
      <p className="truncate max-sm:hidden">MIT licensed · Clickable prototype</p>
      <nav aria-label="About this project" className="flex items-center gap-3 max-sm:w-full max-sm:justify-between">
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={link}>
            {l.label}
          </a>
        ))}
        <a href="https://sergushkin.com" target="_blank" rel="noreferrer" className={`${link} flex items-center gap-0.5`}>
          Built by <span className="text-fg-primary">Denys Sergushkin</span>
          <ArrowUpRight aria-hidden size={12} />
        </a>
      </nav>
    </footer>
  )
}
