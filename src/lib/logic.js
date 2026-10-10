// Pure logic: brief builder, creator matching, mailto links, misc helpers.
// No DOM, no React — unit-testable in plain node.
import { commercialSafeTools, CONTENT_TYPES, ASPECT_RATIOS, TONES } from "../data/taxonomy.js";

/* ---------------- rule-based brief builder ---------------- */

const TYPE_RULES = [
  { type: "Video", words: ["video", "film", "tvc", "commercial", "reel", "shorts", "youtube video", "ad film"] },
  { type: "Animation", words: ["animation", "animated", "anime", "cartoon", "explainer", "mascot"] },
  { type: "Music", words: ["music", "song", "jingle", "anthem", "track", "score"] },
  { type: "Voice & Audio", words: ["voiceover", "voice-over", "voice over", "podcast", "ivr", "audio", "dub"] },
  { type: "3D & Product", words: ["3d", "product render", "packaging", "packshot", "arch-viz", "archviz"] },
  { type: "Illustration & Graphics", words: ["illustration", "poster", "cover", "mural", "artwork", "graphic"] },
  { type: "Fashion & Lifestyle", words: ["fashion", "lookbook", "editorial", "apparel", "clothing"] },
  { type: "Brand Identity", words: ["logo", "brand identity", "rebrand", "identity"] },
  { type: "Motion Graphics", words: ["motion", "titles", "idents", "kinetic"] },
  { type: "Storyboarding", words: ["storyboard", "previz", "animatic"] },
  { type: "Social Ads", words: ["social ad", "performance", "ugc", "meta ad", "creatives"] },
];

const PLATFORM_ASPECT = [
  { aspect: "9:16", words: ["instagram", "tiktok", "reel", "reels", "shorts", "snapchat", "story", "stories"] },
  { aspect: "1:1", words: ["feed post", "square", "linkedin"] },
  { aspect: "4:5", words: ["portrait post", "pinterest"] },
  { aspect: "16:9", words: ["youtube", "website", "ott", "tv", "broadcast", "landscape"] },
];

const TONE_RULES = [
  { tone: "Playful", words: ["fun", "playful", "quirky", "young", "gen z", "gen-z", "youth", "meme"] },
  { tone: "Premium", words: ["luxury", "premium", "elegant", "sophisticated", "high-end"] },
  { tone: "Warm", words: ["warm", "family", "emotional", "heartfelt", "cozy"] },
  { tone: "Bold", words: ["bold", "edgy", "loud", "rebellious", "street"] },
  { tone: "Minimal", words: ["minimal", "clean", "simple", "calm"] },
  { tone: "Trustworthy", words: ["trust", "bank", "finance", "insurance", "serious", "corporate"] },
];

const AUDIENCE_RULES = [
  { audience: "Gen Z (18–24)", words: ["gen z", "gen-z", "young", "college", "students", "youth"] },
  { audience: "Millennials (25–40)", words: ["millennial", "working professionals", "young parents"] },
  { audience: "Families", words: ["family", "families", "parents", "kids", "children"] },
  { audience: "Urban women 25–44", words: ["women", "mothers", "homemakers"] },
  { audience: "Small business owners", words: ["sme", "small business", "shop owners", "retailers"] },
];

const escapeRe = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// whole-word match (optional plural "s") so "tracking" ≠ "track", "discover" ≠ "cover", "dubai" ≠ "dub"
const wordRe = (w) => new RegExp("\\b" + escapeRe(w) + "s?\\b", "i");

const NUM = "(\\d[\\d,]*(?:\\.\\d+)?)";
const UNIT = "(k|lakhs?|lacs?|l)";
// Only treat a number as money when there is a money signal: a currency marker,
// the word "budget", or a k / lakh suffix. Bare numbers ("15 sec", "3 kids", "9:16") are ignored.
const BUDGET_PATTERNS = [
  { re: new RegExp("(?:₹|\\brs\\.?|\\binr)\\s*" + NUM + "\\s*" + UNIT + "?(?![a-z])", "i"), bare: true },
  { re: new RegExp("\\bbudget\\b[^\\d₹]{0,20}" + NUM + "\\s*" + UNIT + "?(?![a-z])", "i"), bare: true },
  { re: new RegExp("\\b" + NUM + "\\s*" + UNIT + "(?![a-z])", "i"), bare: false },
];
const unitMul = (u) => (!u ? 1 : /^k$/i.test(u) ? 1000 : 100000);

