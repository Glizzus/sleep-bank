import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SleepSegmentRow from '../SleepSegmentRow.vue'
import SettingRow from '../SettingRow.vue'
import FifteenMinuteTimeOfDayStepper from '../FifteenMinuteTimeOfDayStepper.vue'

function mountRow(props: Record<string, unknown> = {}) {
  return mount(SleepSegmentRow, {
    props: { asleep: 1380, awake: 390, label: 'Main', ...props },
  })
}

function steppers(wrapper: ReturnType<typeof mountRow>) {
  return wrapper.findAllComponents(FifteenMinuteTimeOfDayStepper)
}

describe('SleepSegmentRow', () => {
  it('renders the labeled Asleep and Awake steppers from the models', () => {
    const wrapper = mountRow()
    const settingLabels = wrapper.findAllComponents(SettingRow).map((row) => row.props('label'))
    expect(settingLabels).toEqual(['Asleep', 'Awake'])
    const [asleep, awake] = steppers(wrapper)
    expect(asleep!.props('modelValue')).toBe(1380)
    expect(awake!.props('modelValue')).toBe(390)
  })

  it('shows the label', () => {
    expect(mountRow({ label: 'Segment 2' }).find('.label').text()).toBe('Segment 2')
  })

  it('hides the remove button unless removable', () => {
    expect(mountRow().find('button.remove').exists()).toBe(false)
  })

  it('emits remove when the removable x is clicked', async () => {
    const wrapper = mountRow({ removable: true })
    await wrapper.find('button.remove').trigger('click')
    expect(wrapper.emitted('remove')).toEqual([[]])
  })

  it('passes asleep changes through to the asleep model', () => {
    const wrapper = mountRow()
    steppers(wrapper)[0]!.vm.$emit('update:modelValue', 1320)
    expect(wrapper.emitted('update:asleep')).toEqual([[1320]])
    expect(wrapper.emitted('update:awake')).toBeUndefined()
  })

  it('passes awake changes through to the awake model', () => {
    const wrapper = mountRow()
    steppers(wrapper)[1]!.vm.$emit('update:modelValue', 420)
    expect(wrapper.emitted('update:awake')).toEqual([[420]])
    expect(wrapper.emitted('update:asleep')).toBeUndefined()
  })
})
