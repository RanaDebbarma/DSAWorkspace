import { runTests } from "#functions/code-tester.js";

// LeetCode 213

// time: O(n)
// space: O(1)
function rob(nums: number[]): number {
  const n = nums.length;

  if (n === 0) return 0;
  if (n === 1) return nums[0];

  return Math.max(robLinear(0, n - 2), robLinear(1, n - 1));

  // Rob houses in the inclusive range [start, end]
  function robLinear(start: number, end: number): number {
    let prev2 = 0,
      prev1 = 0;

    for (let i = start; i <= end; i++) {
      const rob = prev2 + nums[i];
      const skip = prev1;

      const currMax = Math.max(rob, skip);

      prev2 = prev1;
      prev1 = currMax;
    }

    return prev1;
  }
}

runTests(rob, [
  { input: [[3, 4, 3]], output: 4 },
  { input: [[2, 9, 8, 3, 6]], output: 15 },
  { input: [[2, 3, 2]], output: 3 },
  { input: [[1, 2, 3, 1]], output: 4 },
  { input: [[1, 2, 3]], output: 3 },
]);
