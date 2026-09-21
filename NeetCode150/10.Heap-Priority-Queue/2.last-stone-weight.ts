import { runTests } from "#functions/code-tester.js";

// LeetCode 1046

function lastStoneWeight(stones: number[]): number {
  return 0;
}

runTests(lastStoneWeight, [
  { input: [[2, 7, 4, 1, 8, 1]], output: 1 },
  { input: [[2, 3, 6, 2, 4]], output: 1 },
  { input: [[1, 2]], output: 1 },
  { input: [[1]], output: 1 },
]);
