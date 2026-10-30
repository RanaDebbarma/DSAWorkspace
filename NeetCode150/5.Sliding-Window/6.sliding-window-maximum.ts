import { runTests } from "#functions/code-tester.js";

// LeetCode 239

// time: O(n)
// space: O(n) -- O(k) with actual que
// monotonic decreasing deque
function maxSlidingWindow(nums: number[], k: number): number[] {
  const ans: number[] = [];
  const deque: number[] = [];
  let head = 0;

  for (let i = 0; i < nums.length; i++) {
    // Remove indices outside the window
    while (head < deque.length && deque[head] < i - k + 1) head++;

    // Remove smaller values from the back
    while (head < deque.length && nums[deque[deque.length - 1]] <= nums[i])
      deque.pop();

    deque.push(i);

    // Front holds the maximum
    if (i >= k - 1) {
      ans.push(nums[deque[head]]);
    }
  }

  return ans;
}

runTests(maxSlidingWindow, [
  { input: [[1, 2, 1, 0, 4, 2, 6], 3], output: [2, 2, 4, 4, 6] },
  { input: [[1, 3, -1, -3, 5, 3, 6, 7], 3], output: [3, 3, 5, 5, 6, 7] },
  { input: [[1], 1], output: [1] },

  // edge
  { input: [[2, 0, 1, 0], 3], output: [2, 1] },
]);
