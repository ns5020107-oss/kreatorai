// Import the 100-row public directory CSV into KreatorAI.
// Plain Node, zero dependencies. Run once:  node scripts/import-creators.js
// Reads  the directory CSV (UTF-8 with BOM) — path via argv[2], $CREATOR_CSV, or ./data/
// Writes src/data/directory100.js  (DIRECTORY_CREATORS + CHIP_MAP)
// Exits non-zero if any row is dropped or any required field is empty/undefined.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// Usage: node scripts/import-creators.js [path/to/ai_creator_directory_seed_100.csv]
// (or set CREATOR_CSV). Defaults to ./data/ai_creator_directory_seed_100.csv in the repo.
const CSV_PATH =
  process.argv[2] ||
  process.env.CREATOR_CSV ||
  join(ROOT, "data/ai_creator_directory_seed_100.csv");
const OUT_PATH = join(ROOT, "src/data/directory100.js");

/* ---------- minimal RFC-4180 CSV parser (quoted fields, embedded commas) ---------- */
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field); field = "";
    } else if (ch === "\n") {
      row.push(field); rows.push(row); row = []; field = "";
    } else if (ch === "\r") {
      /* skip */
    } else field += ch;
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0].trim() !== ""));
}

/* ---------- chip mapping (§6): explicit overrides first, then keyword rules ---------- */
const CHIP_OVERRIDES = {
  "ai / film / interactive media": "Video",
  "ai visual art / film": "Video",
  "ai directing / film": "Video",
  "ai creative studio / ads": "Social Ads",
  "ai content studio / ads / micro-drama": "Social Ads",
};

function mapChip(contentType) {
  const t = (contentType || "").toLowerCase().trim();
  if (CHIP_OVERRIDES[t]) return CHIP_OVERRIDES[t];
  if (t.includes("ads") || t.includes("ugc") || t.includes("brand campaign")) return "Social Ads";
  if (t.includes("film") || t.includes("video") || t.includes("performance") || t.includes("directing")) return "Video";
  if (t.includes("music")) return "Music";
  if (t.includes("audio") || t.includes("voice")) return "Voice & Audio";
  if (t.includes("fashion") || t.includes("influencer") || t.includes("persona") || t.includes("avatar")) return "Fashion & Lifestyle";
  if (t.includes("architect")) return "3D & Product";
  if (t.includes("sculpture")) return "3D & Product";
  if (t.includes("immersive") || t.includes("installation")) return "3D & Product";
  if (t.includes("movement")) return "Motion Graphics";
  if (t.includes("illustration")) return "Illustration & Graphics";
  if (t.includes("writing")) return "Storyboarding";
  if (t.includes("speculative design")) return "Brand Identity";
  if (t.includes("studio")) return "Video"; // studios in this dataset are film/content studios
  return "Illustration & Graphics"; // art default
}

const VALID_CHIPS = new Set([
  "Video", "Animation", "Motion Graphics", "Illustration & Graphics", "3D & Product",
  "Fashion & Lifestyle", "Voice & Audio", "Music", "Social Ads", "Storyboarding", "Brand Identity",
]);

/* ---------- source labels (§5) ---------- */
const SOURCE_LABELS = [
  ["aiartists.org", "AI Artists Directory"],
  ["bestaifilms.com", "Best AI Films"],
  ["diffuse.runway.com", "Runway Talent"],
  ["artificiallabs.in", "Artificial Labs"],
  ["desicmo.com", "DesiCMO"],
  ["thezyra.studio", "Zyra Studio"],
  ["framite.com", "Framite"],
  ["ethicalaistudios.com", "Ethical AI Studios"],
  ["pumpkinai.studio", "Pumpkin AI"],
  ["xhadow.in", "Xhadow"],
  ["prestonx.com", "PrestonX"],
  ["nextedgestudio.com", "NextEdge Studio"],
  ["domestika.org", "Domestika"],
];
function sourceLabel(url) {
  const u = (url || "").toLowerCase();
  for (const [frag, label] of SOURCE_LABELS) if (u.includes(frag)) return label;
  return "Public directory";
}

/* ---------- location (§5, §7) ---------- */
function mapLocation(country) {
  const c = (country || "").trim();
  if (!c) return "Location not listed";
  if (c === "Global") return "Working worldwide";
  return c.replace(/\s*\/\s*/g, " · ");
}
function locationPhrase(country) {
  const c = (country || "").trim();
  if (c === "United States") return "the United States";
  if (c === "United Kingdom") return "the United Kingdom";
  if (c === "India") return "India";
  if (c === "Global") return "working worldwide";
  if (!c) return "an undisclosed location";
  return c.replace(/\s*\/\s*/g, " · ");
}

