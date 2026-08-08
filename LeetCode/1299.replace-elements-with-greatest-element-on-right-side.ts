import { runTests } from "#functions/code-tester.js";

// LeetCode 1299

const solve = function replaceElements(arr: number[]): number[] {
  let maxRight = -1;

  for (let i = arr.length - 1; i >= 0; i--) {
    const newMax = Math.max(arr[i], maxRight);
    arr[i] = maxRight;
    maxRight = newMax;
  }

  return arr;
};

runTests(solve, [
  { input: [[2, 4, 5, 3, 1, 2]], output: [5, 5, 3, 2, 2, -1] },
  { input: [[3, 3]], output: [3, -1] },
  { input: [[17, 18, 5, 4, 6, 1]], output: [18, 6, 6, 6, 1, -1] },
]);
