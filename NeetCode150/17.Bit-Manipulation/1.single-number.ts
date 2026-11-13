import { runTests } from "#functions/code-tester.js";

// LeetCode 136

function singleNumber(nums: number[]): number {
  let res = 0;

  for (const num of nums) {
    res ^= num;
  }

  return res;
}

runTests(singleNumber, [
  { input: [[2, 2, 1]], output: 1 },
  { input: [[4, 1, 2, 1, 2]], output: 4 },
  { input: [[1]], output: 1 },
  { input: [[3, 2, 3]], output: 2 },
  { input: [[7, 6, 6, 7, 8]], output: 8 },
]);
