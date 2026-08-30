import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computed, toValue } from 'vue'
import { mount } from '@vue/test-utils'
import FifteenMinuteStepper from '../FifteenMinuteStepper.vue'
import { useFifteenMinuteStepper } from '@/composables/useFifteenMinuteStepper'

vi.mock('@/composables/useFifteenMinuteStepper')

const step = vi.fn()
const mocked = vi.mocked(useFifteenMinuteStepper)

function stub({ down = true, up = true } = {}) {
  mocked.mockReturnValue({
    step,
    canStepDown: computed(() => down),
    canStepUp: computed(() => up),
  })
}

function mountStepper() {
  return mount(FifteenMinuteStepper, {
    props: { modelValue: 390, min: 60, max: 720, wrap: true },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  stub()
})

describe('FifteenMinuteStepper', () => {
  it('passes its model and props through to the composable', () => {
    mountStepper()
    const [value, options] = mocked.mock.calls[0]!
    expect(value.value).toBe(390)
    expect(toValue(options!.min)).toBe(60)
    expect(toValue(options!.max)).toBe(720)
    expect(toValue(options!.wrap)).toBe(true)
  })

  it('steps −1 on the minus button and +1 on the plus button', async () => {
    const wrapper = mountStepper()
    await wrapper.get('[aria-label="15 minutes less"]').trigger('click')
    expect(step).toHaveBeenLastCalledWith(-1)
    await wrapper.get('[aria-label="15 minutes more"]').trigger('click')
    expect(step).toHaveBeenLastCalledWith(1)
  })

  it('disables the buttons from canStepDown/canStepUp', () => {
    stub({ down: false, up: true })
    const wrapper = mountStepper()
    expect(wrapper.get('[aria-label="15 minutes less"]').attributes()).toHaveProperty('disabled')
    expect(wrapper.get('[aria-label="15 minutes more"]').attributes()).not.toHaveProperty(
      'disabled',
    )
  })
})