export function parseBudget(text) {
  for (const { re, bare } of BUDGET_PATTERNS) {
    const m = re.exec(text);
    if (!m) continue;
    const toNum = (raw, unit) => {
      let n = parseFloat(raw.replace(/,/g, ""));
      if (Number.isNaN(n)) return null;
      if (unit) n *= unitMul(unit);
      else if (bare && n < 500) n *= 1000; // "budget 50" most likely means 50k
      return Math.round(n);
    };
    let lo = toNum(m[1], m[2]);
    if (lo == null) continue;
    // range such as "40k-60k" or "40 to 60k"
    const tail = text.slice(m.index + m[0].length);
    const r = tail.match(new RegExp("^\\s*(?:-|–|—|to)\\s*" + NUM + "\\s*" + UNIT + "?(?![a-z])", "i"));
    if (r) {
      let hi = toNum(r[1], r[2] || m[2]); // "40-60k": inherit unit from the first number
      if (lo < 500 && !m[2] && r[2]) lo = Math.round(lo * unitMul(r[2]));
      if (hi != null && hi >= lo && lo >= 1000 && hi <= 2000000) return { min: lo, max: hi };
    }
    if (lo >= 1000 && lo <= 2000000) return { min: Math.round(lo * 0.8), max: Math.round(lo * 1.2) };
  }
  return null;
}

export function buildBriefFromText(raw) {
  const text = (raw || "").toLowerCase();
  const has = (w) => wordRe(w).test(text);
  const hits = (r) => r.words.filter(has).length;

  // content type: the rule with the most keyword hits wins; ties go to rule order
  let contentType = "Video";
  let bestHits = 0;
  for (const r of TYPE_RULES) {
    const n = hits(r);
    if (n > bestHits) { bestHits = n; contentType = r.type; }
  }

  let aspectRatio = contentType === "Video" ? "16:9" : "1:1";
  const explicitAspect = text.match(/\b(9:16|16:9|1:1|4:5)\b/);
  if (explicitAspect) aspectRatio = explicitAspect[1];
  else {
    for (const r of PLATFORM_ASPECT) {
      if (r.words.some(has)) { aspectRatio = r.aspect; break; }
    }
  }
  let tone = "Friendly";
  for (const r of TONE_RULES) {
    if (r.words.some(has)) { tone = r.tone; break; }
  }
  let audience = "Urban millennials";
  for (const r of AUDIENCE_RULES) {
    if (r.words.some(has)) { audience = r.audience; break; }
  }

  let budgetMin = 25000, budgetMax = 60000;
  const budget = parseBudget(text);
  if (budget) { budgetMin = budget.min; budgetMax = budget.max; }

  const platforms = [];
  if (/\b(instagram|reels?)\b/.test(text)) platforms.push("Instagram");
  if (/\btiktok\b/.test(text)) platforms.push("TikTok");
  if (/\byoutube\b/.test(text)) platforms.push("YouTube");
  if (/\blinkedin\b/.test(text)) platforms.push("LinkedIn");
  if (platforms.length === 0) platforms.push(aspectRatio === "9:16" ? "Instagram" : "YouTube");

  const durMatch = text.match(/(\d+)\s*(?:s|secs?|seconds?)\b/);
  const duration = durMatch
    ? durMatch[1] + "s"
    : contentType === "Music" ? "30s" : "15s";

  const paidAds = /\b(ads?|campaigns?|performance|sales)\b/.test(text);
  const usageType = paidAds ? "paid" : "organic";

  const deliverables = contentType === "Music" ? 2 : contentType === "Video" ? 3 : 4;

  const styleMap = {
    Video: "Cinematic, warm light", Animation: "Character-led, lively",
    Music: "Catchy hook, clean mix", "Voice & Audio": "Natural, conversational",
    "3D & Product": "Photoreal studio look", "Illustration & Graphics": "Editorial, textured",
    "Fashion & Lifestyle": "Editorial, golden-hour", "Brand Identity": "Confident, minimal",
    "Motion Graphics": "Crisp kinetic type", Storyboarding: "Clear camera language",
    "Social Ads": "Native, thumb-stopping",
  };

  return {
    campaignTitle: "",
    brandName: "",
    objective: paidAds ? "Drive sales and signups" : "Build awareness and consideration",
    audience,
    contentType,
    style: styleMap[contentType] || "Clean and confident",
    tone,
    aspectRatio,
    duration,
    deliverables,
    platforms,
    budgetMin,
    budgetMax,
    deadline: "",
    referenceLinks: "",
    usageType,
    territory: "India",
    usageDuration: "1 year",
    exclusivity: false,
    toolsMustBeLicensed: usageType === "paid",
    aiDisclosureRequired: false,
    _source: "rule-based",
  };
}

