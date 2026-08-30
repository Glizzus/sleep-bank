import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import SetupView from '@/views/SetupView.vue'
import BaselineRow from '@/components/BaselineRow.vue'
import WakeTimeRow from '@/components/WakeTimeRow.vue'

describe('SetupView', () => {
  it('renders the Baseline and Wake Time rows', () => {
    const wrapper = shallowMount(SetupView)
    expect(wrapper.findComponent(BaselineRow).exists()).toBe(true)
    expect(wrapper.findComponent(WakeTimeRow).exists()).toBe(true)
  })
})
