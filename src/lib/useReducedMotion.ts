import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function reducedNow() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, reducedNow, () => false)
}
