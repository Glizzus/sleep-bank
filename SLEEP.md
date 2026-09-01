# SLEEP.md

What this app is allowed to believe about sleep. If the code assumes something not written here, the code is wrong. Change this file first.

Everything below is a decision, not a bug. The app explains itself once, on the Methodology screen. Nowhere else. Do not add caveats to features. If a feature needs a claim that isn't here, propose it here.

## Rules

**1. Debt is a 14-day rolling sum.**
Shortfall over the last 14 nights, minus credited surplus, floored at zero. Older than 14 days is not a number. "You've been under-sleeping for a while" is fine. "You owe 47 hours" is not.

**2. Resolution is 30 minutes.**
Take input at 15. Compute and show at 30. No decimals, ever. Self-reported sleep is off by half an hour on a good night; we don't display precision we don't have.

**3. One night repays 30 for showing up, plus surplus, capped at 90.**
A night at target repays 30 min: sleep after debt is deeper. Surplus above target repays 1:1 on top, capped at 90 min/night total. A 16-hour sleep and a 9.5-hour sleep repay the same. A week of debt takes about a week to clear.

**4. Debt floors at zero.**
No bank. No surplus. No deposits.

**5. Need is the user's number.**
We can't measure it. We don't pretend to.

## We ignore, on purpose

| Ignored | App does |
|---|---|
| Circadian timing | Nothing. 3am–10am is seven hours. |
| Sleep quality, stages | Nothing. Seven logged hours is seven hours. |
| Naps vs. one block | Nothing. Total per 24h is what counts. |
| Individual vulnerability | Nothing. |
| Recovery curve shape | Step + cap + 1:1. We don't draw curves we can't see. |
| How you feel | Never asked. Feeling fine does not clear debt. |

## Forbidden

Decimals. "Score," "optimal," "efficiency." A positive balance. Predicting sleep or wake times. Adjusting for mood or quality. A debt bigger than 14 nights could make. Disclaimers anywhere but Methodology.

## Permitted

The debt figure. A 14-night trend. Above/below target per night. "Good nights until clear." The Methodology screen.

## Posture

We are a coarse instrument on purpose. Say so once. Never apologize.

## Sources

Guzzetti & Banks 2023, *SLEEP Advances* (open access) — cites Van Dongen 2003, Belenky 2003, Banks 2010, Rupp 2009, Kitamura 2016.

## Changelog

2026-08-28 — v1.