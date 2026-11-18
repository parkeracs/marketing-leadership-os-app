---
title: "Target Pipeline Coverage is Not the Inverse of Win Rate"
author: ["[[Dave Kellogg]]"]
source: "https://www.kellblog.com/target-pipeline-coverage-is-not-the-inverse-of-win-rate/"
site: kellblog.com
published: 2024-06-10
clipped: 2026-10-28
origin: research
format: post
tags: [revops, measurement, demand-gen]
shelf_life: perishable
review_by: 2025-06-10
freshness: aging
status: library
---

> [!summary] Principles
> - Don't set the coverage target by inverting win rate. Win rate is ambiguous (narrow vs broad), excludes slips, and is timed on when deals die, not on start-of-quarter pipeline.
> - Three distinct metrics: **win rate** (period metric, good for tracking against competitors), **close rate** (cohort metric, how much a set of opportunities yields and when), **week-3 pipeline conversion rate** (new ARR closed ÷ week-3 current-quarter pipeline). Only the last one, inverted, gives target coverage.
> - Track **narrow win rate** (wins ÷ wins+losses) and **broad win rate** (including no-decisions/derails). Code no-decisions separately from losses.
> - If quality of early opportunities drops, it should show up as a higher stage-2 rejection rate, not a lower win rate. A rising coverage demand is often marketing being handed sales' problem.

> [!warning] Numbers and tactics ⏳
> - Rule-of-thumb coverage 3.0x; Kellogg's last company hit plan on 2.5x (as of 2024-06)
> - Win a third, lose a third, slip a third, after skimming derails (as of 2024-06)
> - Cost per stage-2 opportunity typically $2K–10K, mean ~$4–5K, mid-market/enterprise; stage-2 acceptance typically 60–80% (as of 2024-06)
> - Use a trailing nine-quarter average of week-3 conversion; monthly-cadence businesses use a day-3 snapshot (as of 2024-06)

## My take


## Notes
- Triggered by a benchmark report claiming falling win rates imply needing far higher coverage. Kellogg's sanity checks first: who generates it (usually marketing), at what CAC cost, and why sales accepts opportunities it can't win.
- Worked example: cohort close-rate table (opportunities by creation quarter, closed by quarter after) and a week-3 conversion table with a "percent of plan" row, so you can ask what coverage hits plan 90% of the time.
- Prefers counts to dollars; segment new vs expansion only if mix shifts.
- Works when sales cycles are much longer than the quarter. Weak for short cycles (see his 30-day sales cycle post).
- Companion spreadsheet and a Metrics Brothers podcast episode are linked from the post.
