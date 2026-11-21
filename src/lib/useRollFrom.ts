import { useState } from 'react'
import { sameValueMap, sourceValueForRun, valuesByIso } from './roll.ts'
import type { Run } from './runs.ts'

type Snapshot = {
  current: Map<string, number | null>
  previous: Map<string, number | null> | null
}

/** Ranks from the previous window, kept so a cell that appears can roll in from them. */
export function useRollFrom(
  values: readonly (number | null)[],
  isos: readonly string[],
): (run: Run) => number | null {
  const current = valuesByIso(values, isos)
  const [snapshot, setSnapshot] = useState<Snapshot>(() => ({ current, previous: null }))
  if (!sameValueMap(snapshot.current, current)) {
    setSnapshot({ current, previous: snapshot.current })
  }
  const previous = sameValueMap(snapshot.current, current) ? snapshot.previous : snapshot.current
  return (run) => sourceValueForRun(run, isos, previous)
}
