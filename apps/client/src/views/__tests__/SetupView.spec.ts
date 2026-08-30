import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { usePreferences } from '@/composables/usePreferences'
import type { Preferences } from '@/queries/preferences'
import SetupView from '@/views/SetupView.vue'
import BaselineRow from '@/components/BaselineRow.vue'
import WakeTimeRow from '@/components/WakeTimeRow.vue'

vi.mock('@/composables/usePreferences')

const setBaselineSleepMinutes = vi.fn(async () => {})
const setWakeUpMinuteOfDay = vi.fn(async () => {})

function stub(preferences?: Preferences) {
  vi.mocked(usePreferences).mockReturnValue({
    preferences: ref(preferences),
    setBaselineSleepMinutes,
    setWakeUpMinuteOfDay,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  stub({ baselineSleepMinutes: 555, wakeUpMinuteOfDay: 375 })
})

describe('SetupView', () => {
  it('renders both rows with the stored preferences', () => {
    const wrapper = shallowMount(SetupView)
    expect(wrapper.getComponent(BaselineRow).props('modelValue')).toBe(555)
    expect(wrapper.getComponent(WakeTimeRow).props('modelValue')).toBe(375)
  })

  it('renders no rows until preferences load', () => {
    stub(undefined)
    const wrapper = shallowMount(SetupView)
    expect(wrapper.findComponent(BaselineRow).exists()).toBe(false)
    expect(wrapper.findComponent(WakeTimeRow).exists()).toBe(false)
  })

  it('persists row updates through the setters', () => {
    const wrapper = shallowMount(SetupView)
    wrapper.getComponent(BaselineRow).vm.$emit('update:modelValue', 570)
    expect(setBaselineSleepMinutes).toHaveBeenCalledWith(570)
    wrapper.getComponent(WakeTimeRow).vm.$emit('update:modelValue', 405)
    expect(setWakeUpMinuteOfDay).toHaveBeenCalledWith(405)
  })
})
