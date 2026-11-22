import { describe, expect, it } from 'vitest';
import releases from 'virtual:releases';
import { validate, notes, loadReleases } from '../scripts/release-notes.js';
import pkg from '../package.json';

describe('release history', () => {
  it('is valid: versions, dates, kinds and both languages', () => {
    expect(validate(releases)).toEqual([]);
  });

  it('has a top entry that matches package.json', () => {
    expect(String(releases[0].version)).toBe(pkg.version);
  });

  it('is the same data the release script reads', () => {
    expect(loadReleases().map((r) => String(r.version))).toEqual(releases.map((r) => String(r.version)));
  });

  it('writes GitHub release notes grouped by kind', () => {
    const text = notes(releases[0]);
    expect(text).toContain('### New');
    expect(text).not.toContain('undefined');
  });
});
