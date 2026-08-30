import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingRow from '../SettingRow.vue'

describe('SettingRow', () => {
  it('renders the label in the span', () => {
    const wrapper = mount(SettingRow, {
      props: { label: 'Baseline' },
    })
    expect(wrapper.find('span').text()).toBe('Baseline')
  })

  it('renders slot content', () => {
    const wrapper = mount(SettingRow, {
      props: { label: 'Wake Time' },
      slots: { default: '<button data-testid="control">+</button>' },
    })
    expect(wrapper.find('[data-testid="control"]').exists()).toBe(true)
  })
})
