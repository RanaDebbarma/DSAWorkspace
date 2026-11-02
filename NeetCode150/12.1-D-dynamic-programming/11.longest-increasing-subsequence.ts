import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 300

// time: O(2 ^ n)
// space: O(n)
// Brute-Force (Backtrack)
function lengthOfLIS_BF(nums: number[]): number {
  const n = nums.length;
  let maxLen = 0;

  for (let start = 0; start < n; start++) {
    dfs(start, 1);
  }

  return maxLen;

  function dfs(i: number, len: number) {
    for (let next = i + 1; next < n; next++) {
      if (nums[i] < nums[next]) {
        dfs(next, len + 1);
      }
    }

    maxLen = Math.max(maxLen, len);
  }
}

// time: O(n²)
// space: O(n)
// Top-Down Memoization
function lengthOfLIS_TDM(nums: number[]): number {
  const n = nums.length;
  const memo = Array(n).fill(0);
  let maxLen = 0;

  for (let start = 0; start < n; start++) {
    maxLen = Math.max(maxLen, dfs(start));
  }

  return maxLen;

  function dfs(i: number): number {
    if (memo[i]) return memo[i];

    for (let next = i + 1; next < n; next++) {
      if (nums[i] < nums[next]) {
        memo[i] = Math.max(memo[i], dfs(next));
      }
    }

    return (memo[i] = 1 + memo[i]);
  }
}

// time: O(n²)
// space: O(n)
// Bottom-Up Tabulation
function lengthOfLIS_BUT(nums: number[]): number {
  const n = nums.length;
  const dp = Array(n).fill(1); // LIS ending at each index (minimum length = 1)

  for (let i = 0; i < n; i++) {
    for (let prev = 0; prev < i; prev++) {
      // Extend the increasing subsequence ending at prev
      if (nums[prev] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[prev] + 1);
      }
    }
  }

  return Math.max(...dp); // LIS can end at any index
}

// time: O(n long n)
// space: O(n)
// Binary search + Greedy
// Intuitive format
function lengthOfLIS_BSG_I(nums: number[]): number {
  const n = nums.length;
  const temp: number[] = [nums[0]];

  for (let i = 1; i < n; i++) {
    const num = nums[i];

    if (temp.at(-1)! >= num) {
      BSReplace(num);
    } else {
      temp.push(num);
    }
  }

  return temp.length;

  function BSReplace(target: number, start = 0, end = temp.length - 1): void {
    while (start < end) {
      const mid = start + ((end - start) >> 1);

      if (temp[mid] < target) {
        start = mid + 1;
      } else {
        end = mid;
      }
    }

    temp[start] = target;
  }
}

// Cleaner format
function lengthOfLIS_BSG_C(nums: number[]): number {
  const tails: number[] = [];

  for (const num of nums) {
    let l = 0;
    let r = tails.length;

    while (l < r) {
      const mid = l + ((r - l) >> 1);

      if (tails[mid] < num) {
        l = mid + 1;
      } else {
        r = mid;
      }
    }

    tails[l] = num;
  }

  return tails.length;
}

const cases: TestCase<typeof lengthOfLIS_BUT>[] = [
  { input: [[10, 9, 2, 5, 3, 7, 101, 18]], output: 4 },
  { input: [[0, 1, 0, 3, 2, 3]], output: 4 },
  { input: [[7, 7, 7, 7, 7, 7, 7]], output: 1 },
  { input: [[9, 1, 4, 2, 3, 3, 7]], output: 4 },
  { input: [[0, 3, 1, 3, 2, 3]], output: 4 },

  // edge
  { input: [[1, 5, 2, 3, 4, 0]], output: 4 },
];

runTests(lengthOfLIS_BSG_C, cases);
runCompare(
  [lengthOfLIS_BF, lengthOfLIS_TDM, lengthOfLIS_BUT, lengthOfLIS_BSG_C],
  cases,
);
