import { runTests } from "#functions/code-tester.js";

function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();

  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}

runTests(containsDuplicate, [
  { input: [[1, 2, 3, 1]], output: true },
  { input: [[1, 2, 3, 4]], output: false },
  { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], output: true },
]);
