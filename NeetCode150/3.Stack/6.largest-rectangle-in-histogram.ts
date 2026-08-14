import { runTests } from "#functions/code-tester.js";

// LeetCode 84

// O(n^2) time and o(1) space ------- BruteForce soln
// function largestRectangleArea(heights: number[]): number {
//   let largestRec = 0;

//   for (let i = 0; i < heights.length; i++) {
//     let width = 1;
//     const height = heights[i];

//     let l = i - 1;
//     let r = i + 1;
//     while (l >= 0 && heights[l] >= height) {
//       width++;
//       l--;
//     }
//     while (r < heights.length && heights[r] >= height) {
//       width++;
//       r++;
//     }

//     const area = height * width;
//     if (largestRec < area) largestRec = area;
//   }

//   return largestRec;
// }

// O(n) time and space ------- MonotonicStack soln
function largestRectangleArea(heights: number[]): number {
  const stack: number[] = [];
  let maxArea = 0;

  for (let i = 0; i <= heights.length; i++) {
    const currentHeight = i === heights.length ? 0 : heights[i];

    while (stack.length && currentHeight < heights[stack[stack.length - 1]]) {
      const height = heights[stack.pop()!];

      const width = stack.length ? i - stack[stack.length - 1] - 1 : i;

      maxArea = Math.max(maxArea, height * width);
    }

    if (i < heights.length) {
      stack.push(i);
    }
  }

  return maxArea;
}

runTests(largestRectangleArea, [
  // NeetCode
  { input: [[7, 1, 7, 2, 2, 4]], output: 8 },
  { input: [[1, 3, 7]], output: 7 },

  // LeetCode
  { input: [[2, 1, 5, 6, 2, 3]], output: 10 },
  { input: [[2, 4]], output: 4 },
]);
