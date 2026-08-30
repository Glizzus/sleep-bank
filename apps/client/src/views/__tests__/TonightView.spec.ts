import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computed, ref, type Ref } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { usePreferences } from '@/composables/usePreferences'
import { useSleepDebt } from '@/composables/useSleepDebt'
import type { Preferences } from '@/queries/preferences'
import TonightView from '@/views/TonightView.vue'

vi.mock('@/composables/usePreferences')
vi.mock('@/composables/useSleepDebt')
vi.mock('@sleep-bank/logic', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  formatDuration: vi.fn((minutes: number) => `dur(${minutes})`),
  formatTimeOfDay: vi.fn((minutes: number) => `time(${minutes})`),
  tonightTargetMinutes: vi.fn(() => 570),
  bedtimeMinuteOfDay: vi.fn(() => 1260),
}))

function stub(debt: number | undefined, preferences?: Preferences) {
  vi.mocked(usePreferences).mockReturnValue({
    preferences: ref(preferences),
    setBaselineSleepMinutes: vi.fn(async () => {}),
    setWakeUpMinuteOfDay: vi.fn(async () => {}),
  })
  vi.mocked(useSleepDebt).mockReturnValue({
    debt: computed(() => debt),
    refresh: vi.fn(async () => {}),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  stub(90, { baselineSleepMinutes: 480, wakeUpMinuteOfDay: 390 })
})

describe('TonightView', () => {
  it('hands the baseline preference to useSleepDebt', () => {
    shallowMount(TonightView)
    const [baseline] = vi.mocked(useSleepDebt).mock.calls[0]! as [
      Ref<number | undefined> | (() => number | undefined),
    ]
    expect(typeof baseline === 'function' ? baseline() : baseline.value).toBe(480)
  })

  it('shows the formatted debt figure', () => {
    const wrapper = shallowMount(TonightView)
    expect(wrapper.get('.debt .stat-figure').text()).toBe('dur(90)')
  })

  it('shows the bedtime from baseline, wake-up time, and debt', async () => {
    const { tonightTargetMinutes, bedtimeMinuteOfDay } = await import('@sleep-bank/logic')
    const wrapper = shallowMount(TonightView)
    expect(vi.mocked(tonightTargetMinutes)).toHaveBeenCalledWith(480, 90)
    expect(vi.mocked(bedtimeMinuteOfDay)).toHaveBeenCalledWith(390, 570)
    expect(wrapper.get('.bedtime .stat-figure').text()).toBe('time(1260)')
  })

  it('shows nothing until the debt is known', () => {
    stub(undefined)
    const wrapper = shallowMount(TonightView)
    expect(wrapper.find('.stat').exists()).toBe(false)
  })
})
