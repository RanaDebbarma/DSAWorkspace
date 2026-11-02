import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 55

// time: O(n)
// space: O(1)
// Greedy
function canJump(nums: number[]): boolean {
  const n = nums.length;
  let maxDist = 0;

  for (let i = 0; i < n; i++) {
    if (maxDist < i) return false;
    if (maxDist >= n - 1) return true;
    
    // Track the farthest reachable index.
    maxDist = Math.max(i + nums[i], maxDist);
  }

  return true;
}
const cases: TestCase<typeof canJump>[] = [
  { input: [[2, 3, 1, 1, 4]], output: true },
  { input: [[3, 2, 1, 0, 4]], output: false },
  { input: [[1, 2, 0, 1, 0]], output: true },
  { input: [[1, 2, 1, 0, 1]], output: false },

  // edge
  { input: [[2, 5, 0, 0]], output: true },
];

runTests(canJump, cases);
runCompare([canJump], cases);
