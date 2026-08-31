import { describe, it, expect, vi } from 'vitest'
import { mount, config } from '@vue/test-utils'
import { formatNightDate } from '@sleep-bank/logic'
import SleepLogSheet from '../SleepLogSheet.vue'
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
    const [asleep, awake] = steppers(mountSheet())
    expect(asleep!.props('label')).toBe('Asleep')
    expect(awake!.props('label')).toBe('Awake')
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
      initial: { startMinuteOfDay: 1350, endMinuteOfDay: 420 },
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

  it('saves the edited segment and closes', async () => {
    const wrapper = mountSheet()
    steppers(wrapper)[0]!.vm.$emit('update:modelValue', 1350)
    steppers(wrapper)[1]!.vm.$emit('update:modelValue', 420)
    await wrapper.findAll('button').find((b) => b.text() === 'Save')!.trigger('click')
    expect(wrapper.emitted('save')).toEqual([[{ startMinuteOfDay: 1350, endMinuteOfDay: 420 }]])
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('clears the night and closes, saving nothing', async () => {
    const wrapper = mountSheet()
    await wrapper.findAll('button').find((b) => b.text() === 'Clear')!.trigger('click')
    expect(wrapper.emitted('clear')).toEqual([[]])
    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })
})
