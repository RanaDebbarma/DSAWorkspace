import { runTests } from "#functions/code-tester.js";

// Optimal (monotonic stack)
function search(nums: number[], target: number): number {
  let l = 0;
  let r = nums.length - 1;

  while (l <= r) {
    const mid = Math.floor((r + l) / 2);

    if (nums[mid] === target) return mid;

    if (nums[mid] < target) {
      l = mid + 1;
    } else {
      r = mid - 1;
    }
  }

  return -1;
}

runTests(search, [
  // Leetcode
  { input: [[-1, 0, 3, 5, 9, 12], 9], output: 4 },
  { input: [[-1, 0, 3, 5, 9, 12], 1], output: -1 },

  // Neetcode
  // { input: [[-1,0,2,4,6,8], 4], output: 3 },
  // { input: [[-1,0,2,4,6,8], 3], output: -1 },
]);
