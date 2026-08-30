import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { formatDuration } from '@sleep-bank/logic'
import BaselineRow from '../BaselineRow.vue'
import SettingRow from '../SettingRow.vue'
import FifteenMinuteStepper from '../FifteenMinuteStepper.vue'

vi.mock('@sleep-bank/logic', () => ({
  formatDuration: vi.fn((minutes: number) => `dur(${minutes})`),
}))

function mountRow() {
  return mount(BaselineRow)
}

describe('BaselineRow', () => {
  it('labels the SettingRow "Baseline"', () => {
    expect(mountRow().getComponent(SettingRow).props('label')).toBe('Baseline')
  })

  it('bounds the stepper to 1h–12h, clamping', () => {
    const stepper = mountRow().getComponent(FifteenMinuteStepper)
    expect(stepper.props('min')).toBe(60)
    expect(stepper.props('max')).toBe(720)
    expect(stepper.props('wrap')).toBe(false)
  })

  it('owns its value, defaulting to 8h and stepping in place', async () => {
    const wrapper = mountRow()
    const stepper = wrapper.getComponent(FifteenMinuteStepper)
    expect(stepper.props('modelValue')).toBe(480)
    await wrapper.get('[aria-label="15 minutes more"]').trigger('click')
    expect(stepper.props('modelValue')).toBe(495)
  })

  it('formats the value with formatDuration', () => {
    const wrapper = mountRow()
    expect(vi.mocked(formatDuration)).toHaveBeenCalledWith(480)
    expect(wrapper.text()).toContain('dur(480)')
  })
})
