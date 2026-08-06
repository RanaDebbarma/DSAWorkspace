import { runTests } from "#functions/code-tester.js";

// LeetCode 69

// Maths, BinarySearch, Newtons Method

//Given a non-negative integer x, return the square root of x rounded down
//to the nearest integer. The returned integer should be non-negative as well

const solve = function mySqrt(x: number): number {
  let ans = 0;
  let l = 0;
  let r = x;

  // Using division instead of multiplication prevents overflow
  while (l <= r) {
    const mid = l + ((r - l) >> 1);

    if (mid <= x / mid) {
      ans = mid;
      l = mid + 1;
    } else {
      r = mid - 1;
    }
  }

  return ans;
};

runTests(solve, [
  { input: [4], output: 2 },
  { input: [8], output: 2 },
  { input: [2147302921], output: 46339 },
]);
