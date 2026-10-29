export type Run = {
  value: number | null
  startIndex: number
  length: number
}

export function toRuns(values: readonly (number | null)[]): Run[] {
  const runs: Run[] = []
  values.forEach((value, index) => {
    const last = runs[runs.length - 1]
    if (last && last.value === value) {
      last.length += 1
      return
    }
    runs.push({ value, startIndex: index, length: 1 })
  })
  return runs
}

export function displayOrder<T>(values: readonly T[]): T[] {
  return [...values].reverse()
}
