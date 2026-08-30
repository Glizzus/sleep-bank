import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { formatDuration } from '@sleep-bank/logic'
import BaselineRow from '../BaselineRow.vue'
import SettingRow from '../SettingRow.vue'
import FifteenMinuteStepper from '../FifteenMinuteStepper.vue'

vi.mock('@sleep-bank/logic', () => ({
  formatDuration: vi.fn((minutes: number) => `dur(${minutes})`),
}))

function mountRow(modelValue = 480) {
  return mount(BaselineRow, { props: { modelValue } })
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

  it('passes the model to the stepper and re-emits updates', async () => {
    const wrapper = mountRow(480)
    expect(wrapper.getComponent(FifteenMinuteStepper).props('modelValue')).toBe(480)
    await wrapper.get('[aria-label="15 minutes more"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[495]])
  })

  it('formats the value with formatDuration', () => {
    const wrapper = mountRow(480)
    expect(vi.mocked(formatDuration)).toHaveBeenCalledWith(480)
    expect(wrapper.text()).toContain('dur(480)')
  })
})
