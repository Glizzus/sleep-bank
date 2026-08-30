import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MonthNav from '../MonthNav.vue'

describe('MonthNav', () => {
  it('renders the label', () => {
    const wrapper = mount(MonthNav, { props: { label: 'August 2026' } })
    expect(wrapper.get('span').text()).toBe('August 2026')
  })

  it('emits prev and next from the arrow buttons', async () => {
    const wrapper = mount(MonthNav, { props: { label: 'August 2026' } })
    await wrapper.get('[aria-label="Previous month"]').trigger('click')
    await wrapper.get('[aria-label="Next month"]').trigger('click')
    expect(wrapper.emitted('prev')).toHaveLength(1)
    expect(wrapper.emitted('next')).toHaveLength(1)
  })
})
