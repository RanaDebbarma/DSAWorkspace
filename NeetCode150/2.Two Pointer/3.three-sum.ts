import { compare3Sum, runTests } from "#functions/code-tester.js";

// function threeSum(nums: number[]): number[][] {
//   const result: number[][] = [];
//   nums.sort((a, b) => a - b);

//   for (let i = 0; i < nums.length; i++) {
//     let [l, r] = [i + 1, nums.length - 1];
//     const target = -nums[i];

//     while (l < r) {
//       const sum = nums[l] + nums[r];

//       if (sum === target) {
//         result.push([nums[i], nums[l], nums[r]]);
//         break;
//       }
//       if (sum < target) l++;
//       if (sum > target) r--;
//     }
//   }
//   return result;
// }

// Optimized
function threeSum(nums: number[]): number[][] {
  const result: number[][] = [];
  nums.sort((a, b) => a - b);

  for (let i = 0; i < nums.length - 2; i++) {
    // break loop when num is above 0
    if (nums[i] > 0) break;

    // Skip duplicate first numbers
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let l = i + 1;
    let r = nums.length - 1;

    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];

      if (sum < 0) {
        l++;
      } else if (sum > 0) {
        r--;
      } else {
        result.push([nums[i], nums[l], nums[r]]);

        l++;
        r--;

        // Skip duplicate second numbers
        while (l < r && nums[l] === nums[l - 1]) l++;

        // Skip duplicate third numbers
        while (l < r && nums[r] === nums[r + 1]) r--;
      }
    }
  }

  return result;
}

runTests(threeSum, [
  {
    input: [[-1, 0, 1, 2, -1, -4]],
    output: [
      [-1, -1, 2],
      [-1, 0, 1],
    ],
  },
  { input: [[0, 1, 1]], output: [] },
  { input: [[0, 0, 0]], output: [[0, 0, 0]] },

  // edge
  { input: [[1, 2, 0, 1, 0, 0, 0, 0]], output: [[0, 0, 0]] },
  {
    input: [[-3, -1, 0, 1, 1, 1, 2]],
    output: [
      [-3, 1, 2],
      [1, 0, -1],
    ],
    compare: compare3Sum
  },
]);
