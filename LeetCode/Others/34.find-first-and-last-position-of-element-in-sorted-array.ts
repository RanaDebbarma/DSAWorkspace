import { runTests } from "#functions/code-tester.js";

function findFirstAndLastPositionOfElementInSortedArray(
  nums: number[],
  target: number,
): number[] {
  return [findBound(true), findBound(false)];

  function findBound(isFirst: boolean): number {
    let l = 0;
    let r = nums.length - 1;
    let bound = -1;

    while (l <= r) {
      const mid = l + ((r - l) >> 1);

      if (nums[mid] === target) {
        bound = mid;
        if (isFirst) {
          r = mid - 1;
        } else {
          l = mid + 1;
        }
      } else if (nums[mid] < target) {
        l = mid + 1;
      } else {
        r = mid - 1;
      }
    }

    return bound;
  }
}

runTests(findFirstAndLastPositionOfElementInSortedArray, [
  { input: [[5, 7, 7, 8, 8, 10], 8], output: [3, 4] },
  { input: [[5, 7, 7, 8, 8, 10], 6], output: [-1, -1] },
  { input: [[], 0], output: [-1, -1] },
]);
