import { runTests, TestCase } from "#functions/code-tester.js";
// LeetCode 424

// BruteForce o(n^2) time and o(n) space
// const myFunc = function characterReplacement(s: string, k: number): number {
//   let l = 0;
//   let r = 1;
//   let max_length = 0;

//   while (s.length && r < s.length) {
//     const current_window = s.substring(l, r + 1);
//     const max_freq = findMaxFreq(current_window);
//     const replacements = current_window.length - max_freq;

//     if (replacements <= k) {
//       if (max_length < current_window.length)
//         max_length = current_window.length;
//       r++;
//     } else {
//       l++;
//       r++;
//     }
//   }

//   return max_length;

//   // Helper
//   function findMaxFreq(s: string) {
//     const hash = new Int32Array(26);
//     for (const ch of s) {
//       hash[ch.charCodeAt(0) - 65]++;
//     }

//     // extract max frequency;
//     let maxFreq = 0;
//     for (let i = 0; i < hash.length; i++) {
//       const freq = hash[i];
//       if (freq) {
//         if (maxFreq < freq) maxFreq = freq;
//       }
//     }

//     return maxFreq;
//   }
// };

// Optimal solution O(n) time and o(1) space
const myFunc = function characterReplacement(s: string, k: number): number {
  let l = 0;
  // let max_length = 0;
  let max_freq = 0;
  const hash = new Int32Array(26);

  // Use a single loop to expand the right pointer
  for (let r = 0; r < s.length; r++) {
    // 1. Add the incoming character to our frequency map
    const rightCharIdx = s.charCodeAt(r) - 65;
    hash[rightCharIdx]++;

    // 2. Keep track of the maximum frequency seen in the current window
    max_freq = Math.max(max_freq, hash[rightCharIdx]);

    // 3. If the window is invalid (chars to replace > k), shrink from the left
    const current_window_len = r - l + 1;
    if (current_window_len - max_freq > k) {
      const leftCharIdx = s.charCodeAt(l) - 65;
      hash[leftCharIdx]--;
      l++; // Move left pointer up
    }

    // 4. Update the maximum length found so far
    // max_length = Math.max(max_length, r - l + 1);
  }

  return s.length - l
  // return max_length;
};

const inputs: TestCase<typeof myFunc>[] = [
  // Leetcode
  { input: ["ABAB", 2], output: 4 },
  { input: ["AABABBA", 1], output: 4 },

  // Neetcode
  { input: ["XYYX", 2], output: 4 },
  { input: ["AAABABB", 1], output: 5 },

  // Edge
];

runTests(myFunc, inputs);
