// Prints the GitHub Release text for a version from releases.yaml (English).
// Usage: node scripts/release-notes.js [version] [--title]   (default: the top entry)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const here = path.dirname(fileURLToPath(import.meta.url));

export const KINDS = ['new', 'improvement', 'fix', 'security'];
const HEADINGS = { new: 'New', improvement: 'Improvements', fix: 'Fixes', security: 'Security' };

export function loadReleases(file = path.join(here, '..', 'releases.yaml')) {
  return parse(fs.readFileSync(file, 'utf8'));
}

export function validate(releases) {
  const problems = [];
  if (!Array.isArray(releases) || !releases.length) return ['releases.yaml has no entries'];
  const seen = new Set();
  for (const r of releases) {
    if (!/^\d+\.\d+\.\d+$/.test(String(r.version))) problems.push(`bad version ${r.version}`);
    if (seen.has(r.version)) problems.push(`duplicate version ${r.version}`);
    seen.add(r.version);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(r.date))) problems.push(`${r.version}: bad date`);
    if (!r.title?.en || !r.title?.['pt-br']) problems.push(`${r.version}: title needs en and pt-br`);
    if (!Array.isArray(r.items) || !r.items.length) problems.push(`${r.version}: no items`);
    for (const item of r.items || []) {
      if (!KINDS.includes(item.kind)) problems.push(`${r.version}: unknown kind ${item.kind}`);
      if (!item.text?.en || !item.text?.['pt-br']) problems.push(`${r.version}: every item needs en and pt-br text`);
    }
  }
  return problems;
}

export function notes(release) {
  const lines = [];
  for (const kind of KINDS) {
    const items = release.items.filter((i) => i.kind === kind);
    if (!items.length) continue;
    lines.push(`### ${HEADINGS[kind]}`, '', ...items.map((i) => `- ${String(i.text.en).trim()}`), '');
  }
  return lines.join('\n').trim() + '\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const releases = loadReleases();
  const version = process.argv.slice(2).find((a) => !a.startsWith('--')) || String(releases[0].version);
  const release = releases.find((r) => String(r.version) === version);
  if (!release) { console.error(`No entry for ${version} in releases.yaml`); process.exit(1); }
  process.stdout.write(process.argv.includes('--title') ? `${version}: ${release.title.en}\n` : notes(release));
}
