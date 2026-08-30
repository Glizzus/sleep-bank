import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useFifteenMinuteStepper } from '../useFifteenMinuteStepper'

describe('useFifteenMinuteStepper', () => {
  it('steps the value by 15 in either direction', () => {
    const value = ref(480)
    const { step } = useFifteenMinuteStepper(value)
    step(1)
    expect(value.value).toBe(495)
    step(-1)
    step(-1)
    expect(value.value).toBe(465)
  })

  it('clamps at min and max by default', () => {
    const value = ref(60)
    const { step } = useFifteenMinuteStepper(value, { min: 60, max: 720 })
    step(-1)
    expect(value.value).toBe(60)
    value.value = 720
    step(1)
    expect(value.value).toBe(720)
  })

  it('defaults to min 0 and no max', () => {
    const value = ref(0)
    const { step } = useFifteenMinuteStepper(value)
    step(-1)
    expect(value.value).toBe(0)
    value.value = 100_000
    step(1)
    expect(value.value).toBe(100_015)
  })

  it('reports canStepDown/canStepUp at the bounds', () => {
    const value = ref(60)
    const { canStepDown, canStepUp } = useFifteenMinuteStepper(value, { min: 60, max: 720 })
    expect(canStepDown.value).toBe(false)
    expect(canStepUp.value).toBe(true)
    value.value = 720
    expect(canStepDown.value).toBe(true)
    expect(canStepUp.value).toBe(false)
  })

  it('wraps across the bounds when wrap is set', () => {
    const value = ref(0)
    const { step, canStepDown, canStepUp } = useFifteenMinuteStepper(value, {
      max: 1425,
      wrap: true,
    })
    step(-1)
    expect(value.value).toBe(1425)
    step(1)
    expect(value.value).toBe(0)
    expect(canStepDown.value).toBe(true)
    expect(canStepUp.value).toBe(true)
  })

  it('reacts to option getters changing', () => {
    const value = ref(120)
    const min = ref(60)
    const { canStepDown } = useFifteenMinuteStepper(value, { min })
    expect(canStepDown.value).toBe(true)
    min.value = 120
    expect(canStepDown.value).toBe(false)
  })
})
