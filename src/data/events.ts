export const EVENT_COLORS = ['purple', 'azure', 'amber', 'teal', 'rose'] as const

export type EventColor = (typeof EVENT_COLORS)[number]

export type TrackerEvent = {
  id: string
  name: string
  label: string
  color: EventColor
  startDate: string
  endDate: string
}

export const SEEDED_EVENTS: TrackerEvent[] = [
  {
    id: 'prime-day-prep',
    name: 'Prime Day prep',
    label: 'Prime Day prep',
    color: 'purple',
    startDate: '2026-09-05',
    endDate: '2026-09-11',
  },
  {
    id: 'price-test',
    name: 'Price test $69',
    label: 'Price test $69',
    color: 'azure',
    startDate: '2026-09-09',
    endDate: '2026-09-16',
  },
]
