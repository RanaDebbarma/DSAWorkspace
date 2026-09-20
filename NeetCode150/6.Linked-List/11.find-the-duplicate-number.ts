import { runTests } from "#functions/code-tester.js";

// LeetCode 287

function findDuplicate(nums: number[]): number {
  let slow = nums[0];
  let fast = nums[0];

  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);

  let pointer = nums[0];
  while (pointer !== slow) {
    pointer = nums[pointer];
    slow = nums[slow];
  }

  return slow;
}

runTests(findDuplicate, [
  { input: [[1, 2, 3, 2, 2]], output: 2 },
  { input: [[1, 2, 3, 4, 4]], output: 4 },
  { input: [[1, 3, 4, 2, 2]], output: 2 },
  { input: [[3, 1, 3, 4, 2]], output: 3 },
  { input: [[3, 3, 3, 3, 3]], output: 3 },
]);
