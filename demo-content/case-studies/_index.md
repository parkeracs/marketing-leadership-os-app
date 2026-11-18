# Case studies

Real-world examples, told as tactical guides: **who did something brilliantly, and exactly how.** Playbooks say what to do. Case studies show someone doing it.

**These sit outside the canon.** They're researched from the open web (founders' own posts, interviews, podcasts, credible press), not from [[canon/_index|trusted sources]]. So they follow stricter rules:

- `origin: web-research` on every case study.
- **Every factual claim carries a numbered citation.** Prefer primary sources: the people who built it, in their own words.
- **Results are labelled by evidence quality:** *verified* (published data or a primary source with numbers), *claimed* (stated by the company or founder, not independently checked) or *reported* (third-party, secondhand).
- **Volatile by default:** review every 6 months. Tactics decay fast once everyone copies them.
- `/advise` may cite case studies as examples, with a note that they're outside the trusted sources.
- **Visual:** the company logo, plus 2–4 screenshots of *public* pages showing the tactic, in `case-studies/images/<slug>/`. These are committed to git (unlike `attachments/`), so they show on the hosted app.
- **Builders are linkable:** verified LinkedIn, X or website links in `people_links`. Don't link private individuals.

Write them with `/research-case-study <company or tactic>`.

## Template

```markdown
---
title: "<Company>: <the tactic in a few words>"
company: <Company>
people: ["<Name> (<role>)"]
tactic: <short kebab-case, e.g. creator-program, founder-led-brand, employee-advocacy>
tags: [<1–3 from taxonomy.md>]
origin: web-research
period: <when it ran, e.g. 2024–present>
researched: YYYY-MM-DD
shelf_life: volatile
review_by: YYYY-MM-DD
freshness: current
confidence: high | medium | low
logo: "case-studies/images/<slug>/logo.svg"
people_links:
  "<Name>": { linkedin: https://..., x: https://..., website: https://... }
related_playbooks: []
---

# <Company>: <tactic>

> [!summary] At a glance
> One paragraph: what they did, why it's notable, the headline result (with its evidence label).

## Who built it
## How it worked
Step by step, concrete enough to copy: structure, selection, incentives, cadence, tooling, team.
## Results
| Claim | Evidence | Source |
## Why it worked
## When it transfers, and when it doesn't
## How to run your own
A checklist.
## Resources
People to follow, primary sources, deeper learning on the tactic.
## Sources
1. …
```

## Case studies
- [[wispr-flow-creator-program]] — three creator engines (organic student creators, paid ad creative, sponsored dev and AI creators) behind Wispr Flow's growth
- [[clay-founder-employee-advocacy]] — Clay's three-layer LinkedIn advocacy: founders riding existing behaviour, a creator and partner ecosystem, an exec programme mapped to buyer personas
- [[lovable-founder-employee-advocacy]] — engineers announcing their own releases, a Slack "bee swarming" channel, founder social and user showcases as Lovable's main organic channel