/* Optional Anthropic enhancement — never throws, always falls back. */
export async function enhanceWithAnthropic(rawText, apiKey) {
  if (!apiKey) throw new Error("no-key");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      system: "You turn a rough ad idea into a structured creative brief. Reply ONLY with JSON matching these keys: campaignTitle, brandName, objective, audience, contentType, style, tone, aspectRatio (one of 9:16, 1:1, 16:9, 4:5), duration, deliverables (number), platforms (array), budgetMin, budgetMax (numbers, INR), usageType (organic|paid|broadcast|print).",
      messages: [{ role: "user", content: rawText }],
    }),
  });
  if (!res.ok) throw new Error("api-" + res.status);
  const data = await res.json();
  const txt = (data.content || []).map((b) => b.text || "").join("");
  const a = txt.indexOf("{"), z = txt.lastIndexOf("}");
  if (a === -1 || z <= a) throw new Error("no-json");
  const parsed = JSON.parse(txt.slice(a, z + 1));
  return normalizeBrief({ ...buildBriefFromText(rawText), ...parsed }, "anthropic");
}

/* Model output is untrusted: coerce every field to the type/vocabulary the form expects,
   falling back to the rule-based value (already merged in) when something is off. */
export function normalizeBrief(b, source) {
  const base = buildBriefFromText("");
  const str = (v, d) => (typeof v === "string" ? v : d);
  const num = (v, d) => (Number.isFinite(Number(v)) && v !== "" && v !== null ? Number(v) : d);
  let budgetMin = num(b.budgetMin, base.budgetMin);
  let budgetMax = num(b.budgetMax, base.budgetMax);
  if (budgetMax < budgetMin) [budgetMin, budgetMax] = [budgetMax, budgetMin];
  return {
    ...b,
    campaignTitle: str(b.campaignTitle, ""),
    brandName: str(b.brandName, ""),
    objective: str(b.objective, base.objective),
    audience: str(b.audience, base.audience),
    style: str(b.style, base.style),
    contentType: CONTENT_TYPES.includes(b.contentType) ? b.contentType : base.contentType,
    tone: TONES.includes(b.tone) ? b.tone : base.tone,
    aspectRatio: ASPECT_RATIOS.includes(b.aspectRatio) ? b.aspectRatio : base.aspectRatio,
    duration: str(b.duration, base.duration),
    deliverables: Math.max(1, Math.round(num(b.deliverables, base.deliverables))),
    platforms: Array.isArray(b.platforms) ? b.platforms.filter((x) => typeof x === "string") : base.platforms,
    budgetMin,
    budgetMax,
    usageType: ["organic", "paid", "broadcast", "print"].includes(b.usageType) ? b.usageType : base.usageType,
    _source: source || b._source,
  };
}

/* ---------------- transparent creator matching ----------------
   contentType 25 · skills 20 · tools 15 · style 10 · license 10 · verification 10 · budget 10 = 100 */

