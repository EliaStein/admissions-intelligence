import { describe, it, expect } from 'vitest';
import { formatWordLimit, submissionWordCap } from '@/types/prompt';

// Regression cover for the "Essay exceeds the 0 word limit" bug: the CRM uses
// NULL word_limit to mean "the school states no word limit", and coercing that
// to 0 made 34 prompts across 17 schools permanently unsubmittable in prod.

describe('formatWordLimit', () => {
  it('renders a plain limit', () => {
    expect(formatWordLimit({ word_count: 650 })).toBe('650 words');
  });

  it('renders a min–max range when a minimum is set', () => {
    expect(formatWordLimit({ word_count: 400, min_word_count: 250 })).toBe('250–400 words');
  });

  it('ignores a zero/absent minimum', () => {
    expect(formatWordLimit({ word_count: 400, min_word_count: 0 })).toBe('400 words');
    expect(formatWordLimit({ word_count: 400, min_word_count: null })).toBe('400 words');
  });

  it('says so when there is no stated limit, rather than showing 0', () => {
    expect(formatWordLimit({ word_count: null })).toBe('No stated word limit');
  });
});

describe('submissionWordCap', () => {
  it('caps personal statements at 1000 regardless of the prompt', () => {
    expect(submissionWordCap({ word_count: 650 }, 'personal')).toBe(1000);
    expect(submissionWordCap({ word_count: null }, 'personal')).toBe(1000);
  });

  it('caps supplementals at twice the stated limit', () => {
    expect(submissionWordCap({ word_count: 250 }, 'supplemental')).toBe(500);
  });

  it('leaves supplementals uncapped when no limit is stated', () => {
    expect(submissionWordCap({ word_count: null }, 'supplemental')).toBeNull();
  });

  it('never returns 0 for a no-limit prompt (the original bug)', () => {
    // A 0 cap rejects every non-empty essay, which is what shipped.
    expect(submissionWordCap({ word_count: null }, 'supplemental')).not.toBe(0);
  });
});
