import { faker } from '@faker-js/faker'
import { wakeUpDateKey, type SleepLogNight, type SleepSegment } from '@sleep-bank/logic'

/* the one faker instance the workspace uses; consumers import from here so
   @faker-js/faker stays a dependency of this dev-only package alone */
export { faker }

/** call in beforeEach for reproducible failures */
export function seed(value: number): void {
  faker.seed(value)
}

/** a stepper-legal time of day: minutes since midnight in 15-minute steps */
export function fakeQuarterHour(): number {
  return faker.number.int({ min: 0, max: 95 }) * 15
}

export function fakeSleepSegment(overrides: Partial<SleepSegment> = {}): SleepSegment {
  return { startMinuteOfDay: fakeQuarterHour(), endMinuteOfDay: fakeQuarterHour(), ...overrides }
}

/** an afternoon nap, 15 minutes to 2 hours, starting 12:00-15:00 */
export function fakeNapSegment(): SleepSegment {
  const start = faker.number.int({ min: 48, max: 60 }) * 15
  return {
    startMinuteOfDay: start,
    endMinuteOfDay: start + faker.number.int({ min: 1, max: 8 }) * 15,
  }
}

/* the dataset persona, by the day the night STARTS on (0 = Sunday):
   weeknights 4-9h, weekends (Fri/Sat) 9-12h, Sunday night 4-6h */
function nightMinutes(startDay: number): number {
  if (startDay === 5 || startDay === 6) return faker.number.int({ min: 36, max: 48 }) * 15
  if (startDay === 0) return faker.number.int({ min: 16, max: 24 }) * 15
  return faker.number.int({ min: 16, max: 36 }) * 15
}

/** the persona's night waking on `wakeUpDate`: a main block put to bed between
    21:00 and 01:00, and a coin-flip nap after any night of 6 hours or less */
export function fakeNightFor(wakeUpDate: Date): SleepLogNight {
  const startDay = (wakeUpDate.getDay() + 6) % 7
  const minutes = nightMinutes(startDay)
  const bedtime = (faker.number.int({ min: 84, max: 100 }) * 15) % 1440
  const entries: SleepSegment[] = [
    { startMinuteOfDay: bedtime, endMinuteOfDay: (bedtime + minutes) % 1440 },
  ]
  if (minutes <= 360 && faker.datatype.boolean()) entries.push(fakeNapSegment())
  return { wakeUpDate: wakeUpDateKey(wakeUpDate), entries }
}

const GOLDEN_SEED = 1
const GOLDEN_MONTHS = 3

/** THE golden dataset: the trailing three months through `today`, most nights
    logged, a few skipped. Deterministic for a given day — always seeds itself */
export function goldenNights(today: Date): SleepLogNight[] {
  seed(GOLDEN_SEED)
  const todayKey = wakeUpDateKey(today)
  return Array.from({ length: GOLDEN_MONTHS }, (_, i) => {
    const first = new Date(today.getFullYear(), today.getMonth() - (GOLDEN_MONTHS - 1) + i, 1)
    return fakeMonthOfNights(first.getFullYear(), first.getMonth())
  })
    .flat()
    .filter((night) => night.wakeUpDate <= todayKey)
}

/** a month of persona nights (0-indexed month), every night logged */
export function fakeMonthOfNights(year: number, month: number): SleepLogNight[] {
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) => fakeNightFor(new Date(year, month, i + 1)))
}