export function scoreCreator(creator, brief) {
  const reasons = [];
  let score = 0;

  // 1. content type — 25
  const briefTypes = brief.contentType === "Social Ads" ? ["Social Ads", "Video", "Animation"] : [brief.contentType];
  const typeHit = (creator.contentTypes || []).some((t) => briefTypes.includes(t));
  if (typeHit) { score += 25; reasons.push(`Works in ${creator.contentTypes.join(", ")}`); }

  // 2. skills — up to 20
  const briefWords = ((brief.objective || "") + " " + (brief.style || "") + " " + (brief.tone || "")).toLowerCase();
  const skillHits = (creator.skills || []).filter((s) => briefWords.includes(s.split(" ")[0].toLowerCase()));
  const skillPts = Math.min(20, skillHits.length * 7);
  if (skillPts > 0) { score += skillPts; reasons.push(`Skills match: ${skillHits.slice(0, 3).join(", ")}`); }

  // 3. tools — up to 15
  const toolHits = (creator.tools || []).filter((t) => commercialSafeTools().includes(t));
  const toolPts = Math.min(15, toolHits.length * 4);
  if (toolPts > 0) { score += toolPts; reasons.push(`Uses ${toolHits.slice(0, 3).join(", ")}`); }

  // 4. style/tone — 10
  const specHit = (creator.specialization || "").toLowerCase().includes((brief.contentType || "").toLowerCase()) ||
    (brief.contentType || "").toLowerCase().includes((creator.specialization || "").toLowerCase());
  if (specHit || typeHit) { score += 10; reasons.push(`Specializes in ${creator.specialization}`); }

  // 5. commercial-use compatibility — 10
  const order = { editorial: 0, organic: 1, paid: 2, buyout: 3 };
  const need = brief.usageType === "broadcast" ? "paid" : brief.usageType === "print" ? "buyout" : (brief.usageType || "organic");
  const ok = (order[creator.licenseLevel] ?? 0) >= (order[need] ?? 1);
  if (ok) { score += 10; reasons.push("Licence covers your usage"); }
  else { reasons.push("Licence may need upgrading — ask"); }

  // 6. verification — up to 10
  const v = creator.verify || {};
  const vCount = ["tools", "workflow", "pastWork", "commercialSafe"].filter((k) => v[k]).length;
  score += vCount * 2.5;
  if (vCount >= 3) reasons.push(`${vCount} of 4 checks verified`);

  // 7. budget fit — 10
  const bMin = Number(brief.budgetMin) || 0, bMax = Number(brief.budgetMax) || Infinity;
  const overlap = creator.rateMin != null && creator.rateMax != null && creator.rateMin <= bMax && creator.rateMax >= bMin;
  if (overlap) { score += 10; reasons.push(creator.rateMin >= 1000 ? `Rate from ₹${Math.round(creator.rateMin / 1000)}k fits budget` : "Rate fits budget"); }

  return { score: Math.min(100, Math.round(score)), reasons: reasons.slice(0, 4) };
}

export function recommendCreators(creators, brief, limit) {
  return creators
    .map((c) => ({ creator: c, ...scoreCreator(c, brief) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 5);
}

/* ---------------- mailto ---------------- */

export function buildMailto(to, subject, body) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function composeEmailBody(creator, brief) {
  const lines = [
    `Hi ${creator.name.split(" ")[0]},`,
    "",
    `I came across your profile on KreatorAI and liked your work as a ${creator.specialization.toLowerCase()} specialist — especially your ${(creator.tools || []).slice(0, 2).join(" and ")} pieces.`,
    "",
  ];
  if (brief) {
    lines.push(
      `We're planning "${brief.campaignTitle || "a new campaign"}"${brief.brandName ? ` for ${brief.brandName}` : ""} — ${brief.contentType || "content"} in ${brief.aspectRatio || "9:16"}, aimed at ${brief.audience || "our audience"}.`,
      `Budget is roughly ₹${Number(brief.budgetMin || 0).toLocaleString("en-IN")}–₹${Number(brief.budgetMax || 0).toLocaleString("en-IN")}${brief.deadline ? `, and we'd need it by ${brief.deadline}` : ""}.`,
      ""
    );
  } else {
    lines.push("We have a project coming up and I think your style could be a great fit.", "");
  }
  lines.push(
    "Would you be open to a quick call this week to talk scope and timelines?",
    "",
    "Thanks,",
    "[Your name]"
  );
  return lines.join("\n");
}

/* ---------------- misc ---------------- */

export function debounce(fn, ms) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

let uidCounter = 0;
export function uid(prefix) {
  uidCounter += 1;
  return `${prefix || "id"}-${Date.now().toString(36)}-${uidCounter}`;
}

export function timeAgo(iso) {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
