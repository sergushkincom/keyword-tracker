import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { displayOrder, toRuns } from './runs.ts'

describe('toRuns', () => {
  it('returns no runs for an empty series', () => {
    assert.deepEqual(toRuns([]), [])
  })

  it('collapses a flat series into a single run', () => {
    assert.deepEqual(toRuns([7, 7, 7, 7]), [{ value: 7, startIndex: 0, length: 4 }])
  })

  it('keeps each day when every rank changes', () => {
    assert.deepEqual(toRuns([1, 2, 3]), [
      { value: 1, startIndex: 0, length: 1 },
      { value: 2, startIndex: 1, length: 1 },
      { value: 3, startIndex: 2, length: 1 },
    ])
  })

  it('merges consecutive days with the same rank into one run', () => {
    assert.deepEqual(toRuns([4, 4, 4, 9, 9, 2, 2, 2, 2]), [
      { value: 4, startIndex: 0, length: 3 },
      { value: 9, startIndex: 3, length: 2 },
      { value: 2, startIndex: 5, length: 4 },
    ])
  })

  it('does not merge the same rank when another value sits between', () => {
    assert.deepEqual(toRuns([6, 6, null, 6, 6, 6]), [
      { value: 6, startIndex: 0, length: 2 },
      { value: null, startIndex: 2, length: 1 },
      { value: 6, startIndex: 3, length: 3 },
    ])
  })

  it('merges consecutive missing days and keeps them distinct from a rank', () => {
    assert.deepEqual(toRuns([null, null, 5, 5, null]), [
      { value: null, startIndex: 0, length: 2 },
      { value: 5, startIndex: 2, length: 2 },
      { value: null, startIndex: 4, length: 1 },
    ])
  })

  it('merges equal decimal values the same way as integers', () => {
    assert.deepEqual(toRuns([4.2, 4.2, 4.6]), [
      { value: 4.2, startIndex: 0, length: 2 },
      { value: 4.6, startIndex: 2, length: 1 },
    ])
  })

  it('covers every day exactly once, in order', () => {
    const values = [1, 1, null, 3, 3, 3, 1, null, null]
    const runs = toRuns(values)
    const expanded: (number | null)[] = []

    for (const run of runs) {
      assert.equal(run.startIndex, expanded.length)
      assert.ok(run.length >= 1)
      for (let i = 0; i < run.length; i++) expanded.push(run.value)
    }

    assert.deepEqual(expanded, values)
    for (let i = 1; i < runs.length; i++) {
      assert.notEqual(runs[i]?.value, runs[i - 1]?.value)
    }
  })

  it('does not mutate the input series', () => {
    const values = [1, 1, 2]
    toRuns(values)
    assert.deepEqual(values, [1, 1, 2])
  })
})

describe('displayOrder', () => {
  it('puts the newest day first without mutating the chronological series', () => {
    const chronological = [8, 8, 4, 2]
    assert.deepEqual(displayOrder(chronological), [2, 4, 8, 8])
    assert.deepEqual(chronological, [8, 8, 4, 2])
  })

  it('merges consecutive equal ranks after reversing into newest-first order', () => {
    // Chronological series is oldest → newest. The table shows newest on the left.
    const chronological = [8, 8, 4, 4, 4, 2]
    assert.deepEqual(toRuns(displayOrder(chronological)), [
      { value: 2, startIndex: 0, length: 1 },
      { value: 4, startIndex: 1, length: 3 },
      { value: 8, startIndex: 4, length: 2 },
    ])
  })
})
