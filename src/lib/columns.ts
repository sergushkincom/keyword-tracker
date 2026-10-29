import { cn } from './cn.ts'

export const CHECK_W = 40
export const NAME_W = 240
export const LABEL_W = 140
export const RANK_W = 90
export const DAY_W = 72
export const DATE_ORIGIN = CHECK_W + NAME_W + LABEL_W + RANK_W
export const DAY_COUNT = 21
export const TABLE_WIDTH = DATE_ORIGIN + DAY_COUNT * DAY_W

const LEFT = [0, CHECK_W, CHECK_W + NAME_W, DATE_ORIGIN - RANK_W] as const

export function stickyClass(
  column: 0 | 1 | 2 | 3,
  options: { scrolled: boolean; header?: boolean; tone: 'primary' | 'secondary' },
): string {
  const left = LEFT[column]
  return cn(
    'sticky box-border',
    options.header ? 'top-0 z-30' : 'z-10',
    options.tone === 'primary' ? 'bg-bg-primary' : 'bg-bg-secondary',
    left === 0 && 'left-0',
    left === 40 && 'left-10',
    left === 280 && 'left-[280px]',
    left === 420 && 'left-[420px]',
    column === 3 && options.scrolled && 'border-r border-border-primary shadow-sticky',
  )
}
