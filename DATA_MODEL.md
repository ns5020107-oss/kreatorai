# KreatorAI — Data Model

All seed data lives in `src/data/*.js`. User-created data (briefs, messages,
shortlists, stages, notes) persists in `localStorage` under keys prefixed
`kreatorai:` — every read is wrapped in try/catch with safe defaults.

## Creator

```json
{
  "id": "c1",
  "name": "Aarav Mehta",
  "email": "aarav.mehta@kreatorai.demo",
  "headline": "AI film director for ads that stop the scroll",
  "location": "Mumbai, Maharashtra",
  "languages": ["English", "Hindi", "Hinglish"],
  "availability": "Available now",
  "rateMin": 45000,
  "rateMax": 95000,
  "responseTime": "~3 hours",
  "bio": "…",
  "specialization": "Video",
  "skills": ["AI direction", "Cinematic lighting"],
  "tools": ["Runway", "Sora", "ElevenLabs"],
  "contentTypes": ["Video"],
  "aspectRatios": ["9:16", "1:1", "16:9"],
  "licenseLevel": "buyout",
  "verify": { "tools": true, "workflow": true, "pastWork": true, "commercialSafe": true },
  "trustScore": 96,
  "rating": 4.9,
  "reviews": 27,
  "joined": "2024-02",
  "hue": 16,
  "portfolio": ["<PortfolioItem>"],
  "testimonials": [{ "name": "…", "role": "…", "text": "…" }]
}
```

- `specialization`: one of the 11 classification chips (Video … Brand Identity).
- `licenseLevel`: `editorial` < `organic` < `paid` < `buyout` (ordered by permissiveness).
- `verify`: see **VerificationSignal**. `trustScore`: 0–100, derived from checks + history.
- `hue`: drives the locally generated avatar artwork.

## PortfolioItem

```json
{
  "id": "c1p1",
  "title": "Monsoon Chai — 20s launch film",
  "type": "video",
  "seed": "chai-rain",
  "tools": ["Runway", "Topaz", "Premiere Pro"],
  "workflow": ["Wrote a 6-shot script…", "Generated plates in Runway…"],
  "client": "Kettlery (fictional)",
  "year": 2026,
  "license": "Full buyout"
}
```

- `type`: `video` | `animation` | `graphic` | `audio`.
- `seed`: deterministic seed for the locally generated SVG thumbnail.

## Tool

```json
{ "name": "Runway", "kind": "Video generation", "commercialSafe": true }
```

`commercialSafe` marks tools licensed for commercial client work (used by the
"Commercial-safe" badge and the brief's "tools must be commercially licensed" rule).

## Skill

Plain string from a controlled list, e.g. `"Prompt engineering"`,
`"Character consistency"`, `"Lip-sync"`. Used for filtering and matching.

## Brief

```json
{
  "id": "brief-…",
  "campaignTitle": "Monsoon Sneaker Drop",
  "brandName": "StrideLab",
  "objective": "Drive festive-season sales",
  "audience": "Gen Z sneakerheads",
  "contentType": "Video",
  "style": "Cinematic, warm light",
  "tone": "Bold",
  "duration": "15s",
  "deliverables": 3,
  "platforms": ["Instagram", "YouTube"],
  "aspectRatio": "9:16",
  "budgetMin": 25000,
  "budgetMax": 60000,
  "deadline": "2026-11-20",
  "referenceLinks": "https://…",
  "usageType": "paid",
  "territory": "India",
  "usageDuration": "1 year",
  "exclusivity": false,
  "toolsMustBeLicensed": true,
  "aiDisclosureRequired": false,
  "status": "Published",
  "createdAt": "…",
  "updatedAt": "…"
}
```

- `usageType`: `organic` | `paid` | `broadcast` | `print`.
- `status`: `Draft` | `Published` | `In discussion` | `In production` | `Delivered`.

## CommercialUse

Not a separate record — the commercial-use requirements live on the Brief
(`usageType`, `territory`, `usageDuration`, `exclusivity`,
`toolsMustBeLicensed`, `aiDisclosureRequired`) and are matched against each
creator's `licenseLevel` in the scoring function.

## Format / AspectRatio

Controlled strings: `9:16`, `1:1`, `16:9`, `4:5`. Creators list the ones they
deliver; briefs pick one; matching rewards agreement via the content-type and
specialization signals.

## VerificationSignal

```json
{ "id": "tools", "label": "Verified tools",
  "expl": "The creator showed proof of a paid subscription or licence…" }
```

Four signals: `tools`, `workflow`, `pastWork`, `commercialSafe`. Stored per
creator as booleans in `creator.verify`; explained in the UI legend. All seed
values are **demo data**, labelled as such in the UI.

## Engagement

Per brief, stored in localStorage:

- `kreatorai:stages` — `{ [briefId]: stageIndex }`, stages:
  `Discovery > Shortlist > Proposal > Contract > Production > Review > Delivered`
- `kreatorai:shortlists` — `{ [briefId]: [creatorId, …] }`
- `kreatorai:notes` — `{ [briefId]: [{ id, text, at }] }`

## Message

```json
{
  "id": "msg-…",
  "to": "aarav.mehta@kreatorai.demo",
  "subject": "Collaboration inquiry: Monsoon Sneaker Drop",
  "body": "Hi Aarav,…",
  "creatorId": "c1",
  "creatorName": "Aarav Mehta",
  "briefId": "brief-…",
  "via": "mailto",
  "at": "…"
}
```

Stored in `kreatorai:messages`. `via` is `mailto` (opened the user's email app)
or `copied` (used the copy fallback). Nothing is sent by a server.
