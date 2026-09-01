import { describe, it, expect, vi } from 'vitest'
import { mount, config } from '@vue/test-utils'
import { formatNightDate } from '@sleep-bank/logic'
import SleepLogSheet from '../SleepLogSheet.vue'
import SleepSegmentRow from '../SleepSegmentRow.vue'
import FifteenMinuteTimeOfDayStepper from '../FifteenMinuteTimeOfDayStepper.vue'

vi.mock('@sleep-bank/logic', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  formatDuration: vi.fn((minutes: number) => `dur(${minutes})`),
  formatNightDate: vi.fn(() => 'the night'),
}))

/* the reka-ui sheet portals to document.body; stubbed so the spec tests our
   wiring, not the dialog library */
config.renderStubDefaultSlot = true
const sheetStubs = {
  Sheet: true,
  SheetContent: true,
  SheetHeader: true,
  SheetTitle: true,
  SheetFooter: true,
}

function mountSheet(props: Record<string, unknown> = {}) {
  return mount(SleepLogSheet, {
    props: { open: true, date: new Date(2026, 7, 12), ...props },
    global: { stubs: sheetStubs },
  })
}

function steppers(wrapper: ReturnType<typeof mountSheet>) {
  return wrapper.findAllComponents(FifteenMinuteTimeOfDayStepper)
}

describe('SleepLogSheet', () => {
  it('renders the Asleep and Awake steppers', () => {
    const wrapper = mountSheet()
    expect(steppers(wrapper)).toHaveLength(2)
    expect(wrapper.text()).toContain('Asleep')
    expect(wrapper.text()).toContain('Awake')
  })

  it('titles the sheet with the formatted night date', () => {
    const wrapper = mountSheet()
    expect(vi.mocked(formatNightDate)).toHaveBeenCalledWith(new Date(2026, 7, 12))
    expect(wrapper.text()).toContain('the night')
  })

  it('shows the slept duration, live from the stepper values', async () => {
    const wrapper = mountSheet()
    /* defaults 1380 -> 390 span 450 minutes */
    expect(wrapper.text()).toContain('dur(450)')
    steppers(wrapper)[0]!.vm.$emit('update:modelValue', 1320)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('dur(510)')
  })

  it('prefills the steppers from initial when opened', async () => {
    const wrapper = mountSheet({
      open: false,
      initial: [{ startMinuteOfDay: 1350, endMinuteOfDay: 420 }],
    })
    await wrapper.setProps({ open: true })
    expect(steppers(wrapper)[0]!.props('modelValue')).toBe(1350)
    expect(steppers(wrapper)[1]!.props('modelValue')).toBe(420)
  })

  it('resets the steppers to defaults when opened unlogged', async () => {
    const wrapper = mountSheet({ open: false, initial: undefined })
    await wrapper.setProps({ open: true })
    expect(steppers(wrapper)[0]!.props('modelValue')).toBe(1380)
    expect(steppers(wrapper)[1]!.props('modelValue')).toBe(390)
  })

  it('saves the edited segments and closes', async () => {
    const wrapper = mountSheet()
    steppers(wrapper)[0]!.vm.$emit('update:modelValue', 1350)
    steppers(wrapper)[1]!.vm.$emit('update:modelValue', 420)
    await wrapper.findAll('button').find((b) => b.text() === '+ Add Segment')!.trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Save')!.trigger('click')
    expect(wrapper.emitted('save')).toEqual([
      [
        [
          { startMinuteOfDay: 1350, endMinuteOfDay: 420 },
          { startMinuteOfDay: 780, endMinuteOfDay: 840 },
        ],
      ],
    ])
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('adds numbered segment rows after Main, starting at 2', async () => {
    const wrapper = mountSheet()
    const addSegment = wrapper.findAll('button').find((b) => b.text() === '+ Add Segment')!
    await addSegment.trigger('click')
    await addSegment.trigger('click')
    const labels = wrapper.findAllComponents(SleepSegmentRow).map((row) => row.props('label'))
    expect(labels).toEqual(['Main', 'Segment 2', 'Segment 3'])
  })

  it('marks rows removable only when there are two or more', async () => {
    const wrapper = mountSheet()
    const row = () => wrapper.findComponent(SleepSegmentRow)
    expect(row().props('removable')).toBe(false)
    await wrapper.findAll('button').find((b) => b.text() === '+ Add Segment')!.trigger('click')
    expect(row().props('removable')).toBe(true)
  })

  it('removing a row shifts labels, back down to a lone Main', async () => {
    const wrapper = mountSheet({
      initial: [
        { startMinuteOfDay: 1380, endMinuteOfDay: 390 },
        { startMinuteOfDay: 780, endMinuteOfDay: 840 },
      ],
      open: false,
    })
    await wrapper.setProps({ open: true })

    /* removing Main promotes Segment 2 */
    wrapper.findAllComponents(SleepSegmentRow)[0]!.vm.$emit('remove')
    await wrapper.vm.$nextTick()
    const remaining = wrapper.findAllComponents(SleepSegmentRow)
    expect(remaining.map((row) => row.props('label'))).toEqual(['Main'])
    expect(remaining[0]!.props('asleep')).toBe(780)

    /* the x only edits the sheet; nothing is saved until Save */
    expect(wrapper.emitted('save')).toBeUndefined()
    await wrapper.findAll('button').find((b) => b.text() === 'Save')!.trigger('click')
    expect(wrapper.emitted('save')).toEqual([[[{ startMinuteOfDay: 780, endMinuteOfDay: 840 }]]])
  })

  it('resets back to just the Main segment when reopened', async () => {
    const wrapper = mountSheet()
    await wrapper.findAll('button').find((b) => b.text() === '+ Add Segment')!.trigger('click')
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    expect(wrapper.findAllComponents(SleepSegmentRow)).toHaveLength(1)
  })

  it('sums all segments into the slept duration', async () => {
    const wrapper = mountSheet()
    await wrapper.findAll('button').find((b) => b.text() === '+ Add Segment')!.trigger('click')
    /* main 1380 -> 390 spans 450 minutes; the new segment defaults to a 60-minute nap */
    expect(wrapper.text()).toContain('dur(510)')
  })

  it('clears the night and closes, saving nothing', async () => {
    const wrapper = mountSheet()
    await wrapper.findAll('button').find((b) => b.text() === 'Clear')!.trigger('click')
    expect(wrapper.emitted('clear')).toEqual([[]])
    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })
})
