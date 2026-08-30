import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { RouterView } from 'vue-router'
import App from '@/App.vue'
import BottomNav from '@/components/BottomNav.vue'
import { router } from '@/router'

describe('App', () => {
  it('renders the RouterView and the BottomNav', () => {
    const wrapper = shallowMount(App, { global: { plugins: [router] } })
    expect(wrapper.findComponent(RouterView).exists()).toBe(true)
    expect(wrapper.findComponent(BottomNav).exists()).toBe(true)
  })
})
