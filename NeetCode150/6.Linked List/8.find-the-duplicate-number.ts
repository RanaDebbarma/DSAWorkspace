import { runTests } from "#functions/code-tester.js";
import { createLinkedList, ListNode } from "#functions/linked-list.js";

// LeetCode 287

const solve = function findDuplicate(nums: number[]): number {
  return nums[0];
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

/*
Example 1:
Input: nums = [1,3,4,2,2]
Output: 2

Example 2:
Input: nums = [3,1,3,4,2]
Output: 3

Example 3:
Input: nums = [3,3,3,3,3]
Output: 3
*/
