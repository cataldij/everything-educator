#!/usr/bin/env node
/**
 * _pins-feed.mjs, the ONE pins.xml generator, used both by tools/site-build.mjs (in-process
 * import, every local build) and by the Pages-repo GitHub Action `pins-release.yml` (standalone
 * CLI, daily cron). Purpose, usage: 2026-09-27.
 *
 * RSS 2.0 of released pin images, for Pinterest's Auto-publish-from-RSS feature (no Pinterest
 * app/API needed to POST -- see DISTRIBUTION-AUTOPILOT-2026-09-27.md §(iii), row C2). Every item
 * comes from data/distribution/pins/queue.json (tools/_pin-render.mjs) whose `releaseOn` is <=
 * the given date, newest 30, gated by data/distribution/autopilot.json's `pinterest.enabled` +
 * `pinterest.vetoed[]` (read-only -- this file never writes autopilot.json).
 *
 * ⛔ Deliberately does NOT call tools/_autopilot-lib.mjs's readControl(): that helper calls
 * process.exit(0) when a component is disabled, which is correct for a standalone scheduled job
 * but WRONG here, because site-build.mjs imports buildPinsFeed() IN-PROCESS -- an exit(0) here
 * would kill the entire site build, not just the pins step. Disabled or vetoed means "zero
 * items", never "no file": pins.xml must always be a valid, stable-URL RSS document so a poller
 * (or Pinterest itself) never sees a 404 mid-rollout, before Pinterest is even connected.
 *
 * Determinism: renderPinsFeed() is a pure function of (queue, control, dateStr) -- explicit
 * sort, no Date.now()/Math.random() -- so the same on-disk inputs always produce byte-identical
 * XML. That is what lets the daily Action skip a commit when nothing changed.
 *
 * Usage:
 *   node tools/_pins-feed.mjs                         # writes public/pins.xml for today (UTC date)
 *   node tools/_pins-feed.mjs --date 2026-10-01        # simulate a specific date
 *   node tools/_pins-feed.mjs --root <repo root> --out <path>
 *   import { buildPinsFeed, renderPinsFeed } from './_pins-feed.mjs'
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(HERE, '..');
// Must match tools/site-build.mjs's CNAME_HOST/BASE (duplicated, not imported -- site-build.mjs
// runs a full site build at import time via `main().catch(...)`, so importing it is unsafe;
// same convention tools/_pin-render.mjs and tools/_logo-export.mjs already use for brand tokens).
const BASE = 'https://www.theeverythingeducator.com';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

/**
 * Pure function: queue array + control object + a YYYY-MM-DD date -> { xml, count, items }.
 * Exported separately from buildPinsFeed() so a caller that already HAS both objects in memory
 * (a future cross-repo fetch, or a test) never needs to touch the filesystem.
 *
 * Gate semantics: `pinterest.enabled === false` OR `global.enabled === false` -> zero items.
 * Missing fields default OPEN (enabled) rather than closed, so a bare `{}` control (tests, or a
 * fixture proving the date/count arithmetic) yields a full feed; the real autopilot.json always
 * sets these explicitly, so this default never masks a real, deliberate gate in production.
 */
export function renderPinsFeed(queue, control, dateStr) {
  const enabled = control?.pinterest?.enabled !== false && control?.global?.enabled !== false;
  const vetoed = new Set(control?.pinterest?.vetoed || []);
  const due = enabled
    ? (queue || []).filter((r) => r.releaseOn <= dateStr && !vetoed.has(r.id))
    : [];
  // Newest first, id as a stable tiebreaker (releaseOn alone is not unique at 2/day).
  due.sort((a, b) => (b.releaseOn.localeCompare(a.releaseOn)) || String(b.id).localeCompare(String(a.id)));
  const items = due.slice(0, 30);
  const rfc822 = (d) => new Date(d + 'T12:00:00Z').toUTCString(); // noon UTC: clear of any ET/UTC day-boundary ambiguity
  const body = items.map((r) => (
    '  <item>\n'
    + `    <title>${esc(r.title)}</title>\n`
    + `    <link>${esc(r.link)}</link>\n`
    + `    <guid isPermaLink="false">${esc(r.id)}</guid>\n`
    + `    <description>${esc(r.desc)}</description>\n`
    + `    <pubDate>${rfc822(r.releaseOn)}</pubDate>\n`
    + `    <enclosure url="${esc(r.image)}" type="image/jpeg"/>\n`
    + `    <media:content url="${esc(r.image)}" type="image/jpeg" medium="image"/>\n`
    + '  </item>\n'
  )).join('');
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n'
    + '<channel>\n'
    + `  <title>${esc('The Everything Educator: Free Classroom Files')}</title>\n`
    + `  <link>${BASE}/free/</link>\n`
    + `  <description>${esc('Free classroom printables and files from The Everything Educator.')}</description>\n`
    + '  <language>en-us</language>\n'
    + `  <atom:link href="${BASE}/pins.xml" rel="self" type="application/rss+xml"/>\n`
    + body
    + '</channel>\n</rss>\n';
  return { xml, count: items.length, items };
}

/** Reads the local queue.json + autopilot.json off disk and calls renderPinsFeed(). Used by
 *  site-build.mjs (rootDir = its ROOT) and by local CLI runs / this file's own validation. */
export function buildPinsFeed({ rootDir = DEFAULT_ROOT, date } = {}) {
  const dateStr = date || new Date().toISOString().slice(0, 10);
  const queue = readJson(path.join(rootDir, 'data/distribution/pins/queue.json'), []);
  const control = readJson(path.join(rootDir, 'data/distribution/autopilot.json'), {});
  return { ...renderPinsFeed(queue, control, dateStr), dateStr };
}

// ── CLI ──────────────────────────────────────────────────────────────────────────────────────
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const argv = process.argv.slice(2);
  const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
  const rootDir = path.resolve(flag('root', DEFAULT_ROOT));
  const date = flag('date', null);
  const out = path.resolve(flag('out', path.join(rootDir, 'everything-educator-site/public/pins.xml')));
  const { xml, count, dateStr } = buildPinsFeed({ rootDir, date });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, xml, 'utf8');
  console.log(`pins.xml: ${count} item(s) due as of ${dateStr} -> ${out}`);
}
