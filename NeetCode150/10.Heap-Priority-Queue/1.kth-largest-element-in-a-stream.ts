import { runClassTests } from "#functions/code-tester.js";

// LeetCode 703

class KthLargest {
  // Implement class here...
  constructor(k: number, nums: number[]) {}

  add(val: number): number {
    return 0;
  }
}

runClassTests(KthLargest, [
  {
    operations: ["KthLargest", "add", "add", "add", "add", "add"],
    args: [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]],
    expected: [null, 4, 5, 5, 8, 8],
  },
  {
    operations: ["KthLargest", "add", "add", "add", "add"],
    args: [[4, [7, 7, 7, 7, 8, 3]], [2], [10], [9], [9]],
    expected: [null, 7, 7, 7, 8],
  },
  {
    operations: ["KthLargest", "add", "add", "add", "add", "add"],
    args: [[3, [1, 2, 3, 3]], [3], [5], [6], [7], [8]],
    expected: [null, 3, 3, 3, 5, 6],
  },
]);
