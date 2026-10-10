// Shared taxonomies for KreatorAI. No external data — everything local.

export const CHIPS = [
  "All",
  "Video",
  "Animation",
  "Motion Graphics",
  "Illustration & Graphics",
  "3D & Product",
  "Fashion & Lifestyle",
  "Voice & Audio",
  "Music",
  "Social Ads",
  "Storyboarding",
  "Brand Identity",
];

export const SPECIALIZATIONS = CHIPS.filter((c) => c !== "All");

export const TOOLS = [
  { name: "Runway", kind: "Video generation", commercialSafe: true },
  { name: "Sora", kind: "Video generation", commercialSafe: false },
  { name: "Veo", kind: "Video generation", commercialSafe: true },
  { name: "Kling", kind: "Video generation", commercialSafe: true },
  { name: "Pika", kind: "Video generation", commercialSafe: true },
  { name: "Midjourney", kind: "Image generation", commercialSafe: true },
  { name: "Stable Diffusion", kind: "Image generation", commercialSafe: true },
  { name: "ComfyUI", kind: "Workflow / image", commercialSafe: true },
  { name: "Firefly", kind: "Image generation", commercialSafe: true },
  { name: "DALL-E", kind: "Image generation", commercialSafe: true },
  { name: "ElevenLabs", kind: "Voice / audio", commercialSafe: true },
  { name: "Suno", kind: "Music generation", commercialSafe: false },
  { name: "Udio", kind: "Music generation", commercialSafe: false },
  { name: "Topaz", kind: "Upscaling", commercialSafe: true },
  { name: "Premiere Pro", kind: "Editing", commercialSafe: true },
  { name: "After Effects", kind: "Motion design", commercialSafe: true },
  { name: "Blender", kind: "3D", commercialSafe: true },
  { name: "Photoshop", kind: "Retouching", commercialSafe: true },
];

export const TOOL_NAMES = TOOLS.map((t) => t.name);
export const commercialSafeTools = () =>
  TOOLS.filter((t) => t.commercialSafe).map((t) => t.name);

export const SKILLS = [
  "AI direction",
  "Prompt engineering",
  "Character consistency",
  "Lip-sync",
  "Inpainting",
  "Upscaling",
  "Color grading",
  "Sound design",
  "Voice cloning",
  "Jingle writing",
  "Storyboard art",
  "Logo systems",
  "Packaging mockups",
  "Product renders",
  "Fashion editorial",
  "UGC-style ads",
  "Explainer videos",
  "Lyric videos",
  "Stop-motion feel",
  "Cinematic lighting",
];

// One vocabulary everywhere: creator.contentTypes, brief.contentType, the browse
// filter and the brief form all use the same craft names as CHIPS.
export const CONTENT_TYPES = SPECIALIZATIONS;

export const ASPECT_RATIOS = ["9:16", "1:1", "16:9", "4:5"];

export const COMMERCIAL_LEVELS = [
  { id: "any", label: "Any licence" },
  { id: "editorial", label: "Editorial / portfolio OK" },
  { id: "organic", label: "Organic social OK" },
  { id: "paid", label: "Paid ads OK" },
  { id: "buyout", label: "Full buyout available" },
];
// ordered by permissiveness so filters can do "at least this level"
export const LICENSE_ORDER = ["editorial", "organic", "paid", "buyout"];

export const PRICE_BANDS = [
  { id: "any", label: "Any budget", min: 0, max: Infinity },
  { id: "u25", label: "Under ₹25k", min: 0, max: 25000 },
  { id: "25to60", label: "₹25k – ₹60k", min: 25000, max: 60000 },
  { id: "60to120", label: "₹60k – ₹1.2L", min: 60000, max: 120000 },
  { id: "120p", label: "₹1.2L+", min: 120000, max: Infinity },
];

export const AVAILABILITY = ["Available now", "Booking ahead", "Waitlist"];

export const LANGUAGES = [
  "English",
  "Hindi",
  "Hinglish",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
  "Malayalam",
  "Kannada",
  "Punjabi",
  "Gujarati",
  "Urdu",
];

export const STAGES = [
  "Discovery",
  "Shortlist",
  "Proposal",
  "Contract",
  "Production",
  "Review",
  "Delivered",
];

export const TONES = ["Friendly", "Playful", "Premium", "Warm", "Bold", "Minimal", "Trustworthy"];

export const BRIEF_STATUSES = ["Draft", "Published", "In discussion", "In production", "Delivered"];

export const VERIFY_SIGNALS = [
  {
    id: "tools",
    label: "Verified tools",
    expl: "The creator showed proof of a paid subscription or licence for the AI tools they list. Checked against receipts or account screenshots shared with KreatorAI.",
  },
  {
    id: "workflow",
    label: "Workflow verified",
    expl: "The creator's step-by-step process (prompt → generate → refine → deliver) was reviewed from real project documentation.",
  },
  {
    id: "pastWork",
    label: "Past work verified",
    expl: "At least two portfolio pieces were confirmed with the named client or a public source.",
  },
  {
    id: "commercialSafe",
    label: "Commercial-safe",
    expl: "Every AI tool this creator uses is licensed for commercial client work — no research-only or non-commercial models in their pipeline.",
  },
];

export const inr = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
