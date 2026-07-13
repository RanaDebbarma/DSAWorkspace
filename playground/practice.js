class Solution {
  longestConsecutive(nums) {
    const set = new Set(nums)
    let length = 0;

    for (const n of set) {
      let count = 0
      let curr = n

      if (!set.has(n - 1)) {
        while (set.has(curr)) {
          count++
          curr++
        }
        length = Math.max(length, count);
      }
    }
    return length
  }
}

// const nums = [2, 20, 4, 10, 3, 4, 5] // 4 since [2, 3, 4, 5]
const nums = [0, 3, 2, 5, 4, 6, 1, 1] // 7
// const nums = [] // 0
const solution = new Solution
console.log(solution.longestConsecutive(nums))