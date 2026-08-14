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
  // Store indices of bars in increasing height order.
  // This lets us find the first smaller bar on the left
  // when we pop an index from the stack.
  const stack: number[] = [];

  let maxArea = 0;

  // Go one extra iteration with a fake height of 0.
  // This forces us to process any bars still remaining in the stack.
  for (let i = 0; i <= heights.length; i++) {
    const currentHeight = i === heights.length ? 0 : heights[i];

    // If the current bar is shorter than the bar on top of the stack,
    // we've found the RIGHT boundary of that taller bar.
    while (stack.length && currentHeight < heights[stack[stack.length - 1]]) {
      // Remove the bar we're going to calculate the rectangle for.
      const height = heights[stack.pop()!];

      // After popping:
      // - i = first smaller bar on the RIGHT
      // - stack top = first smaller bar on the LEFT
      //
      // Therefore:
      // width = right boundary - left boundary - 1
      //
      // If the stack is empty, there is no smaller bar on the left,
      // so the rectangle extends all the way to index 0.
      const width = stack.length ? i - stack[stack.length - 1] - 1 : i;

      // Calculate the rectangle using the popped bar's height.
      maxArea = Math.max(maxArea, height * width);
    }

    // Add the current index to the monotonic stack.
    // Don't add the fake 0 at the end.
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
