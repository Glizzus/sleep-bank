/* alpha per 30-minute shortfall bucket (SLEEP.md rule 2: display resolution
   is 30), from no shortfall up to the 3-hour cap */
const CLAY_ALPHAS = [0.07, 0.11, 0.15, 0.2, 0.24, 0.28, 0.32]

/** opacity for a night's debt mark: deeper shortfall, deeper clay */
function debtClayAlpha(shortfallMinutes: number): number {
  const bucket = Math.round(shortfallMinutes / 30)
  const index = Math.max(0, Math.min(bucket, CLAY_ALPHAS.length - 1))
  return CLAY_ALPHAS[index]!
}

/** CSS color for a night's debt mark, derived from the --color-clay token */
export function debtClayColor(shortfallMinutes: number): string {
  const alpha = debtClayAlpha(shortfallMinutes)
  return `color-mix(in srgb, var(--color-clay) ${(alpha * 100).toFixed(1)}%, transparent)`
}
