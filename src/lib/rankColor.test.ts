import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { RAMP, rankColor, rankColorTrafficLight, rankStep, rankText } from './rankColor.ts'

// Upper edge of each band, the first rank of the next band, and a point past 100.
const BANDS = [
  { rank: 1, step: 1 },
  { rank: 5, step: 1 },
  { rank: 5.1, step: 2 },
  { rank: 6, step: 2 },
  { rank: 15, step: 2 },
  { rank: 16, step: 3 },
  { rank: 40, step: 3 },
  { rank: 41, step: 4 },
  { rank: 70, step: 4 },
  { rank: 71, step: 5 },
  { rank: 100, step: 5 },
  { rank: 101, step: 6 },
  { rank: 250, step: 6 },
] as const

describe('rankStep', () => {
  it('maps a rank onto the six ordered bands', () => {
    for (const { rank, step } of BANDS) {
      assert.equal(rankStep(rank), step, `rank ${rank}`)
    }
  })
})

describe('rank colors', () => {
  it('paints the sequential ramp while that ramp is selected', () => {
    assert.equal(RAMP, 'sequential')
    for (const { rank, step } of BANDS) {
      assert.equal(rankColor(rank), `rank-seq-${step}`, `rank ${rank}`)
      assert.equal(rankText(rank), `rank-seq-fg-${step}`, `rank ${rank}`)
    }
  })

  it('keeps traffic-light class names available for comparison', () => {
    for (const { rank, step } of BANDS) {
      assert.equal(rankColorTrafficLight(rank), `rank-tl-${step}`, `rank ${rank}`)
    }
  })
})
