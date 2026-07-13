import { runTests, TestCase } from "../../utils/run-tests.js";

function maxArea(height: number[]): number {
  let l = 0;
  let r = height.length - 1;
  let max = 0;

  while (l < r) {
    const h = Math.min(height[l], height[r]);
    const area = (r - l) * h;
    max = Math.max(max, area);

    if (height[l] < height[r]) {
      l++;
    } else {
      r--;
    }
  }

  return max;
}

const inputs: TestCase<typeof maxArea>[] = [
  { input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], output: 49 },
  { input: [[1, 1]], output: 1 },
  { input: [[1, 7, 2, 5, 4, 7, 3, 6]], output: 36 },
  { input: [[2, 2, 2]], output: 4 },
];

runTests(maxArea, inputs, true);
