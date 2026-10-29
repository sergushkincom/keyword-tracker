export const RAMP = 'sequential' as 'sequential' | 'trafficLight'

const BANDS = [
  { max: 5, step: 1 },
  { max: 15, step: 2 },
  { max: 40, step: 3 },
  { max: 70, step: 4 },
  { max: 100, step: 5 },
] as const

export type RankStep = 1 | 2 | 3 | 4 | 5 | 6

export function rankStep(rank: number): RankStep {
  for (const band of BANDS) {
    if (rank <= band.max) return band.step
  }
  return 6
}

export function rankColor(rank: number): string {
  const step = rankStep(rank)
  return RAMP === 'trafficLight' ? `rank-tl-${step}` : `rank-seq-${step}`
}

export function rankText(rank: number): string {
  const step = rankStep(rank)
  return RAMP === 'trafficLight' ? `rank-tl-fg-${step}` : `rank-seq-fg-${step}`
}

export function rankColorTrafficLight(rank: number): string {
  return `rank-tl-${rankStep(rank)}`
}
