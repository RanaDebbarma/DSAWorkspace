import { runTests } from "#functions/code-tester.js";

// LeetCode 88

function merge(
  nums1: number[],
  m: number,
  nums2: number[],
  n: number,
): number[] {
  let p1 = m - 1;
  let p2 = n - 1;
  let i = m + n - 1;

  while (p1 >= 0 && p2 >= 0) {
    if (nums1[p1] < nums2[p2]) {
      nums1[i--] = nums2[p2--];
    } else {
      nums1[i--] = nums1[p1--];
    }
  }

  while (p1 >= 0) nums1[i--] = nums1[p1--];
  while (p2 >= 0) nums1[i--] = nums2[p2--];

  return nums1;
}

runTests(merge, [
  {
    input: [[10, 20, 20, 40, 0, 0], 4, [1, 2], 2],
    output: [1, 2, 10, 20, 20, 40],
  },
  { input: [[0, 0], 0, [1, 2], 2], output: [1, 2] },
  { input: [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3], output: [1, 2, 2, 3, 5, 6] },
  { input: [[1], 1, [], 0], output: [1] },
  { input: [[0], 0, [1], 1], output: [1] },
]);
