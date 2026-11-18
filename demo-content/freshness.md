# Freshness

How the vault stops old knowledge being served as current advice. **Freshness is judged per claim, not per document.** A 2021 report can hold a sound principle next to a dead benchmark.

## Every library note splits its takeaways in two

- **Principles**: durable reasoning, frameworks and decision rules. These age slowly.
- **Numbers and tactics ⏳**: benchmarks, numbers, tactics, platform behaviour and tool recommendations. Each one is stamped `(as of YYYY-MM)`. **This is what expires.**

## Shelf-life classes

A note's `shelf_life` is set by its **most perishable specific**. If it has no specifics, it's set by its principles.

| Class | Review after | Typical content |
|---|---|---|
| `evergreen` | 36 months | Positioning logic, sales–marketing alignment, leadership principles, how to think about a problem |
| `durable` | 24 months | Org design, team structures, operating cadences, planning processes, brand practice |
| `perishable` | 12 months | Benchmarks (CAC, payback, conversion, budget ratios, salaries), channel tactics, funnel norms |
| `volatile` | 6 months | **AI visibility / AEO / GEO**, AI tools and workflows, platform algorithms (LinkedIn, Google), ad-platform features, specific tool recommendations |

`review_by` = `published` + the review window. **It's measured from `published`, never from the clip date.** A 2022 PDF clipped today is already past its window if it's perishable.

**Unknown publish date:** set `published: unknown` and `freshness: aging`. Undated benchmarks are never quoted as current.

## Freshness states

| `freshness:` | Means | How `/advise` uses it |
|---|---|---|
| `current` | Within review window, or re-verified | Use normally, cite with date |
| `aging` | Past `review_by`, not yet re-checked | Principles usable; **specifics only with an explicit date caveat** |
| `superseded` | A newer source replaces the specifics | Principles usable; specifics never quoted — follow `superseded_by` |
| `expired` | Specifics checked and wrong now, no replacement found | Principles usable; specifics never quoted |

A note's principles stay usable in every state unless `/freshness-review` marks a principle itself as overturned.

## Playbooks

Playbooks carry `last_reviewed` and `review_by` too. **Any benchmark or tactic inside a playbook carries its source and date inline**, e.g. *"CAC payback under 12 months (Kellogg, 2024)"*. An undated number in a playbook is a defect.

## Due for review

Needs the Dataview community plugin enabled in this vault.

```dataview
TABLE published, shelf_life, review_by, freshness
FROM "library" OR "playbooks"
WHERE review_by AND date(review_by) <= date(today) AND freshness != "superseded"
SORT review_by ASC
```

Run `/freshness-review` monthly.
