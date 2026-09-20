// O(n^2)
// function productExceptSelf(nums: number[]): number[] {
//   const res: number[] = [];

//   function productExcept(arr: number[], except: number) {
//     let product: number = 1;
//     for (let i = 0; i < arr.length; i++) {
//       if (i === except) continue;
//       else product *= arr[i]
//     }
//     return product
//   }

//   for (let i = 0; i < nums.length; i++) {
//     res.push(productExcept(nums, i))
//   }

//   return res;
// }

// O(n) optimizede solution (prefix * postfix)
import { runTests } from "#functions/code-tester.js";

function productExceptSelf(nums: number[]): number[] {
  const result = new Array<number>(nums.length);

  let prefix = 1;
  for (let i = 0; i < nums.length; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }

  let suffix = 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }

  return result;
}

runTests(productExceptSelf, [
  { input: [[1, 2, 3, 4]], output: [24, 12, 8, 6] },
  { input: [[1, 2, 4, 6]], output: [48, 24, 12, 8] },
  { input: [[-1, 1, 0, -3, 3]], output: [-0, 0, 9, -0, 0] },
]);
