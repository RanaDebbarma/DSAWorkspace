import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 53

// time: O(n^2)
// space: O(1)
// Brute-Force
function maxSubarray_BF(nums: number[]): number {
  const n = nums.length;
  let max = -Infinity;

  for (let start = 0; start < n; start++) {
    let sum = 0;
    for (let i = start; i < n; i++) {
      sum += nums[i];
      max = Math.max(max, sum);
    }
  }

  return max;
}

// time: O(n)
// space: O(n)
// Dynamic programming (bottom-up)
function maxSubarray_DP(nums: number[]): number {
  const n = nums.length;
  const dp = Array(n);

  dp[0] = nums[0];

  for (let i = 1; i < n; i++) {
    dp[i] = Math.max(nums[i], dp[i - 1] + nums[i]);
  }

  return Math.max(...dp);
}

// time: O(n)
// space: O(1)
// Kadane's Algorithm
// Greedy (space optimized bottom-up)
function maxSubarray_KA(nums: number[]): number {
  const n = nums.length;
  let maxSum = nums[0];
  let currentSum = nums[0];

  for (let i = 1; i < n; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

const range = { min: 1, max: 1000 };
const bigInput = Array.from({ length: 1000 }, () =>
  Math.floor(Math.random() * (range.max - range.min) + range.min),
);

const cases: TestCase<typeof maxSubarray_KA>[] = [
  { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], output: 6 },
  { input: [[1]], output: 1 },
  { input: [[5, 4, -1, 7, 8]], output: 23 },
  { input: [[2, -3, 4, -2, 2, 1, -1, 4]], output: 8 },
  { input: [[-1]], output: -1 },

  // big input
  {
    input: [bigInput],
    output: maxSubarray_KA(bigInput),
    showStringInput: false,
  },
];

runTests(maxSubarray_KA, cases);
runCompare([maxSubarray_BF, maxSubarray_DP, maxSubarray_KA], cases);
