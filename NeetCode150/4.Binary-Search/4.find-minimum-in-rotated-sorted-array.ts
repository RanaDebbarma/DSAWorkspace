import { runTests } from "#functions/code-tester.js";

// Elegent version
const myFunc = function findMin(nums: number[]): number {
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

  // For max ( learning )
  // one step back for circular array
  // const max = nums[(l - 1 + nums.length) % nums.length];
  // console.log(max);

  return nums[l];
};

// My soln
// const myFunc = function findMin(nums: number[]): number {
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

runTests(myFunc, [
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