/* ---------- deterministic hue from name ---------- */
function hueOf(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

/* ---------- main ---------- */
function main() {
  let raw;
  try {
    raw = readFileSync(CSV_PATH, "utf8");
  } catch (err) {
    console.error(`Cannot read the creator CSV at:\n  ${CSV_PATH}\nPass the path as an argument or set CREATOR_CSV.`);
    process.exit(1);
  }
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1); // strip BOM (utf-8-sig)

  const rows = parseCSV(raw);
  const header = rows[0].map((h) => h.trim());
  const expected = ["name","username","platform","profile_url","portfolio_url","content_type",
    "tools_used","specialization","country","business_contact","source_url",
    "verification_status","listing_type","notes"];
  const headerOk = expected.every((h, i) => header[i] === h);
  if (!headerOk) {
    console.error("FATAL: CSV header mismatch. Got:", JSON.stringify(header));
    process.exit(1);
  }

  const data = rows.slice(1);
  const errors = [];
  const creators = [];
  const chipCounts = {};
  let withWebsite = 0, withoutWebsite = 0;
  const seenNames = new Set();

  data.forEach((cols, idx) => {
    const r = {};
    header.forEach((h, i) => { r[h] = (cols[i] ?? "").trim(); });
    const n = idx + 1;
    const id = `d${n}`;

    if (!r.name) errors.push(`row ${n}: empty name — row dropped`);
    const chip = mapChip(r.content_type);
    if (!VALID_CHIPS.has(chip)) errors.push(`row ${n} (${r.name}): chip "${chip}" not in taxonomy`);
    if (!r.content_type) errors.push(`row ${n} (${r.name}): empty content_type`);

    const location = mapLocation(r.country);
    const label = sourceLabel(r.source_url);
    const bio =
      `${r.name} is a ${r.content_type} practitioner based in ${locationPhrase(r.country)}. ` +
      `They were found through a public creator directory (${label}) — availability, contact details ` +
      `and willingness to join this marketplace are not confirmed.`;

    const hasWebsite = !!r.profile_url;
    if (hasWebsite) withWebsite++; else withoutWebsite++;

    if (seenNames.has(r.name.toLowerCase())) {
      console.warn(`WARN: duplicate name "${r.name}" at row ${n} (kept, ids stay unique)`);
    }
    seenNames.add(r.name.toLowerCase());

    // required-field audit — fail loudly on empty/undefined
    const required = { id, name: r.name, specialization: chip, location, bio,
      sourceName: label, sourceUrl: r.source_url, sourceNote: r.notes };
    for (const [k, v] of Object.entries(required)) {
      if (v === undefined || v === null || String(v).trim() === "") {
        errors.push(`row ${n} (${r.name || "?"}): required field "${k}" is empty`);
      }
    }

    creators.push({
      id,
      source: "directory",
      name: r.name,
      headline: r.content_type, // real listed field — never invented
      location,
      languages: [],
      availability: "Not confirmed",
      rateMin: null,
      rateMax: null,
      responseTime: null,
      bio,
      specialization: chip,
      rawSpecialization: r.content_type,
      skills: [],
      tools: [],
      contentTypes: [chip],
      aspectRatios: [],
      licenseLevel: null,
      verify: { listed: true, tools: false, workflow: false, pastWork: false, commercialSafe: false },
      trustScore: null,
      rating: null,
      reviews: null,
      joined: null,
      hue: hueOf(r.name),
      portfolio: [],
      testimonials: [],
      platform: r.platform === "Website" ? "Website" : "Not listed",
      websiteUrl: r.profile_url || null,
      portfolioUrl: r.portfolio_url || null,
      sourceName: label,
      sourceUrl: r.source_url,
      sourceNote: r.notes,
    });

    chipCounts[chip] = (chipCounts[chip] || 0) + 1;
  });

  if (creators.length !== 100) {
    errors.push(`row count is ${creators.length}, expected exactly 100`);
  }

  // ---- verification summary ----
  console.log("=== import-creators summary ===");
  console.log(`rows read: ${data.length} → creators built: ${creators.length}`);
  console.log(`with website: ${withWebsite} · without website: ${withoutWebsite}`);
  console.log("chip distribution:");
  for (const [chip, count] of Object.entries(chipCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${chip}: ${count}`);
  }

  if (errors.length > 0) {
    console.error(`\nFATAL: ${errors.length} error(s):`);
    errors.forEach((e) => console.error("  - " + e));
    process.exit(1);
  }

  // ---- write output ----
  const out =
`// GENERATED by scripts/import-creators.js — do not edit by hand.
// 100 real public-directory listings. Availability, contact details and
// verification are NOT confirmed (see sourceNote on each record).
// Regenerate: node scripts/import-creators.js

export const DIRECTORY_CREATORS = ${JSON.stringify(creators, null, 2)};

export const CHIP_MAP = ${JSON.stringify(chipCounts, null, 2)};
`;
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, out, "utf8");
  console.log(`\nwrote ${OUT_PATH} (${creators.length} creators) — OK`);
}

main();
