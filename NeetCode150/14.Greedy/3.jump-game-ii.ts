import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 45

// Brute-Force
function jump_BF(nums: number[]): number {
  return 0;
}

// Optimal
function jump_OPT(nums: number[]): number {
  return 0;
}

const cases: TestCase<typeof jump_OPT>[] = [
  { input: [[2, 4, 1, 1, 1, 1]], output: 2 },
  { input: [[2, 1, 2, 1, 0]], output: 2 },
  { input: [[2, 3, 1, 1, 4]], output: 2 },
  { input: [[2, 3, 0, 1, 4]], output: 2 },
];

runTests(jump_OPT, cases);
runCompare([jump_BF, jump_OPT], cases);
