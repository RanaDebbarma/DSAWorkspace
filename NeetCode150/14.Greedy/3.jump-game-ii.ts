import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 45

// time: O(n)
// space: O(1)
// Greedy
function jump(nums: number[]): number {
  const n = nums.length;
  let farthestReach  = 0;
  let currentEnd = 0;
  let jumps = 0;

  for (let i = 0; i < n - 1; i++) {
    farthestReach  = Math.max(farthestReach , i + nums[i]);

    if (i === currentEnd) {
      jumps++;
      currentEnd = farthestReach ; // Extend the reachable range with another jump.
    }

    if (currentEnd >= n - 1) return jumps;
  }

  return jumps;
}

const cases: TestCase<typeof jump>[] = [
  { input: [[2, 4, 1, 1, 1, 1]], output: 2 },
  { input: [[2, 1, 2, 1, 0]], output: 2 },
  { input: [[2, 3, 1, 1, 4]], output: 2 },
  { input: [[2, 3, 0, 1, 4]], output: 2 },

  // edge
  { input: [[3, 3, 4, 1, 1, 1, 0]], output: 2 },
];

runTests(jump, cases);
runCompare([jump], cases);
