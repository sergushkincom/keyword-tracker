import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  AXIS,
  axisForDays,
  barSegments,
  displayAxisFor,
  periodById,
  periodLabel,
  recentValues,
} from './dates.ts'

describe('axisForDays', () => {
  it('keeps 4–24 September when the window is the full series', () => {
    const axis = axisForDays(21)
    assert.equal(axis.length, 21)
    assert.equal(axis[0]?.iso, '2026-09-04')
    assert.equal(axis[20]?.iso, '2026-09-24')
    assert.deepEqual(axis, AXIS)
  })

  it('keeps only the newest seven days', () => {
    const axis = axisForDays(7)
    assert.deepEqual(
      axis.map((day) => day.iso),
      ['2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24'],
    )
  })
})

describe('periodLabel', () => {
  it('names the default window the way the date field does', () => {
    assert.equal(periodLabel(periodById('21d')), 'Last 3w · Sep 4 – Sep 24')
  })

  it('names the short windows from the same end date', () => {
    assert.equal(periodLabel(periodById('14d')), 'Last 2w · Sep 11 – Sep 24')
    assert.equal(periodLabel(periodById('7d')), 'Last 7d · Sep 18 – Sep 24')
  })
})

describe('recentValues', () => {
  it('drops the older days and keeps the tail aligned with the axis', () => {
    assert.deepEqual(recentValues([1, 2, 3, 4, 5], 3), [3, 4, 5])
  })

  it('returns the whole series when the window is longer', () => {
    assert.deepEqual(recentValues([1, 2], 7), [1, 2])
  })
})

describe('barSegments', () => {
  it('clips an event that starts before the window and ends inside it', () => {
    const display = displayAxisFor(axisForDays(14))
    const segments = barSegments('2026-09-05', '2026-09-11', display)
    const bar = segments.find((segment) => segment.kind === 'bar')
    assert.ok(bar)
    assert.equal(bar.length, 1)
    assert.equal(display[bar.startIndex]?.iso, '2026-09-11')
  })

  it('turns an event that ends before the window into an empty span', () => {
    const display = displayAxisFor(axisForDays(7))
    assert.deepEqual(barSegments('2026-09-05', '2026-09-11', display), [{ kind: 'empty', startIndex: 0, length: 7 }])
  })

  it('keeps a seven-day event intact on the full axis', () => {
    const display = displayAxisFor(AXIS)
    const segments = barSegments('2026-09-05', '2026-09-11', display)
    const bar = segments.find((segment) => segment.kind === 'bar')
    assert.equal(bar?.length, 7)
    const covered = segments.reduce((sum, segment) => sum + segment.length, 0)
    assert.equal(covered, 21)
  })
})
