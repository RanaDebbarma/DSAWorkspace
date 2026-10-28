import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 152

// time: O(n^2)
// space: O(1)
// Brute-Force
function maxProduct_BF(nums: number[]): number {
  const n = nums.length;
  let maxP = -Infinity;

  for (let i = 0; i < n; i++) {
    let currP = 1;
    for (let j = i; j < n; j++) {
      currP *= nums[j];
      if (currP > maxP) maxP = currP;
    }
  }

  return maxP;
}

// Optimal
function maxProduct_OPT(nums: number[]): number {
  return 0;
}

const cases: TestCase<typeof maxProduct_OPT>[] = [
  { input: [[2, 3, -2, 4]], output: 6 },
  { input: [[-2, 0, -1]], output: 0 },
  { input: [[2, 4, -3, 5]], output: 8 },
  { input: [[-3, 0, -2, 2]], output: 2 },

  // edge
  { input: [[2, -5, -2, -4, 3]], output: 24 },
  { input: [[-2, 3, -4]], output: 24 },
];

runTests(maxProduct_BF, cases);
runCompare([maxProduct_BF], cases);
