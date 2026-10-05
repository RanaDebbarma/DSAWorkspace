import { runTests } from "#functions/code-tester.js";

// LeetCode 27

function removeElement(nums: number[], val: number): number {
  let k = 0;

  for (const num of nums) {
    if (num !== val) {
      nums[k++] = num;
    }
  }

  return k;
}

runTests(removeElement, [
  { input: [[3, 2, 2, 3], 3], output: 2 },
  // [2, 2, "_", "_"]
  {
    input: [[0, 1, 2, 2, 3, 0, 4, 2], 2],
    output: 5,
  },
  // [0, 1, 3, 0, 4, "_", "_", "_"]
]);
