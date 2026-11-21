import { useLayoutEffect, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { cn } from '../lib/cn.ts'
import { planRoll, type RollColumn } from '../lib/roll.ts'

const STEP = 18
const EASE = 'cubic-bezier(.22, 1, .36, 1)'

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function reducedNow() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, reducedNow, () => false)
}

type RollingNumberProps = {
  value: string
  /** Shown only on mount, so a cell that appears with the new window can roll in. */
  from?: string
  suffix?: string
}

export function RollingNumber({ value, from, suffix }: RollingNumberProps) {
  const reduced = useReducedMotion()
  const [motion, setMotion] = useState(() => ({
    from: from ?? value,
    to: value,
    token: 0,
  }))
  if (motion.to !== value) {
    setMotion({ from: motion.to, to: value, token: motion.token + 1 })
  }
  if (reduced) {
    return (
      <span aria-hidden="true" className="tabular-nums">
        {value}
        {suffix}
      </span>
    )
  }
  return <Roller key={motion.token} from={motion.from} to={motion.to} value={value} suffix={suffix} />
}

function Roller({ from, to, value, suffix }: { from: string; to: string; value: string; suffix?: string }) {
  const plan = planRoll(from, to)
  const moves = plan?.columns.some((column) => column.start !== column.end) ?? false
  const [play, setPlay] = useState(false)
  const [settled, setSettled] = useState(!moves)
  const settleAt = plan ? Math.max(0, ...plan.columns.map((column) => column.delay + column.duration)) + 40 : 0
  useLayoutEffect(() => {
    if (!moves) return
    const frame = requestAnimationFrame(() => setPlay(true))
    const timer = window.setTimeout(() => setSettled(true), settleAt)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [moves, settleAt])

  if (!plan) {
    return (
      <span aria-hidden="true" className="tabular-nums">
        {value}
        {suffix}
      </span>
    )
  }

  return (
    <span aria-hidden="true" className="inline-flex h-[18px] items-stretch whitespace-nowrap tabular-nums">
      {plan.columns.map((column) => (
        <DigitWheel key={column.index} column={column} play={play} veil={play && !settled} />
      ))}
      {suffix ? <span className="leading-[18px]">{suffix}</span> : null}
    </span>
  )
}

function DigitWheel({ column, play, veil }: { column: RollColumn; play: boolean; veil: boolean }) {
  const index = play ? column.end : column.start
  const travel = column.start !== column.end
  const closed = (column.enter && !play) || (column.collapse && play)
  const timing = `${column.duration}ms ${EASE} ${column.delay}ms`
  const windowStyle: CSSProperties = {
    minWidth: 0,
    transition: play && travel ? `width ${timing}` : 'none',
  }
  if (column.kind === 'digit') windowStyle.width = closed ? 0 : '1ch'
  const stripStyle: CSSProperties = {
    transform: `translate3d(0, ${-index * STEP}px, 0)`,
    transition: play && travel ? `transform ${timing}` : 'none',
  }
  return (
    <span
      className={cn('roll-window block h-[18px] shrink-0 overflow-hidden', veil && travel && 'roll-veil')}
      style={windowStyle}
    >
      <span className="roll-strip block" style={stripStyle}>
        {column.glyphs.map((glyph, glyphIndex) => (
          <span key={glyphIndex} className="block h-[18px] text-center leading-[18px]">
            {glyph === ' ' ? '' : glyph}
          </span>
        ))}
      </span>
    </span>
  )
}
