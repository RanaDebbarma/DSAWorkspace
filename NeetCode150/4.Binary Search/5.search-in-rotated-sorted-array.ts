import { runTests, TestCase } from "#functions/code-tester.js";

const myFunc = function search(nums: number[], target: number): number {
  let l = 0;
  let r = nums.length - 1;

  while (l <= r) {
    const mid = l + Math.floor((r - l) / 2);

    if (nums[mid] === target) return mid;

    if (nums[l] <= nums[mid]) {
      if (nums[l] <= target && target < nums[mid]) {
        r = mid - 1;
      } else {
        l = mid + 1;
      }
    } else {
      if (nums[mid] < target && target <= nums[r]) {
        l = mid + 1;
      } else {
        r = mid - 1;
      }
    }
  }

  return -1;
};

const inputs: TestCase<typeof myFunc>[] = [
  // Leetcode
  { input: [[4, 5, 6, 7, 0, 1, 2], 0], output: 4 },
  { input: [[4, 5, 6, 7, 0, 1, 2], 3], output: -1 },
  { input: [[1], 0], output: -1 },

  // Neetcode
  { input: [[3, 4, 5, 6, 1, 2], 1], output: 4 },
  { input: [[3, 5, 6, 0, 1, 2], 4], output: -1 },

  // Edge
  { input: [[6, 7, 8, 1, 2, 3, 4], 7], output: 1 },
  { input: [[3, 1], 1], output: 1 },
];

runTests(myFunc, inputs, true);
