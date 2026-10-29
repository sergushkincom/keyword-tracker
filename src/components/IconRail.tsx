import { BarChart3, Bell, LayoutGrid, Megaphone, Package, Search, Settings, Table2 } from 'lucide-react'
import { iconStroke } from '../lib/cn.ts'

const ICONS = [
  ['grid', LayoutGrid],
  ['search', Search],
  ['package', Package],
  ['table', Table2],
  ['chart', BarChart3],
  ['campaigns', Megaphone],
  ['alerts', Bell],
  ['settings', Settings],
] as const
const ACTIVE = 'table'

export function IconRail() {
  return (
    <div className="flex h-full w-14 shrink-0 flex-col gap-1 border-r border-border-primary bg-bg-primary py-2" aria-hidden="true">
      {ICONS.map(([name, Icon]) => {
        const active = name === ACTIVE
        return (
          <div key={name} className="relative flex h-10 items-center justify-center">
            {active ? <span className="absolute top-2 bottom-2 left-0 w-[2px] bg-border-brand-primary" /> : null}
            <Icon size={20} strokeWidth={iconStroke} className={active ? 'text-fg-brand-primary' : 'text-fg-tertiary'} />
          </div>
        )
      })}
    </div>
  )
}
