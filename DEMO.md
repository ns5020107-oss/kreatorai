# KreatorAI — Demo Pack

## Slide outline (6–8 slides)

1. **Problem** — Hiring AI creators is guesswork: portfolios are screenshots,
   "AI artist" means anything, and nobody says whether the tools are licensed
   for commercial use. Brands overpay or gamble.
2. **Approach** — A marketplace that asks creators to show the kitchen, not just
   the dish: tools, workflow, proof, and plain-English verification badges.
3. **Profiles & AI portfolios** — Full creator page: bio, toolkit, trust meter,
   portfolio pieces with "How it was made" (prompt → generate → upscale → edit),
   licence badges, reviews, similar creators.
4. **Discovery & filtering** — Classification chips, debounced search, 10+ filters,
   sortable, shareable URLs, honest empty states.
5. **Briefs & AI builder** — 4-step structured brief incl. commercial-use terms;
   rule-based "Build with AI" turns one sentence into a brief; recommended
   creators with transparent scores and reasons.
6. **Verification** — Four badges with tooltips and a legend; trust score on
   every card; "verified only" filter. Mock data, labelled as demo.
7. **Engagement flow** — Stage tracker Discovery → Delivered, shortlists, notes,
   email outreach logged to the inbox.
8. **Next steps** — Real verification pipeline (receipts, C2PA provenance),
   payments/escrow, creator onboarding.

## 2-minute demo script

**0:00–0:20 — The problem (Home)**
"Hiring an AI creator today is a gamble. This is KreatorAI — a marketplace where
every creator shows their tools, their workflow, and proof, before you say hello."

**0:20–0:50 — Discovery (/creators)**
"Fourteen creators across eleven crafts. Watch: I tap *Video*, then filter by the
*Runway* tool and *Paid ads OK* licence — the URL updates, so this exact search is
shareable. Clear it all in one click."

**0:50–1:15 — Profile (/creator/c1)**
"Aarav's profile: trust score, four verification badges with plain-English
tooltips, and a portfolio where every piece opens to show *how it was made* —
tools, steps, client, licence. Then the big button: **Send email** — prefilled,
attach a brief, opens my email app, and logs to the inbox."

**1:15–1:45 — Brief + AI builder (/brief/new)**
"I type: *short ad for our eco sneakers, young audience, Instagram*. The builder
fills content type, 9:16, tone, audience, budget — I publish, and get recommended
creators with a score **and the reasons**. Transparent, defensible."

**1:45–2:00 — Engagement (/brief/:id)**
"Shortlist creators, move the stage from Discovery to Delivered, add notes.
Everything persists in the browser. That's KreatorAI — thank you."

## Final checklist

- [x] 14 diverse creators seeded (Indian names/cities), each with full profile fields
- [x] AI portfolio grid: title, type, SVG thumbnail, tools, workflow steps, client, year, licence badge; modal on click
- [x] Reviews summary + "Similar creators" row on every profile
- [x] "Send email" on every profile: prefilled To/Subject/Body, brief attach dropdown, mailto via encodeURIComponent, Copy fallback, toast, /inbox log
- [x] Sticky classification chip bar (12 chips), instant filter + active highlight
- [x] Filters panel (sidebar desktop / drawer mobile): skills, specialization, tools, content type, aspect ratio, commercial use, price, availability, verified-only, language
- [x] Debounced text search (name/skills/tools/headline); sort: relevance, price, newest, most verified
- [x] Active filters as removable tags, result count, Clear all, friendly empty state
- [x] Filters synced to URL query string (shareable)
- [x] /brief/new: 4-step form with progress + inline validation covering all required fields incl. commercial-use block
- [x] Save draft / Publish; /briefs lists with 5 statuses; publish shows Recommended creators with transparent scoring + reasons
- [x] /brief/:id: 7-stage tracker, shortlist creators, advance stages, notes — all in localStorage
- [x] Verification badges (4) with tooltips + legend; trust meter on cards + profiles; verified-only filter; demo data labelled
- [x] AI brief builder: rule-based, no API key, loading state, accept/regenerate, Anthropic optional with try/catch fallback, never crashes
- [x] Design: warm paper editorial, terracotta accent, serif/sans pairing, no purple/blue gradients, no glassmorphism, no emoji icons (inline SVG), no banned words
- [x] All thumbnails/avatars generated locally as inline SVG; zero external image/font/video URLs
- [x] Responsive mobile-first; keyboard accessible; visible focus rings; aria-labels; alt text
- [x] Routes: /, /creators, /creator/:id, /brief/new, /briefs, /brief/:id, /inbox, /about, * (404 with home link); HashRouter so refresh never 404s
- [x] Zero build errors; zero runtime errors on all 13 routes (SSR-tested); zero React key warnings; stable keys everywhere
- [x] Unknown creator/brief ids show friendly "not found"; all forms validated inline; no dead buttons/links
- [x] localStorage wrapped in try/catch with safe defaults
- [x] README with exact commands; DATA_MODEL.md; DEMO.md (this file)

## Directory expansion — 100 real public listings (added Oct 10)

KreatorAI now carries **114 creators**: the original 14 fictional featured profiles plus **100 real AI creators** imported from public directories (aiartists.org, Best AI Films, Runway Talent and others). The 100 are **real people**, so the app treats them with strict honesty: no invented emails, prices, ratings, reviews or availability; no fake verification badges — they carry a neutral **"Directory listed — not yet verified"** badge with the directory source shown on every profile. Contact is **website-first** ("Visit website" opens their real site; entries without a site show a disabled state, never a dead link). A new **Source filter** (All / Featured / Directory) separates the two groups, and brief matching scores directory creators on content type and specialization with reasons shown. Say this on stage: *"Fourteen fictional profiles for the full workflow demo — plus one hundred real directory listings, honestly labelled as unverified, because a marketplace has to be honest about what it hasn't checked yet."*

### Integration checklist (§8 + §10 of the integration prompt)
- [x] 100/100 CSV rows imported, ids d1–d100, zero dropped (import script exits non-zero otherwise)
- [x] Every CSV column mapped and visible: name, platform, profile_url, portfolio_url, content_type, specialization, country, source_url, verification_status, listing_type, notes (username/tools_used/business_contact are empty in source — never rendered, never invented)
- [x] Directory cards render all 114 with name, mapped chip, location, Featured/Directory tag, website CTA state
- [x] Debounced search matches name, specialization, content_type, country
- [x] All 10 filter groups + new Source filter work; "Verified only" correctly excludes directory entries; tags, count, Clear all, empty state work
- [x] URL query sync includes the source filter; shared URLs reproduce results
- [x] Sorts degrade gracefully: no-price sorts last on price, no-date sorts last on newest, no-score sorts last on verified — never crashes
- [x] /creator/d1…/d100 render with bio template, About rows (Website, Portfolio, Listed via, Directory note, Tools), neutral Listed badge, no trust-score number, no mailto button
- [x] Similar creators suggests by mapped chip; brief matching scores directory creators without crashing on missing tools/price
- [x] Inbox/email flows unchanged for featured; directory profiles never show the mailto modal
- [x] /creator/d999 shows the friendly not-found page
- [x] `npm run build`: zero errors, zero warnings; no localhost refs in dist/
- [x] No `undefined` rendered; no dead buttons; external links use target=_blank rel=noopener
- [x] Banned words absent; no emojis as icons
