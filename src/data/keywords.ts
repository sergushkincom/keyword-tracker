import type { EventColor } from './events.ts'

export type ValueSubRow = {
  id: string
  name: string
  chip: string
  kind: 'values'
  values: number[]
  suffix?: string
}

export type BarSubRow = {
  id: string
  name: string
  chip: string
  kind: 'bar'
  label: string
  color: EventColor
  startDate: string
  endDate: string
}

export type SubRow = ValueSubRow | BarSubRow

export type Keyword = {
  id: string
  name: string
  labels: string[]
  ranks: (number | null)[]
  children?: SubRow[]
}

export const KEYWORDS: Keyword[] = [
  {
    id: 'shampoo-and-conditioner',
    name: 'shampoo and conditioner',
    labels: ['Brand', 'Hero'],
    ranks: [14, 14, 14, 14, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 16, 16, 16, 15, 15, 15],
  },
  {
    id: 'beauty',
    name: 'beauty',
    labels: ['Generic'],
    ranks: [12, 12, 15, 15, 18, 18, 22, 22, 26, 26, 30, 30, 34, 34, 38, 38, 42, 42, 46, 46, 52],
  },
  {
    id: 'shampoo',
    name: 'shampoo',
    labels: ['Hero', 'Brand', 'Core'],
    ranks: [6, 4, 5, 6, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 41, 87, 79, 74, 71],
  },
  {
    id: 'skin-care',
    name: 'skin care',
    labels: ['Category'],
    ranks: [21, 21, 21, 19, 19, 19, 19, 18, 18, 18, 18, 18, 25, 25, 25, 23, 23, 23, 20, 20, 20],
    children: [
      {
        id: 'ppc-sales',
        name: 'PPC Sales',
        chip: 'PPC',
        kind: 'values',
        values: [120, 120, 120, 140, 140, 140, 140, 155, 155, 155, 160, 160, 160, 160, 148, 148, 148, 170, 170, 170, 165],
      },
      {
        id: 'brand-analytics',
        name: 'Brand Analytics',
        chip: 'Search',
        kind: 'values',
        values: [48, 48, 48, 48, 52, 52, 52, 52, 52, 45, 45, 45, 45, 60, 60, 60, 58, 58, 58, 55, 55],
      },
      {
        id: 'sqp-market-share',
        name: 'SQP Market share',
        chip: 'SQP',
        kind: 'values',
        suffix: '%',
        values: [4.2, 4.2, 4.2, 4.6, 4.6, 4.6, 4.8, 4.8, 4.8, 4.8, 5.1, 5.1, 5.1, 5.1, 4.9, 4.9, 4.9, 5.4, 5.4, 5.4, 5.6],
      },
      {
        id: 'amazons-choice',
        name: "Amazon's Choice",
        chip: 'Badge',
        kind: 'bar',
        label: "Amazon's Choice",
        color: 'amber',
        startDate: '2026-09-10',
        endDate: '2026-09-17',
      },
    ],
  },
  {
    id: 'vitamin-c',
    name: 'vitamin c',
    labels: ['Ingredient'],
    ranks: [8, 8, 8, null, null, 7, 7, 7, 7, 6, null, 6, 6, 6, 5, 5, 5, 5, 9, 9, 9],
  },
  {
    id: 'collagen-peptides',
    name: 'collagen peptides',
    labels: ['Ingredient', 'Long-tail'],
    ranks: [44, 44, 44, 44, 44, 38, 38, 38, 38, 36, 36, 36, 52, 52, 52, 48, 48, 48, 47, 47, 47],
  },
  {
    id: 'the-ordinary',
    name: 'the ordinary',
    labels: ['Brand'],
    ranks: [3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 3, 3, 3, 3],
  },
  {
    id: 'retinol-serum',
    name: 'retinol serum',
    labels: ['Ingredient', 'Serum', 'Hero'],
    ranks: [28, 28, 28, null, null, 24, 24, 24, 24, 22, 22, 22, 30, 30, 30, 26, 26, null, 21, 21, 21],
  },
  {
    id: 'niacinamide',
    name: 'niacinamide',
    labels: ['Ingredient'],
    ranks: [8, 8, 8, 8, 8, 8, 8, 10, 10, 10, 10, 10, 10, 10, 9, 9, 9, 9, 9, 7, 7],
  },
  {
    id: 'face-moisturizer',
    name: 'face moisturizer',
    labels: ['Generic', 'Category'],
    ranks: [33, 33, 33, 29, 29, 29, 29, 27, 27, 27, 27, 35, 35, 35, 35, 32, 32, 32, 30, 30, 30],
  },
]

export function averageRank(ranks: readonly (number | null)[]): string {
  const present = ranks.filter((rank): rank is number => rank !== null)
  if (present.length === 0) return '—'
  const mean = present.reduce((sum, rank) => sum + rank, 0) / present.length
  return mean.toFixed(1)
}
