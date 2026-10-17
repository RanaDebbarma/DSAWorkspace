import { runTests } from "#functions/code-tester.js";

// LeetCode 198

// O(n^2) time and O(n) space complexity ---- BruteForce
function rob_BF(nums: number[]): number {
  const n = nums.length;

  return robNext(0);

  function robNext(house: number): number {
    if (house >= n) return 0;

    const robCurrent = nums[house] + robNext(house + 2);
    const skipCurrent = robNext(house + 1);

    return Math.max(robCurrent, skipCurrent);
  }
}

// O(n) time and O(n) space complexity ---- Top-Down + Memoization
function rob_TD(nums: number[]): number {
  const n = nums.length;
  const memo = new Array(n + 1).fill(-1);

  return robNext(0);

  function robNext(house: number): number {
    if (house >= n) return 0;

    if (memo[house] !== -1) return memo[house];

    const robCurrent = nums[house] + robNext(house + 2);
    const skipCurrent = robNext(house + 1);

    memo[house] = Math.max(robCurrent, skipCurrent);

    return memo[house];
  }
}

// O(n) time and O(n) space complexity ---- Bottom-Up + Tabulation
function rob_BU(nums: number[]): number {
  const n = nums.length;

  if (n <= 2) return n === 0 ? 0 : Math.max(...nums);

  const dp = new Array(n).fill(0);

  dp[0] = nums[0]; // Best result from the first house
  dp[1] = Math.max(nums[0], nums[1]); // Best result from the first two houses

  for (let house = 2; house < n; house++) {
    // Rob current house and skip the adjacent one
    const robCurrent = nums[house] + dp[house - 2];

    // Skip current house and keep the best result so far
    const skipCurrent = dp[house - 1];

    dp[house] = Math.max(robCurrent, skipCurrent);
  }

  return dp[n - 1]; // Maximum money obtainable from all houses
}

// O(n) time and O(1) space — Bottom-Up + Space Optimization
function rob_SO(nums: number[]): number {
  const n = nums.length;

  if (n === 0) return 0;
  if (n <= 2) return Math.max(...nums);

  // Maximum money obtainable from the first house and first two houses
  let prev2 = nums[0];
  let prev1 = Math.max(nums[0], nums[1]);

  for (let house = 2; house < n; house++) {
    const robCurrent = prev2 + nums[house];
    const skipCurrent = prev1;

    const curr = Math.max(robCurrent, skipCurrent);

    // Advance the two DP states
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

// O(n) time and O(1) space — Bottom-Up + Space Optimization
// cleaner code
function rob(nums: number[]): number {
  let prev2 = 0;
  let prev1 = 0;

  for (const money of nums) {
    const curr = Math.max(prev1, prev2 + money);

    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

runTests(rob, [
  { input: [[1, 1, 3, 3]], output: 4 },
  { input: [[2, 9, 8, 3, 6]], output: 16 },
  { input: [[1, 2, 3, 1]], output: 4 },
  { input: [[2, 7, 9, 3, 1]], output: 12 },
  { input: [[3, 4]], output: 4 },
]);
