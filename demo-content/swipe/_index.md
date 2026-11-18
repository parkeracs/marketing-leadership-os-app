# Swipe file

Examples of great marketing Andy has saved: ads, emails, landing pages, swag, events, social posts and more. **What great looks like.**

**Only Andy's picks go in here.** Claude categorises what he saves, and never fills the swipe file with examples he didn't choose.

## How things get in

| From | How |
|---|---|
| **Desktop browser** | Web Clipper → the **Marketing OS — Swipe** template. It saves to `inbox/swipe/` |
| **Screenshots** (desktop) | Drop the image into `inbox/swipe/` |
| **Mobile and iPad** | Screenshot → share → email it to yourself with the subject **"swipe"**. `/process-swipe` pulls these in through the Gmail connector, read-only. *The hosted web app will add direct upload later.* |
| **Great emails** | Label them **Swipe** in Gmail |

Then run `/process-swipe`.

## One note per item

```markdown
---
title: "<Brand>: <what it is>"
brand: <Brand>
format: <from the list below>
channel: <where it ran>
audience: b2b | b2c
techniques: [<from the list below>]
source_url: <link, if any>
image: "[[attachments/swipe/<file>]]"
seen: YYYY-MM-DD
origin: swipe
status: processed
---

![[attachments/swipe/<file>]]

## Why it works
<2–3 lines from Claude: the technique, and why it lands with this audience>

## Copy
<the headline and key lines (short quotes), plus the structure. The image holds the full text>

## Why I saved it
<optional: Andy's own note>

## Related
<case studies, playbooks or other swipe items>
```

Images live in `attachments/swipe/`, which is git-ignored. Notes live here.

## Formats

`ad` · `email` · `landing-page` · `homepage` · `social-post` · `video` · `swag` · `event` · `packaging` · `ooh` (out-of-home) · `direct-mail` · `product-ui` (in-product marketing, onboarding) · `launch` · `content` (reports, guides) · `brand-identity` · `other`

## Techniques

Each item gets 1–4:

- **Persuasion:** `social-proof` · `scarcity` · `urgency` · `authority` · `reciprocity` · `risk-reversal`
- **Voice:** `humour` · `contrarian` · `founder-voice` · `plain-speak` · `irreverent` · `emotional`
- **Craft:** `bold-design` · `pattern-interrupt` · `specificity` · `storytelling` · `personalisation` · `interactive`
- **Positioning:** `category-framing` · `enemy` · `before-after` · `comparison`
- **Distribution:** `community` · `creator-led` · `employee-advocacy` · `stunt` · `co-marketing`

Add a technique only when three or more items would use it, the same rule as `taxonomy.md`.

## Browse

```dataview
TABLE brand, format, techniques, audience
FROM "swipe"
WHERE origin = "swipe"
SORT seen DESC
```
