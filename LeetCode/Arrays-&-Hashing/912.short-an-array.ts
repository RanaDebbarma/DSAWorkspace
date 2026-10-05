import { runTests } from "#functions/code-tester.js";

// LeetCode 912

function shortArray(nums: number[]): number[] {
  return [];
}

runTests(shortArray, [
  { input: [[10, 9, 1, 1, 1, 2, 3, 1]], output: [1, 1, 1, 1, 2, 3, 9, 10] },
  { input: [[5, 10, 2, 1, 3]], output: [1, 2, 3, 5, 10] },
]);
