import { onScopeDispose } from 'vue'

/* hold feel: fire on press, wait, then repeat with a shrinking interval */
const INITIAL_DELAY_MS = 350
const START_INTERVAL_MS = 150
/** floor, so a long hold tops out at ~25 fires/second */
const MIN_INTERVAL_MS = 40
/** interval multiplier per repeat */
const ACCELERATION = 0.85

/**
 * Press-and-hold with acceleration for a button. Fires once on pointer press,
 * then repeats faster the longer the press is held. Spread onto the button
 * with v-on; keyboard activation (Enter/Space) still fires once per press.
 */
export function usePressAndHold(fire: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined

  function repeat(interval: number) {
    timer = setTimeout(() => {
      fire()
      repeat(Math.max(MIN_INTERVAL_MS, interval * ACCELERATION))
    }, interval)
  }

  function pointerdown() {
    release()
    fire()
    timer = setTimeout(() => {
      fire()
      repeat(START_INTERVAL_MS)
    }, INITIAL_DELAY_MS)
  }

  function release() {
    clearTimeout(timer)
    timer = undefined
  }

  /* a pointer press already fired on pointerdown and ends in a click with
     detail >= 1; keyboard activation arrives as a click with detail 0 */
  function click(event: MouseEvent) {
    if (event.detail === 0) fire()
  }

  onScopeDispose(release)

  return {
    pointerdown,
    pointerup: release,
    pointerleave: release,
    pointercancel: release,
    click,
  }
}
