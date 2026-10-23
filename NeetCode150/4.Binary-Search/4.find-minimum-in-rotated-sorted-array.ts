import { runTests } from "#functions/code-tester.js";

// LeetCode 153

// time: O(log(n))
// space: O(1)
// Elegent version
function findMin(nums: number[]): number {
  let l = 0;
  let r = nums.length - 1;

  // if array is not rotated or only single el is present
  if (nums[l] <= nums[r]) return nums[l];

  while (l < r) {
    const mid = l + Math.floor((r - l) / 2);

    if (nums[mid] <= nums[r]) {
      r = mid;
    } else {
      l = mid + 1;
    }
  }

  return nums[l];
}

// For max
// one step back for circular array
// const max = nums[(l - 1 + nums.length) % nums.length];
// or for this particular problem
// const max = nums[l - 1];
// console.log(max);

// My soln
// function findMin(nums: number[]): number {
//   let l = 0;
//   let r = nums.length - 1;
//   let min = nums[0];

//   while (l <= r) {
//     const mid = l + Math.floor((r - l) / 2);
//     const curr = nums[mid];

//     min = Math.min(min, curr);

//     if (nums[0] > curr) {
//       r = mid - 1;
//     } else {
//       l = mid + 1;
//     }
//   }

//   return min;
// };

runTests(findMin, [
  // Leetcode
  { input: [[3, 4, 5, 1, 2]], output: 1 },
  { input: [[4, 5, 6, 7, 0, 1, 2]], output: 0 },
  { input: [[11, 13, 15, 17]], output: 11 },

  // Neetcode
  { input: [[3, 4, 5, 6, 1, 2]], output: 1 },
  { input: [[4, 5, 0, 1, 2, 3]], output: 0 },
  { input: [[4, 5, 6, 7]], output: 4 },

  // Edge
  { input: [[4, 5, 1, 2, 3]], output: 1 },
]);
