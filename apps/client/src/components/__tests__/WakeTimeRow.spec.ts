import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { formatTimeOfDay } from '@sleep-bank/logic'
import WakeTimeRow from '../WakeTimeRow.vue'
import SettingRow from '../SettingRow.vue'
import FifteenMinuteStepper from '../FifteenMinuteStepper.vue'

vi.mock('@sleep-bank/logic', () => ({
  formatTimeOfDay: vi.fn((minutes: number) => `time(${minutes})`),
}))

function mountRow(modelValue = 390) {
  return mount(WakeTimeRow, { props: { modelValue } })
}

describe('WakeTimeRow', () => {
  it('labels the SettingRow "Wake Time"', () => {
    expect(mountRow().getComponent(SettingRow).props('label')).toBe('Wake Time')
  })

  it('spans the full day in wrap mode', () => {
    const stepper = mountRow().getComponent(FifteenMinuteStepper)
    expect(stepper.props('min')).toBe(0)
    expect(stepper.props('max')).toBe(1425)
    expect(stepper.props('wrap')).toBe(true)
  })

  it('passes the model to the stepper and re-emits updates', async () => {
    const wrapper = mountRow(390)
    expect(wrapper.getComponent(FifteenMinuteStepper).props('modelValue')).toBe(390)
    await wrapper.get('[aria-label="15 minutes more"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[405]])
  })

  it('wraps across midnight instead of clamping', async () => {
    const wrapper = mountRow(0)
    await wrapper.get('[aria-label="15 minutes less"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[1425]])
  })

  it('formats the value with formatTimeOfDay', () => {
    const wrapper = mountRow(390)
    expect(vi.mocked(formatTimeOfDay)).toHaveBeenCalledWith(390)
    expect(wrapper.text()).toContain('time(390)')
  })
})
