import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { usePressAndHold } from '../usePressAndHold'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function pressed() {
  const fire = vi.fn()
  const hold = usePressAndHold(fire)
  hold.pointerdown()
  return { fire, hold }
}

describe('usePressAndHold', () => {
  it('fires once immediately on press', () => {
    const { fire } = pressed()
    expect(fire).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(349)
    expect(fire).toHaveBeenCalledTimes(1)
  })

  it('repeats after the initial delay, accelerating', () => {
    const { fire } = pressed()
    vi.advanceTimersByTime(350)
    expect(fire).toHaveBeenCalledTimes(2)
    vi.advanceTimersByTime(150)
    expect(fire).toHaveBeenCalledTimes(3)
    /* next interval shrinks to 150 * 0.85 = 127.5 */
    vi.advanceTimersByTime(128)
    expect(fire).toHaveBeenCalledTimes(4)
  })

  it('tops out at the minimum interval on a long hold', () => {
    const { fire } = pressed()
    vi.advanceTimersByTime(10_000)
    const before = fire.mock.calls.length
    vi.advanceTimersByTime(400)
    expect(fire.mock.calls.length - before).toBe(10) // one per 40ms floor
  })

  it('stops on release and on pointer leave/cancel', () => {
    const { fire, hold } = pressed()
    hold.pointerup()
    vi.advanceTimersByTime(10_000)
    expect(fire).toHaveBeenCalledTimes(1)

    hold.pointerdown()
    hold.pointerleave()
    vi.advanceTimersByTime(10_000)
    expect(fire).toHaveBeenCalledTimes(2)
  })

  it('fires on keyboard clicks but not on pointer-session clicks', () => {
    const fire = vi.fn()
    const hold = usePressAndHold(fire)
    hold.click(new MouseEvent('click', { detail: 0 })) // keyboard
    expect(fire).toHaveBeenCalledTimes(1)
    hold.click(new MouseEvent('click', { detail: 1 })) // follows a pointerdown
    expect(fire).toHaveBeenCalledTimes(1)
  })

  it('stops when its scope is disposed mid-hold', () => {
    const fire = vi.fn()
    const scope = effectScope()
    const hold = scope.run(() => usePressAndHold(fire))!
    hold.pointerdown()
    scope.stop()
    vi.advanceTimersByTime(10_000)
    expect(fire).toHaveBeenCalledTimes(1)
  })
})
