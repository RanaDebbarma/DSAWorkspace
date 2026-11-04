import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 416

// Time: O(2ⁿ)
// Space: O(n) — recursion stack
// Brute-Force (my first approach)
// function canPartition_BF(nums: number[]): boolean {
//   const n = nums.length;
//   const totalSum = nums.reduce((acc, nxt) => acc + nxt, 0);

//   if (totalSum % 2 !== 0) return false; // pruning (assuming all values are positive whole number)

//   return dfs(0, totalSum, 0);

//   function dfs(idx: number, subsetSum1: number, subsetSum2: number): boolean {
//     if (subsetSum1 === subsetSum2) return true;
//     if (idx >= n) return false;

//     for (let i = idx; i < n; i++) {
//       const num = nums[i]
//       if (dfs(i + 1, subsetSum1 - num, subsetSum2 + num)) return true;
//     }

//     return false;
//   }
// }

// Brute-Force (cleaner approach)
function canPartition_BF(nums: number[]): boolean {
  const n = nums.length;
  const totalSum = nums.reduce((acc, nxt) => acc + nxt, 0);
  const target = totalSum / 2;

  if (totalSum % 2 !== 0) return false;

  return dfs(0, target);

  function dfs(idx: number, remaining: number): boolean {
    if (remaining === 0) return true;
    if (idx >= n) return false;

    for (let i = idx; i < n; i++) {
      const num = nums[i];
      if (dfs(i + 1, remaining - num)) return true;
    }

    return false;
  }
}

// Time: O(n² × target)
// Space: O(n x target)
// Top-Down Memoization
// function canPartition_TDM(nums: number[]): boolean {
//   const n = nums.length;
//   const totalSum = nums.reduce((acc, nxt) => acc + nxt, 0);
//   const target = totalSum / 2;

//   if (totalSum % 2 !== 0) return false;
//   const memo = Array.from({ length: n }, () => Array(target + 1));

//   return dfs(0, target);

//   function dfs(idx: number, remaining: number): boolean {
//     if (remaining === 0) return true;
//     if (idx >= n) return false;

//     if (memo[idx][remaining] !== undefined) return memo[idx][remaining];

//     for (let i = idx; i < n; i++) {
//       const num = nums[i];
//       if (dfs(i + 1, remaining - num)) return true;
//     }

//     return (memo[idx][remaining] = false);
//   }
// }

// Time: O(n × target)
// Space: O(n x target)
// Top-Down Memo II
function canPartition_TDM(nums: number[]): boolean {
  const n = nums.length;
  const totalSum = nums.reduce((acc, nxt) => acc + nxt, 0);

  // single element cant be split
  if (totalSum % 2 !== 0) return false;

  const target = totalSum / 2;
  const memo = Array.from({ length: n }, () => Array(target + 1));

  return dfs(0, target);

  function dfs(i: number, rem: number): boolean {
    if (rem === 0) return true;
    if (rem < 0 || i >= n) return false;

    if (memo[i][rem] !== undefined) return memo[i][rem];

    // inlude/exclude
    const res = dfs(i + 1, rem - nums[i]) || dfs(i + 1, rem);
    return (memo[i][rem] = res);
  }
}

// Bottom-Up Tabulation
function canPartition_BUT(nums: number[]): boolean {
  return false;
}

function generateInput(len: number) {
  const range = { min: 1, max: 10 };
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * (range.max - range.min) + range.min),
  );
}

const bigInput1 = generateInput(20);
const bigInput2 = generateInput(30);

const cases: TestCase<typeof canPartition_BUT>[] = [
  { input: [[1, 5, 11, 5]], output: true },
  { input: [[1, 2, 3, 5]], output: false },
  { input: [[1, 2, 3, 4]], output: true },
  { input: [[1, 2, 3, 4, 5]], output: false },

  // big input
  {
    input: [bigInput1],
    output: canPartition_TDM(bigInput1),
    showStringInput: true,
  },
  {
    input: [bigInput2],
    output: canPartition_TDM(bigInput2),
    showStringInput: true,
  },
];

runTests(canPartition_TDM, cases);
runCompare([canPartition_BF, canPartition_TDM, canPartition_BUT], cases);
