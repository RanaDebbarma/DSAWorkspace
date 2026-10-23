import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 81

// time: O(n)
// space: O(1)
// Brute-force --- linear-search
function search_BF(nums: number[], target: number): boolean {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return true;
  }

  return false;
}

// time: O(log(n)) but O(n) in worst case
// space: O(1)
function search_OA(nums: number[], target: number): boolean {
  let l = 0;
  let r = nums.length - 1;

  while (l <= r) {
    const mid = l + ((r - l) >> 1);

    if (nums[mid] === target) return true;

    // Cannot determine the sorted half due to duplicates.
    if (nums[l] === nums[mid] && nums[mid] === nums[r]) {
      l++;
      r--;
    }
    // Left half is sorted.
    else if (nums[l] <= nums[mid]) {
      if (nums[l] <= target && target < nums[mid]) {
        r = mid - 1;
      } else {
        l = mid + 1;
      }
    }
    // Right half is sorted.
    else {
      if (nums[mid] < target && target <= nums[r]) {
        l = mid + 1;
      } else {
        r = mid - 1;
      }
    }
  }

  return false;
}

const cases: TestCase<typeof search_OA>[] = [
  { input: [[3, 4, 4, 5, 6, 1, 2, 2], 1], output: true },
  { input: [[3, 5, 6, 0, 0, 1, 2], 4], output: false },
  { input: [[2, 5, 6, 0, 0, 1, 2], 0], output: true },
  { input: [[2, 5, 6, 0, 0, 1, 2], 3], output: false },

  // edge case
  { input: [[1, 0, 1, 1, 1], 0], output: true },
];

runTests(search_OA, cases);
runCompare([search_BF, search_OA], cases, {
  summaryOnly: true,
  fnDisplay: "number",
});
