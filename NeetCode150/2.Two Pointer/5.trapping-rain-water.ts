import { runTests, TestCase } from "#functions/code-tester.js";

// Leetcode 42

// O(n) time and o(1) space // Optimal solution
const myFunc = function trap(height: number[]): number {
  let totalWater = 0;

  let l = 0;
  let r = height.length - 1;

  let leftMax = 0;
  let rightMax = 0;

  while (l < r) {
    leftMax = Math.max(leftMax, height[l]);
    rightMax = Math.max(rightMax, height[r]);

    if (leftMax < rightMax) {
      totalWater += leftMax - height[l];
      l++;
    } else {
      totalWater += rightMax - height[r];
      r--;
    }
  }

  return totalWater;
};

// O(n) time and space both
// const myFunc = function trap(height: number[]): number {
//   let totalWater = 0;
//   const maxPrefix: number[] = [];

//   let prefix = 0;
//   for (const h of height) {
//     prefix = Math.max(prefix, h);
//     maxPrefix.push(prefix);
//   }
  
//   let suffix = 0;
//   for (let i = height.length - 1; i >= 0; i--) {
//     suffix = Math.max(suffix, height[i]);
//     maxPrefix[i] = Math.min(maxPrefix[i], suffix);

//     totalWater += maxPrefix[i] - height[i]
//   }

//   return totalWater;
// };

const inputs: TestCase<typeof myFunc>[] = [
  // Leetcode
  { input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], output: 6 },
  { input: [[4, 2, 0, 3, 2, 5]], output: 9 },

  // Neetcode
  { input: [[0, 2, 0, 3, 1, 0, 1, 3, 2, 1]], output: 9 },
];

runTests(myFunc, inputs);
