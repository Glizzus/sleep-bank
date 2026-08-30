import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { formatTimeOfDay } from '@sleep-bank/logic'
import WakeTimeRow from '../WakeTimeRow.vue'
import SettingRow from '../SettingRow.vue'
import FifteenMinuteStepper from '../FifteenMinuteStepper.vue'

vi.mock('@sleep-bank/logic', () => ({
  formatTimeOfDay: vi.fn((minutes: number) => `time(${minutes})`),
}))

function mountRow() {
  return mount(WakeTimeRow)
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

  it('owns its value, defaulting to 6:30 AM and stepping in place', async () => {
    const wrapper = mountRow()
    const stepper = wrapper.getComponent(FifteenMinuteStepper)
    expect(stepper.props('modelValue')).toBe(390)
    await wrapper.get('[aria-label="15 minutes more"]').trigger('click')
    expect(stepper.props('modelValue')).toBe(405)
  })

  it('wraps across midnight instead of clamping', async () => {
    const wrapper = mountRow()
    const minus = wrapper.get('[aria-label="15 minutes less"]')
    /* 6:30 AM is 26 steps above midnight */
    for (let i = 0; i < 26; i++) await minus.trigger('click')
    const stepper = wrapper.getComponent(FifteenMinuteStepper)
    expect(stepper.props('modelValue')).toBe(0)
    await minus.trigger('click')
    expect(stepper.props('modelValue')).toBe(1425)
  })

  it('formats the value with formatTimeOfDay', () => {
    const wrapper = mountRow()
    expect(vi.mocked(formatTimeOfDay)).toHaveBeenCalledWith(390)
    expect(wrapper.text()).toContain('time(390)')
  })
})
