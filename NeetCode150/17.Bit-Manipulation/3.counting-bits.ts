import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 338

// k = bits
// time: O(n x k) / O(n log n)
// space: O(n) | auxiliary space: O(1);
function countingBits(n: number): number[] {
  const res = Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    let ones = 0;
    let currN = i;

    while (currN !== 0) {
      currN &= currN - 1;
      ones++;
    }

    res[i] = ones;
  }

  return res;
}

// time: O(n)
// space: O(n) | auxiliary space: O(1)
// dp approach
function countingBits_DP(n: number): number[] {
  const dp = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    dp[i] = dp[i >>> 1] + (i & 1);
  }

  return dp;
}

const cases: TestCase<typeof countingBits>[] = [
  { input: [2], output: [0, 1, 1] },
  { input: [5], output: [0, 1, 1, 2, 1, 2] },
  { input: [4], output: [0, 1, 1, 2, 1] },

  // bigInput
  { input: [10000], output: countingBits_DP(10000) },
];

runTests(countingBits_DP, cases, { hideBigOutput: true });
runCompare([countingBits, countingBits_DP], cases);
