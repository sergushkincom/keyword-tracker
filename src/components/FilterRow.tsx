import { Calendar, MapPin, Package } from 'lucide-react'
import type { ReactNode } from 'react'
import { iconStroke } from '../lib/cn.ts'

function Field({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex h-8 items-center gap-2 rounded-control border border-border-input bg-bg-input px-2 text-fg-primary">
      <span className="text-fg-tertiary">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  )
}

export function FilterRow() {
  return (
    <div className="grid shrink-0 grid-cols-3 gap-2">
      <Field icon={<Package size={16} strokeWidth={iconStroke} />} text="Search or select product" />
      <Field icon={<MapPin size={16} strokeWidth={iconStroke} />} text="Miami, USA" />
      <Field icon={<Calendar size={16} strokeWidth={iconStroke} />} text="Last 3w · Sep 4 – Sep 24" />
    </div>
  )
}
