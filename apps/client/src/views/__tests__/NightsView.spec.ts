import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computed, ref } from 'vue'
import { shallowMount, type VueWrapper } from '@vue/test-utils'
import { useSleepLogs } from '@/composables/useSleepLogs'
import { usePreferences } from '@/composables/usePreferences'
import type { Preferences } from '@/queries/preferences'
import type { SleepLogNight } from '@/queries/sleepLogs'
import NightsView from '@/views/NightsView.vue'
import MonthCalendar from '@/components/MonthCalendar.vue'
import SleepLogSheet from '@/components/SleepLogSheet.vue'

vi.mock('@/composables/useSleepLogs')
vi.mock('@/composables/usePreferences')
vi.mock('@/lib/clock', () => ({
  today: () => new Date(2026, 7, 30),
  isToday: vi.fn(() => false),
}))
vi.mock('@/lib/clay', () => ({
  debtClayColor: vi.fn((shortfallMinutes: number) => `clay(${shortfallMinutes})`),
}))
vi.mock('@sleep-bank/logic', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  nightShortfall: vi.fn(() => 42),
  nightSleptMinutes: vi.fn(() => 450),
  formatDurationCompact: vi.fn((minutes: number) => `dur(${minutes})`),
}))

const saveNight = vi.fn(async () => {})
const deleteNight = vi.fn(async () => {})

const loggedNight: SleepLogNight = {
  wakeUpDate: '2026-08-12',
  entries: [{ startMinuteOfDay: 1380, endMinuteOfDay: 390 }],
}

function stub(nights: SleepLogNight[], preferences?: Preferences) {
  vi.mocked(useSleepLogs).mockReturnValue({
    nights: ref(nights),
    nightsByDate: computed(() => new Map(nights.map((night) => [night.wakeUpDate, night]))),
    saveNight,
    deleteNight,
  })
  vi.mocked(usePreferences).mockReturnValue({
    preferences: ref(preferences),
    setBaselineSleepMinutes: vi.fn(async () => {}),
    setWakeUpMinuteOfDay: vi.fn(async () => {}),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  stub([loggedNight], { baselineSleepMinutes: 480, wakeUpMinuteOfDay: 390 })
})

function paintOf(wrapper: VueWrapper) {
  return wrapper.getComponent(MonthCalendar).props('paint') as (d: Date) => string | undefined
}

async function selectDay(wrapper: VueWrapper, date: Date) {
  wrapper.getComponent(MonthCalendar).vm.$emit('selectDay', date)
  await wrapper.vm.$nextTick()
}

describe('NightsView', () => {
  it('opens the calendar on the current month', () => {
    const calendar = shallowMount(NightsView).getComponent(MonthCalendar)
    expect(calendar.props('year')).toBe(2026)
    expect(calendar.props('month')).toBe(7)
  })

  it('paints a logged night with the clay color of its shortfall', async () => {
    const { nightShortfall } = await import('@sleep-bank/logic')
    const paint = paintOf(shallowMount(NightsView))
    expect(paint(new Date(2026, 7, 12))).toBe('clay(42)')
    expect(vi.mocked(nightShortfall)).toHaveBeenCalledWith(loggedNight, 480)
  })

  it('paints nothing for unlogged days or before preferences load', () => {
    expect(paintOf(shallowMount(NightsView))(new Date(2026, 7, 13))).toBeUndefined()

    stub([loggedNight], undefined)
    expect(paintOf(shallowMount(NightsView))(new Date(2026, 7, 12))).toBeUndefined()
  })

  it('sublabels a logged night with its formatted slept time', async () => {
    const { nightSleptMinutes } = await import('@sleep-bank/logic')
    const wrapper = shallowMount(NightsView)
    const sublabel = wrapper.getComponent(MonthCalendar).props('sublabel') as (
      d: Date,
    ) => string | undefined
    expect(sublabel(new Date(2026, 7, 12))).toBe('dur(450)')
    expect(vi.mocked(nightSleptMinutes)).toHaveBeenCalledWith(loggedNight)
    expect(sublabel(new Date(2026, 7, 13))).toBeUndefined() // unlogged
  })

  it('opens the sheet on the selected day, prefilled from its night', async () => {
    const wrapper = shallowMount(NightsView)
    await selectDay(wrapper, new Date(2026, 7, 12))
    const sheet = wrapper.getComponent(SleepLogSheet)
    expect(sheet.props('open')).toBe(true)
    expect(sheet.props('date')).toEqual(new Date(2026, 7, 12))
    expect(sheet.props('initial')).toBe(loggedNight.entries)
  })

  it('opens the sheet unprefilled for an unlogged day', async () => {
    const wrapper = shallowMount(NightsView)
    await selectDay(wrapper, new Date(2026, 7, 13))
    const sheet = wrapper.getComponent(SleepLogSheet)
    expect(sheet.props('open')).toBe(true)
    expect(sheet.props('initial')).toBeUndefined()
  })

  it('saves through saveNight keyed by the selected date', async () => {
    const wrapper = shallowMount(NightsView)
    await selectDay(wrapper, new Date(2026, 7, 13))
    const segments = [
      { startMinuteOfDay: 1350, endMinuteOfDay: 420 },
      { startMinuteOfDay: 780, endMinuteOfDay: 840 },
    ]
    wrapper.getComponent(SleepLogSheet).vm.$emit('save', segments)
    expect(saveNight).toHaveBeenCalledWith('2026-08-13', segments)
  })

  it('clears through deleteNight keyed by the selected date', async () => {
    const wrapper = shallowMount(NightsView)
    await selectDay(wrapper, new Date(2026, 7, 12))
    wrapper.getComponent(SleepLogSheet).vm.$emit('clear')
    expect(deleteNight).toHaveBeenCalledWith('2026-08-12')
  })
})
