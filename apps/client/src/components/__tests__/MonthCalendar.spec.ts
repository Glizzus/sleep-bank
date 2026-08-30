import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MonthCalendar from '../MonthCalendar.vue'
import MonthNav from '../MonthNav.vue'
import CalendarCell from '../CalendarCell.vue'

vi.mock('@/lib/clock', () => ({
  isToday: vi.fn((date: Date) => date.getDate() === 15),
}))

/* August 2026: starts Saturday, 31 days -> 6 leading blanks, 42-slot grid */
function mountCalendar(props: Record<string, unknown> = {}) {
  return mount(MonthCalendar, { props: { year: 2026, month: 7, ...props } })
}

describe('MonthCalendar', () => {
  it('renders a MonthNav labeled with the visible month', () => {
    const nav = mountCalendar().getComponent(MonthNav)
    expect(nav.props('label')).toBe('August 2026')
  })

  it('shifts the month models from nav events, rolling over the year', async () => {
    const wrapper = mountCalendar({ year: 2026, month: 0 })
    wrapper.getComponent(MonthNav).vm.$emit('prev')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:year')).toEqual([[2025]])
    expect(wrapper.emitted('update:month')).toEqual([[11]])
  })

  it('renders one cell per day and blanks for the offset', () => {
    const wrapper = mountCalendar()
    const cells = wrapper.findAllComponents(CalendarCell)
    expect(cells).toHaveLength(31)
    expect(cells[0]!.text()).toBe('1')
    expect(cells[30]!.text()).toBe('31')
    expect(wrapper.findAll('.blank')).toHaveLength(11) // 6 leading + 5 trailing
  })

  it('marks only the cell isToday says is today', () => {
    const cells = mountCalendar().findAllComponents(CalendarCell)
    const todayCells = cells.filter((cell) => cell.props('today'))
    expect(todayCells).toHaveLength(1)
    expect(todayCells[0]!.text()).toBe('15')
  })

  it('paints each cell from the paint callback by date', () => {
    const paint = vi.fn((date: Date) => (date.getDate() === 3 ? 'rgb(200, 0, 0)' : undefined))
    const cells = mountCalendar({ paint }).findAllComponents(CalendarCell)
    expect(cells[2]!.props('paint')).toBe('rgb(200, 0, 0)')
    expect(cells[3]!.props('paint')).toBeUndefined()
    expect(paint).toHaveBeenCalledTimes(31)
  })

  it('sublabels each cell from the sublabel callback by date', () => {
    const sublabel = vi.fn((date: Date) => (date.getDate() === 3 ? '0h 30m' : undefined))
    const cells = mountCalendar({ sublabel }).findAllComponents(CalendarCell)
    expect(cells[2]!.props('sublabel')).toBe('0h 30m')
    expect(cells[3]!.props('sublabel')).toBeUndefined()
  })

  it('emits selectDay with the cell date on click', async () => {
    const wrapper = mountCalendar()
    await wrapper.findAllComponents(CalendarCell)[4]!.trigger('click')
    expect(wrapper.emitted('selectDay')).toEqual([[new Date(2026, 7, 5)]])
  })
})
