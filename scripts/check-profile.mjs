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
  must(!/gengar|pokemon|pokémon/i.test(svg), "header.svg must not reference third-party IP");
}

if (fail.length) {
  console.error("FAIL\n- " + fail.join("\n- "));
  process.exit(1);
}
console.log("OK: profile README passes all checks");
