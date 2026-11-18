---
title: "How Much Pipeline Coverage Do You Need?"
author: ["Hayes Davis"]
tier: web
contributor: Hayes Davis (co-founder and CEO, Gradient Works), with benchmark data from Ray Rike (Benchmarkit) and a formula from Jeremey Donovan (Insight Partners)
source: "https://unchartedterritory.gradient.works/p/how-much-pipeline-coverage-do-you"
site: Uncharted Territory (Substack)
published: 2025-01-16
clipped: 2026-10-29
origin: research
format: article
tags: [measurement, revops]
shelf_life: perishable
review_by: 2026-01-16
freshness: aging
status: library
---

> [!summary] Principles
> - **3x is folklore, not a rule.** Nobody knows where it came from; it persists because 2x feels tight and 4x feels rich.
> - **Derive coverage empirically if you have 20+ quarters of snapshots;** otherwise estimate it with a formula, not the inverse of win rate.
> - **The estimating formula** (Donovan, Insight): required coverage = (1 − create-and-close share) ÷ (dollar win rate × (1 − push rate)). Create-and-close is the share of the period's bookings from opportunities that don't exist yet at the start.
> - **Use dollar win rates and watch the distributions.** Deal-count win rates and average deal sizes hide big variance; a whale or two distorts everything.
> - **Short cycles need less starting coverage** because more bookings are created and closed in-period. Rough create-and-close for a quarter: (90 − sales cycle in days) ÷ 90.

> [!warning] Numbers and tactics ⏳ as of 2025-01
> - Hayes Davis (CEO of Gradient Works) works an example: a sales team with $20K ACV, a 45-day sales cycle, a 20% win rate and no pushed deals needs 2.5x pipeline coverage, not the 5x implied by inverting the win rate. It shows how short cycles, where more deals are created and closed in the same quarter, lower the coverage you need.
> - Benchmarkit (Ray Rike) pipeline coverage benchmarks from 203 companies, collected in 2024-12: the $10K to $25K ACV cohort clusters at 3 to 3.5x and nobody runs above 3.5x; 38% of the $25K to $50K cohort run below 2.5x; the $50K to $100K cohort is the most conservative, over-indexing at 3.5x or more (as of 2024-12).
> - Davis cautions that the Benchmarkit chart shows where companies set their coverage, not whether those ratios actually hit plan, so read it as common practice rather than a target.

## My take


## Notes
- Ray Rike's companion post ([LinkedIn, 2025-01-16](https://www.linkedin.com/posts/rayrike_b2bsaas-metrics-benchmarks-activity-7285667449935417344-T8KI)) adds: measure coverage at a fixed point (day 3 for monthly, week 3 for quarterly) after cleaning; trend pipeline conversion over at least three quarters; calculate it per segment; factor in the share of closed-won from in-period opportunities; strip out whales.
- Kellogg and Rike discuss the same point on [SaaS Talk with the Metrics Brothers](https://www.benchmarkit.ai/saas-talk-1/is-pipeline-coverage-ratio-simply-the-inverse-of-win-rate%3F). Canon anchor: [[Target Pipeline Coverage is Not the Inverse of Win Rate]].
- Gradient Works sells routing and territory software; this piece is analysis, not a pitch.
