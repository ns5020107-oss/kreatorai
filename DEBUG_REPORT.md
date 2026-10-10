# KreatorAI — debug report

Could not run `npm install`/`vite build` (sandbox has no network). Verified instead by: esbuild syntax + import/export resolution of every file, node tests of `logic.js` and the data, and server-rendering every page (stubbed router) with real data. **Run `npm install && npm run build` before deploying — `dist/` is stale and was built with absolute `/assets/` paths.**

## Fixed
| # | Where | Problem | Fix |
|---|-------|---------|-----|
| 1 | `taxonomy.js`, `creators.js`, `BriefNew`, `Creators` | Two content-type vocabularies. Brief form/filter used `Video/Animation/Graphic/Audio`; the AI builder, chips and 100 directory creators use the 11 craft names. "Graphic"/"Audio" filters matched nobody, AI-picked types (Music, Voice & Audio…) had no radio selected, and 9 featured creators never got the +25 type match (an unrelated Video director scored 45 vs 50 for the right illustrator). | One vocabulary (`CONTENT_TYPES = SPECIALIZATIONS`); featured creators' `contentTypes` updated. Right specialists now score ~75, others stay ~45. |
| 2 | `logic.js` budget parser | Took the **first number anywhere** as the budget: "15 second reel, budget 50k" → ₹12–18k; "3 kids" → ₹3k. | Only numbers with a money signal (₹/Rs/INR, "budget", k/lakh/L). Supports ranges ("40k-60k"). |
| 3 | `logic.js` duration | `15 seconds`/`30 seconds` never matched (regex needed `s`/`sec` then a word boundary). | Fixed. |
| 4 | `logic.js` keyword matching | Substring matching: "discover"→cover (Illustration), "tracking"→track (Music), "Dubai"→dub (Audio), "road"→ad (paid). First rule hit won, so "poster … music festival" → Music. | Whole-word matching; type = most keyword hits. Explicit `9:16`/`16:9`/`1:1`/`4:5` in the text now wins. |
| 5 | `logic.js` `enhanceWithAnthropic` | Model JSON used unvalidated (`platforms` as string, `null` title → `.trim()` crash in BriefNew, unknown tone/ratio). | `normalizeBrief()` coerces every field, falls back to rule-based values. |
| 6 | `BriefNew.applyAI` | "Use this brief" overwrote title/brand/deadline/links with empty strings, wiping what the user had typed. | Empty/null AI fields are skipped. |
| 7 | `logic.js` scoring | "Social Ads" directory creators never type-matched; unknown (`null`) rates counted as budget overlap; "Rate  fits budget" blank text. | Fixed. |
| 8 | `EmailModal`, `BriefDetail` | Directory creators have no `email` → `to.trim()` TypeError on Send, "To: undefined" logged to Inbox. Email button was offered for them in matches. | `to` defaults to `""`; matches show Visit website / View profile when no email. (Latent today — they don't reach the top 5 — but one scoring tweak would expose it.) |
| 9 | `EmailModal` | Effect depended on inline `onClose` → "To" field stole focus whenever a toast appeared. Drafts opened from a brief page weren't selectable in the "attach brief" dropdown. | `onClose` via ref; default brief always in the list. |
| 10 | `Layout` + CSS | Mobile nav had inline `display:flex`, overriding `.show-mobile` → duplicate nav row on **desktop**. | New `.mobile-nav` class. |
| 11 | `Creators` | Search box was uncontrolled: "Clear all"/removing the tag left the old text. Sidebar and mobile drawer rendered duplicate element ids (labels toggled hidden inputs). Pending debounce not cleared on unmount. | Controlled input, per-panel id namespace, cleanup. |
| 12 | `vite.config.js` | No `base`, so the build 404s on any sub-path host (GitHub Pages, etc.). | `base: "./"`. |
| 13 | Copy | Header, footer, About and README said **all** creators are fictional — false now that 100 are real. Home said "five-step form" (it's four). Urdu creators couldn't be filtered. | Corrected; Urdu added. |
| 14 | `scripts/import-creators.js` | Hard-coded `~/workspace/user/files/…csv` (not in the repo). | Path via argv / `$CREATOR_CSV` / `./data/`, with a clear error. |

## Not changed — worth knowing
- **`VITE_ANTHROPIC_API_KEY` ships inside the client bundle.** Fine locally; if you deploy publicly with a key set, anyone can extract it. Leave it unset for the live demo (the rule-based builder works) or proxy through a server.
- "Specialization" and "Content type" sidebar filters now show the same 11 options (they filter different fields: one primary craft vs. all crafts a creator works in). Drop one if it looks redundant on stage.
- Clicking the "Find creators" nav link while filters are active doesn't reset them (state is initialised from the URL once).
- Deleting a brief leaves its shortlist/stage/notes in localStorage.
- `scoreCreator`'s "style/tone 10 pts" is really "type or specialization matches" — the label in the UI is slightly generous.

## Addendum — full-stack security audit (2026-10-10, independent review)
| # | Where | Problem | Fix |
|---|-------|---------|-----|
| 15 | `src/pages/Login.jsx` | **Open redirect**: post-login `next` param accepted absolute URLs (`/login?next=https://evil.com` would send users off-site after login). | `next` is now allow-listed to same-origin paths only (`/`-prefixed, not `//`). |
