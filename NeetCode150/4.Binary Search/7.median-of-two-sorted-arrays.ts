import { runTests } from "#functions/code-tester.js";

// LeetCode 4

function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  // Always binary search the smaller array.
  if (nums1.length > nums2.length) {
    return findMedianSortedArrays(nums2, nums1);
  }

  const firstLength = nums1.length; // smaller
  const secondLength = nums2.length;
  const totalLength = firstLength + secondLength;

  // Number of elements that should be on the left side.
  const leftSize = Math.floor((totalLength + 1) / 2);

  let low = 0;
  let high = firstLength;

  while (low <= high) {
    // partition1 = elements taken from nums1 for the left side
    const partition1 = Math.floor((low + high) / 2);

    // The remaining left-side elements come from nums2.
    const partition2 = leftSize - partition1;

    const left1 = partition1 > 0 ? nums1[partition1 - 1] : -Infinity;
    const right1 = partition1 < firstLength ? nums1[partition1] : Infinity;

    const left2 = partition2 > 0 ? nums2[partition2 - 1] : -Infinity;
    const right2 = partition2 < secondLength ? nums2[partition2] : Infinity;

    // Too many elements taken from nums1.
    if (left1 > right2) {
      high = partition1 - 1;
    }

    // Too few elements taken from nums1.
    else if (left2 > right1) {
      low = partition1 + 1;
    }

    // Both partitions are correctly positioned.
    else {
      const leftMax = Math.max(left1, left2);

      // Odd length → median is the largest value on the left.
      if (totalLength % 2 === 1) {
        return leftMax;
      }

      // Even length → average the two middle values.
      const rightMin = Math.min(right1, right2);

      return (leftMax + rightMin) / 2;
    }
  }

  return 0; // Unreachable for valid input.
}

runTests(findMedianSortedArrays, [
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
