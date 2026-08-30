import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CalendarCell from '../CalendarCell.vue'

describe('CalendarCell', () => {
  it('renders the day of month as the button text', () => {
    const wrapper = mount(CalendarCell, { props: { dayOfMonth: 17 } })
    expect(wrapper.get('button').text()).toBe('17')
  })

  it('marks today with the cell--today class, and only today', () => {
    const plain = mount(CalendarCell, { props: { dayOfMonth: 1 } })
    expect(plain.get('button').classes()).not.toContain('cell--today')

    const today = mount(CalendarCell, { props: { dayOfMonth: 1, today: true } })
    expect(today.get('button').classes()).toContain('cell--today')
  })

  it('wires paint to the inline background, and leaves it unset without paint', () => {
    const painted = mount(CalendarCell, { props: { dayOfMonth: 1, paint: 'rgb(200, 0, 0)' } })
    expect(painted.get('button').attributes('style')).toContain('background: rgb(200, 0, 0)')

    const unpainted = mount(CalendarCell, { props: { dayOfMonth: 1 } })
    expect(unpainted.get('button').attributes('style')).toBeUndefined()
  })

  it('renders the sublabel under the day, and omits it without one', () => {
    const withLabel = mount(CalendarCell, { props: { dayOfMonth: 12, sublabel: '0h 30m' } })
    expect(withLabel.get('.sublabel').text()).toBe('0h 30m')
    expect(withLabel.get('button').text()).toContain('12')

    const without = mount(CalendarCell, { props: { dayOfMonth: 12 } })
    expect(without.find('.sublabel').exists()).toBe(false)
  })

  it('passes clicks through to the parent', async () => {
    const onClick = vi.fn()
    const wrapper = mount(CalendarCell, { props: { dayOfMonth: 1 }, attrs: { onClick } })
    await wrapper.get('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
