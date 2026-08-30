import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue'

const STEP = 15

export interface UseFifteenMinuteStepperOptions {
  min?: MaybeRefOrGetter<number>
  max?: MaybeRefOrGetter<number>
  /** step across the bounds modularly instead of clamping */
  wrap?: MaybeRefOrGetter<boolean>
}

export function useFifteenMinuteStepper(
  value: Ref<number>,
  options: UseFifteenMinuteStepperOptions = {},
) {
  const min = computed(() => toValue(options.min) ?? 0)
  const max = computed(() => toValue(options.max) ?? Number.POSITIVE_INFINITY)
  const wrap = computed(() => toValue(options.wrap) ?? false)

  function step(direction: 1 | -1) {
    const next = value.value + direction * STEP
    if (wrap.value) {
      /* modular over the ring [min, max], e.g. 0..1425 wraps at 1440 */
      const ring = max.value - min.value + STEP
      value.value = min.value + ((((next - min.value) % ring) + ring) % ring)
    } else {
      value.value = Math.min(max.value, Math.max(min.value, next))
    }
  }

  const canStepDown = computed(() => wrap.value || value.value > min.value)
  const canStepUp = computed(() => wrap.value || value.value < max.value)

  return { step, canStepDown, canStepUp }
}
