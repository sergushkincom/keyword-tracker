export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** Inset ring so it stays visible inside sticky and overflow-hidden cells. */
export const focusRing =
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring-primary'

export const iconStroke = 'var(--icon-stroke-width)'
