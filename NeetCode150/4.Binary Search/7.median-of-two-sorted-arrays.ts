import { runTests } from "#functions/code-tester.js";

// LeetCode 4

const solve = function findMedianSortedArrays(
  nums1: number[],
  nums2: number[],
): number {
  const mergedArr = merge(nums1, nums2);
  const len = mergedArr.length;
  
  if (len === 0) return 0;

  const mid = len >> 1;

  if (len % 2 === 0) {
    return (mergedArr[mid] + mergedArr[mid - 1]) / 2;
  }
  
  return mergedArr[mid];

  // o(m + n) time and space
  function merge(arr1: number[], arr2: number[]) {
    let p1 = 0;
    let p2 = 0;
    const len1 = arr1.length;
    const len2 = arr2.length;
    const result: number[] = new Array(len1 + len2);
    let k = 0;

    while (p1 < len1 && p2 < len2) {
      if (arr1[p1] < arr2[p2]) {
        result[k++] = arr1[p1++];
      } else {
        result[k++] = arr2[p2++];
      }
    }

    while (p1 < len1) {
      result[k++] = arr1[p1++];
    }

    while (p2 < len2) {
      result[k++] = arr2[p2++];
    }

    return result;
  }
};

runTests(solve, [
  // LeetCode
  { input: [[1, 3], [2]], output: 2 },
  {
    input: [
      [1, 2],
      [3, 4],
    ],
    output: 2.5,
  },
  // NeetCode
  { input: [[1, 2], [3]], output: 2 },
  {
    input: [
      [1, 3],
      [2, 4],
    ],
    output: 2.5,
  },
]);
