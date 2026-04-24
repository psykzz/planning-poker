/**
 * Returns the numeric subset of a scores array (score >= 0).
 * @param {Array<{score: number}>} scores
 * @returns {number[]}
 */
export const getNumericScores = scores =>
  (scores || []).filter(s => s.score >= 0).map(s => s.score);

/**
 * @param {number[]} nums
 * @returns {number}
 */
export const average = nums => nums.reduce((p, c) => p + c, 0) / nums.length;

/**
 * @param {number[]} nums
 * @returns {number}
 */
export const standardDeviation = nums => {
  const n = nums.length;
  if (!n) return NaN;
  const mean = average(nums);
  return Math.sqrt(
    nums.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n,
  );
};

/**
 * Computes summary statistics for a scores array.
 * @param {Array<{score: number}>} scores
 * @returns {{ numericScores: number[], lowest: number|null, highest: number|null, avg: number|null, stddev: number|null }}
 */
export const scoreStats = scores => {
  const numericScores = getNumericScores(scores);
  if (!numericScores.length) {
    return {
      numericScores,
      lowest: null,
      highest: null,
      avg: null,
      stddev: null,
    };
  }
  return {
    numericScores,
    lowest: Math.min(...numericScores),
    highest: Math.max(...numericScores),
    avg: average(numericScores),
    stddev: standardDeviation(numericScores),
  };
};
