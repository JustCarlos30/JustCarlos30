// Acceptance check for the GitHub profile README (JustCarlos30/JustCarlos30).
// Run: node scripts/check-profile.mjs
import { readFileSync, existsSync } from "node:fs";

const fail = [];
const must = (cond, msg) => { if (!cond) fail.push(msg); };

must(existsSync("README.md"), "README.md is missing");
const readme = existsSync("README.md") ? readFileSync("README.md", "utf8") : "";
const lower = readme.toLowerCase();

// English bio content
must(/software engineer/i.test(readme), "bio must say Software Engineer");
must(/5\+? years/i.test(readme), "bio must mention 5 years of experience");
must(/\bAI\b/.test(readme), "bio must mention AI");

// Day job + tools
must(/\bAlbo\b/.test(readme), "must mention working at Albo");
must(/fintech/i.test(readme), "must mention fintech");
must(/\bClaude\b/.test(readme), "must mention Claude");
must(/\bCodex\b/.test(readme), "must mention Codex");

// Public repos being built
for (const repo of ["taller-videos", "skills-videos-cortos"]) {
  must(readme.includes(`github.com/JustCarlos30/${repo}`), `must link public repo ${repo}`);
}

// Private repos must not be exposed
for (const priv of ["phantom-workspace", "JustCarlos30/canal"]) {
  must(!readme.includes(priv), `must not mention private repo ${priv}`);
}

// Original phantom theme only: no third-party characters/IP
for (const banned of ["gengar", "pokemon", "pokémon", "nintendo"]) {
  must(!lower.includes(banned), `must not reference "${banned}"`);
}
if (existsSync("assets/header.svg")) {
  const svgLower = readFileSync("assets/header.svg", "utf8").toLowerCase();
  for (const banned of ["gengar", "pokemon", "pokémon", "nintendo"]) {
    must(!svgLower.includes(banned), `header.svg must not reference "${banned}"`);
  }
}

// README structure: accessible cover, no filler or fabricated durations
must(/<img[^>]+src="assets\/header\.svg"[^>]+alt="[^"]{20,}"/.test(readme), "cover <img> needs a descriptive alt");
must(/<img[^>]+width="[^"]+"/.test(readme), "cover <img> needs a width");
must(!/more work to follow/i.test(readme), "remove filler text");
must(!/\b\d{1,2}:\d{2}\b/.test(readme), "no fabricated track durations");
for (const m of readme.matchAll(/\]\(#([^)]+)\)/g)) {
  const slug = m[1];
  const ok = [...readme.matchAll(/^#{1,6}\s+(.+)$/gm)].some(h =>
    h[1].trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") === slug);
  must(ok, `nav anchor #${slug} has no matching heading`);
}
for (const m of readme.matchAll(/(?:src="|!\[[^\]]*\]\()(assets\/[^"\s)]+)/g)) {
  must(existsSync(m[1]), `missing local asset ${m[1]}`);
}

// Header SVG: present, referenced, well-formed enough, self-contained
must(existsSync("assets/header.svg"), "assets/header.svg is missing");
must(readme.includes("assets/header.svg"), "README must embed assets/header.svg");
if (existsSync("assets/header.svg")) {
  const svg = readFileSync("assets/header.svg", "utf8");
  must(/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/.test(svg), "header.svg must start with <svg>");
  must(svg.trim().endsWith("</svg>"), "header.svg must end with </svg>");
  must(svg.includes('xmlns="http://www.w3.org/2000/svg"'), "header.svg needs xmlns");
  must(!/<script/i.test(svg), "header.svg must not contain <script> (GitHub strips it)");
  must(!/https?:\/\/(?!www\.w3\.org)/.test(svg), "header.svg must not load external resources");
  must(!/<foreignObject/i.test(svg), "header.svg must not use foreignObject");
  must(!/\son[a-z]+\s*=/i.test(svg), "header.svg must not have event handlers");
  must(!/<image[\s>]/i.test(svg), "header.svg must not embed images");
  must(/viewBox="[^"]+"/.test(svg), "header.svg needs a viewBox");
  must(/<title[\s>]/.test(svg) && /<desc[\s>]/.test(svg), "header.svg needs <title> and <desc>");
  must(!/<(animate|set)[\s>]/i.test(svg), "header.svg must be static");
  must(!/(href|src)="(?!#)/i.test(svg) && !/url\((?!#)/i.test(svg), "header.svg must only reference internal ids");
  must(/AFTER HOURS/.test(svg), "header.svg needs the AFTER HOURS label");
  must(/feTurbulence/.test(svg), "header.svg needs film grain (feTurbulence)");
}

if (fail.length) {
  console.error("FAIL\n- " + fail.join("\n- "));
  process.exit(1);
}
console.log("OK: profile README passes all checks");
