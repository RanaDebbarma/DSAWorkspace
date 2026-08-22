import { runTests } from "#functions/code-tester.js";

// LeetCode 287

// o(n) time and o(1) space
// Floyd's Tortoise and Hare algorithm
const solve = function findDuplicate(nums: number[]): number {
  let slow = nums[0];
  let fast = nums[0];

  // Find a meeting point inside the cycle
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);

  // Find the entrance of the cycle
  slow = nums[0];

  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }

  // Cycle entrance = duplicate number
  return slow;
};

runTests(solve, [
  {
    input: [[1, 3, 4, 2, 2]],
    output: 2,
  },
  {
    input: [[3, 1, 3, 4, 2]],
    output: 3,
  },
  {
    input: [[3, 3, 3, 3, 3]],
    output: 3,
  },
]);
