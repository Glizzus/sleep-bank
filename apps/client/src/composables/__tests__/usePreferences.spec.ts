import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import {
  getPreferences,
  updateBaselineSleepMinutes,
  updateWakeUpMinuteOfDay,
} from '@/queries/preferences'
import { usePreferences } from '../usePreferences'

vi.mock('@/queries/preferences')

const stored = { baselineSleepMinutes: 480, wakeUpMinuteOfDay: 390 }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getPreferences).mockResolvedValue(stored)
})

describe('usePreferences', () => {
  it('loads preferences on first use', async () => {
    const { preferences } = usePreferences()
    expect(preferences.value).toBeUndefined()
    await flushPromises()
    expect(preferences.value).toEqual(stored)
  })

  it('setBaselineSleepMinutes writes, then repulls', async () => {
    const updated = { ...stored, baselineSleepMinutes: 495 }
    const { preferences, setBaselineSleepMinutes } = usePreferences()
    await flushPromises()
    vi.mocked(getPreferences).mockResolvedValue(updated)
    await setBaselineSleepMinutes(495)
    expect(updateBaselineSleepMinutes).toHaveBeenCalledWith(495)
    expect(preferences.value).toEqual(updated)
  })

  it('setWakeUpMinuteOfDay writes, then repulls', async () => {
    const updated = { ...stored, wakeUpMinuteOfDay: 405 }
    const { preferences, setWakeUpMinuteOfDay } = usePreferences()
    await flushPromises()
    vi.mocked(getPreferences).mockResolvedValue(updated)
    await setWakeUpMinuteOfDay(405)
    expect(updateWakeUpMinuteOfDay).toHaveBeenCalledWith(405)
    expect(preferences.value).toEqual(updated)
  })
})
