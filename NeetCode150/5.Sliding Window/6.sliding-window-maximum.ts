import { runTests } from "#functions/code-tester.js";

// LeetCode 239

function maxSlidingWindow(nums: number[], k: number): number[] {
  const ans: number[] = [];
  const deque: number[] = [];
  let head = 0;

  for (let r = 0; r < nums.length; r++) {
    // Remove indices outside the window
    while (head < deque.length && deque[head] < r - k + 1) {
      head++;
    }

    // Remove smaller values from the back
    while (head < deque.length && nums[deque[deque.length - 1]] <= nums[r]) {
      deque.pop();
    }

    deque.push(r);

    // Front holds the maximum
    if (r >= k - 1) {
      ans.push(nums[deque[head]]);
    }
  }

  return ans;
}

runTests(maxSlidingWindow, [
  { input: [[1, 2, 1, 0, 4, 2, 6], 3], output: [2, 2, 4, 4, 6] },
  { input: [[1, 3, -1, -3, 5, 3, 6, 7], 3], output: [3, 3, 5, 5, 6, 7] },
  { input: [[1], 1], output: [1] },
]);
