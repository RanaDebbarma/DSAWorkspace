import { runTests } from "#functions/code-tester.js";

function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const idx = seen.get(target - nums[i]);

    if (idx !== undefined) {
      return [idx, i];
    }

    seen.set(nums[i], i);
  }
  return [];
}

runTests(twoSum, [
  { input: [[2, 7, 11, 15], 9], output: [0, 1] },
  { input: [[3, 4, 5, 6], 7], output: [0, 1] },
  { input: [[4, 5, 6], 10], output: [0, 2] },
]);
