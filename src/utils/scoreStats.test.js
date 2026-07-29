import { describe, expect, it } from 'vitest';
import {
  average,
  getNumericScores,
  scoreStats,
  standardDeviation,
} from './scoreStats';

describe('scoreStats utilities', () => {
  it('returns only numeric scores', () => {
    expect(
      getNumericScores([{ score: 1 }, { score: '?' }, { score: 5 }]),
    ).toEqual([1, 5]);
  });

  it('calculates an average and population standard deviation', () => {
    expect(average([1, 2, 3])).toBe(2);
    expect(standardDeviation([1, 2, 3])).toBeCloseTo(Math.sqrt(2 / 3));
  });

  it.each([
    ['an empty array', []],
    ['only special scores', [{ score: '?' }, { score: '☕' }]],
  ])('returns null statistics for %s', (_, scores) => {
    expect(scoreStats(scores)).toEqual({
      numericScores: [],
      lowest: null,
      highest: null,
      avg: null,
      stddev: null,
    });
  });

  it('calculates statistics for a single numeric score', () => {
    expect(scoreStats([{ score: 8 }])).toEqual({
      numericScores: [8],
      lowest: 8,
      highest: 8,
      avg: 8,
      stddev: 0,
    });
  });

  it('excludes special scores from mixed statistics', () => {
    expect(scoreStats([{ score: 1 }, { score: '?' }, { score: 5 }])).toEqual({
      numericScores: [1, 5],
      lowest: 1,
      highest: 5,
      avg: 3,
      stddev: 2,
    });
  });

  it('returns zero standard deviation when all scores are equal', () => {
    expect(scoreStats([{ score: 3 }, { score: 3 }, { score: 3 }])).toEqual({
      numericScores: [3, 3, 3],
      lowest: 3,
      highest: 3,
      avg: 3,
      stddev: 0,
    });
  });
});
