import { useEffect, useRef, useState } from 'react'
import { FilterRow } from './components/FilterRow.tsx'
import { IconRail } from './components/IconRail.tsx'
import { NewEventDrawer } from './components/NewEventDrawer.tsx'
import { ProductCard } from './components/ProductCard.tsx'
import { SelectionBar } from './components/SelectionBar.tsx'
import { TableToolbar } from './components/TableToolbar.tsx'
import { TopBar } from './components/TopBar.tsx'
import { TrackerTable } from './components/TrackerTable.tsx'
import { KEYWORDS } from './data/keywords.ts'
import { SEEDED_EVENTS, type EventColor, type TrackerEvent } from './data/events.ts'
import type { Span } from './lib/highlight.ts'

type ThemeName = 'light' | 'dark'

export default function App() {
  const [theme, setTheme] = useState<ThemeName>('light')
  const [events, setEvents] = useState<TrackerEvent[]>(SEEDED_EVENTS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerKey, setDrawerKey] = useState(0)
  const [span, setSpan] = useState<Span | null>(null)
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [enteredId, setEnteredId] = useState<string | null>(null)
  const drawerOpenRef = useRef(false)
  drawerOpenRef.current = drawerOpen

  useEffect(() => {
    if (theme === 'dark') document.documentElement.dataset.theme = 'dark'
    else delete document.documentElement.dataset.theme
  }, [theme])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false)
        setSpan(null)
        return
      }
      if (event.key !== 'e' && event.key !== 'E') return
      const target = event.target
      if (target instanceof HTMLElement) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return
      }
      event.preventDefault()
      if (!drawerOpenRef.current) {
        setDrawerKey((key) => key + 1)
        setSpan(null)
      }
      setDrawerOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function openDrawer() {
    setDrawerKey((key) => key + 1)
    setSpan(null)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setSpan(null)
  }

  function createEvent(draft: { name: string; label: string; color: EventColor; startDate: string; endDate: string }) {
    const id = crypto.randomUUID()
    setEvents((current) => [{ id, ...draft }, ...current])
    setEnteredId(id)
    setDrawerOpen(false)
    setSpan(null)
  }

  function toggleSelected(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-body text-fg-primary">
      <IconRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar theme={theme} onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))} />
        <main className="flex min-h-0 flex-1 flex-col gap-2 px-2 py-2">
          <FilterRow />
          <ProductCard />
          <TableToolbar drawerOpen={drawerOpen} onNewEvent={openDrawer} />
          <TrackerTable
            events={events}
            drawerOpen={drawerOpen}
            span={drawerOpen ? span : null}
            onSpanChange={setSpan}
            selected={selected}
            onToggleSelected={toggleSelected}
            enteredId={enteredId}
            onEntered={() => setEnteredId(null)}
          />
        </main>
      </div>
      {drawerOpen ? <NewEventDrawer key={drawerKey} span={span} onClose={closeDrawer} onCreate={createEvent} /> : null}
      <SelectionBar
        count={selected.size}
        onSelectAll={() => setSelected(new Set(KEYWORDS.map((keyword) => keyword.id)))}
        onDeselectAll={() => setSelected(new Set())}
      />
    </div>
  )
}
