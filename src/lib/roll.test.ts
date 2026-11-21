import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { axisForDays, displayAxisFor, recentValues } from './dates.ts'
import { planRoll, sourceValueForRun, valuesByIso } from './roll.ts'
import { displayOrder, toRuns } from './runs.ts'

function column(plan: NonNullable<ReturnType<typeof planRoll>>, index: number) {
  const found = plan.columns[index]
  assert.ok(found, `column ${index}`)
  return found
}

describe('planRoll', () => {
  it('rolls a rise upward, ones place first', () => {
    const plan = planRoll('19', '20')
    assert.ok(plan)
    assert.equal(plan.direction, 'up')
    const tens = column(plan, 0)
    const ones = column(plan, 1)
    assert.deepEqual(tens.glyphs, ['1', '2'])
    assert.equal(tens.start, 0)
    assert.equal(tens.end, 1)
    assert.deepEqual(ones.glyphs, ['9', '0'])
    assert.equal(ones.start, 0)
    assert.equal(ones.end, 1)
    assert.ok(ones.delay < tens.delay)
  })

  it('rolls a drop downward', () => {
    const plan = planRoll('20', '19')
    assert.ok(plan)
    assert.equal(plan.direction, 'down')
    const tens = column(plan, 0)
    const ones = column(plan, 1)
    assert.equal(tens.glyphs[tens.start], '2')
    assert.equal(tens.glyphs[tens.end], '1')
    assert.equal(ones.glyphs[ones.start], '0')
    assert.equal(ones.glyphs[ones.end], '9')
    assert.ok(ones.end < ones.start)
  })

  it('slides each place once, ones first, even when the drop is large', () => {
    const plan = planRoll('38', '22')
    assert.ok(plan)
    assert.equal(plan.direction, 'down')
    const tens = column(plan, 0)
    const ones = column(plan, 1)
    assert.deepEqual(tens.glyphs, ['2', '3'])
    assert.equal(tens.start, 1)
    assert.equal(tens.end, 0)
    assert.deepEqual(ones.glyphs, ['2', '8'])
    assert.equal(ones.start, 1)
    assert.equal(ones.end, 0)
    assert.equal(ones.duration, tens.duration)
    assert.ok(ones.delay < tens.delay)
  })

  it('opens a new place when the number gains a digit', () => {
    const plan = planRoll('8', '10')
    assert.ok(plan)
    const tens = column(plan, 0)
    const ones = column(plan, 1)
    assert.equal(tens.enter, true)
    assert.equal(tens.glyphs[tens.start], ' ')
    assert.equal(tens.glyphs[tens.end], '1')
    assert.equal(ones.glyphs[ones.start], '8')
    assert.equal(ones.glyphs[ones.end], '0')
  })

  it('closes a place when the number loses a digit', () => {
    const plan = planRoll('10', '8')
    assert.ok(plan)
    const tens = column(plan, 0)
    assert.equal(tens.collapse, true)
    assert.equal(tens.glyphs[tens.start], '1')
    assert.equal(tens.glyphs[tens.end], ' ')
  })

  it('keeps the decimal point still and rolls each side', () => {
    const plan = planRoll('12.4', '8.0')
    assert.ok(plan)
    assert.equal(plan.direction, 'down')
    assert.equal(column(plan, 0).collapse, true)
    assert.equal(column(plan, 2).kind, 'point')
    assert.deepEqual(column(plan, 2).glyphs, ['.'])
    assert.equal(column(plan, 3).glyphs[column(plan, 3).start], '4')
    assert.equal(column(plan, 3).glyphs[column(plan, 3).end], '0')
    assert.equal(column(plan, 3).delay, 0)
  })

  it('does not move when the number is unchanged', () => {
    const plan = planRoll('15', '15')
    assert.ok(plan)
    assert.equal(plan.direction, 'none')
    assert.equal(column(plan, 0).duration, 0)
    assert.equal(column(plan, 1).duration, 0)
  })

  it('leaves a non-number alone', () => {
    assert.equal(planRoll('—', '4.0'), null)
    assert.equal(planRoll('4.0', '—'), null)
  })
})

describe('sourceValueForRun', () => {
  const ranks = [12, 12, 15, 15, 18, 18, 22, 22, 26, 26, 30, 30, 34, 34, 38, 38, 42, 42, 46, 46, 52]

  it('keeps a rank that was already on screen', () => {
    const narrow = displayAxisFor(axisForDays(7)).map((day) => day.iso)
    const wide = displayAxisFor(axisForDays(14)).map((day) => day.iso)
    const previous = valuesByIso(ranks, narrow)
    assert.equal(previous.get('2026-09-24'), 52)
    assert.equal(previous.get('2026-09-18'), 38)
    const runs = toRuns(displayOrder(recentValues(ranks, 14)))
    const stayed = runs.filter((run) => wide.slice(run.startIndex, run.startIndex + run.length).every((iso) => previous.has(iso)))
    assert.ok(stayed.length > 0)
    for (const run of stayed) {
      assert.equal(sourceValueForRun(run, wide, previous), run.value)
    }
  })

  it('starts a newly revealed run from the nearest rank that was visible', () => {
    const narrow = displayAxisFor(axisForDays(7)).map((day) => day.iso)
    const wide = displayAxisFor(axisForDays(14)).map((day) => day.iso)
    const previous = valuesByIso(ranks, narrow)
    const runs = toRuns(displayOrder(recentValues(ranks, 14)))
    const revealed = runs.filter((run) =>
      wide.slice(run.startIndex, run.startIndex + run.length).every((iso) => !previous.has(iso)),
    )
    assert.deepEqual(
      revealed.map((run) => run.value),
      [34, 30, 26, 22],
    )
    for (const run of revealed) {
      assert.equal(sourceValueForRun(run, wide, previous), 38)
    }
  })

  it('does not invent a source on the first paint', () => {
    assert.equal(sourceValueForRun({ value: 12, startIndex: 0, length: 2 }, ['2026-09-24'], null), 12)
    assert.equal(sourceValueForRun({ value: null, startIndex: 0, length: 1 }, ['2026-09-24'], new Map()), null)
  })
})
