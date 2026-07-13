import { runTests, TestCase } from "#functions/code-tester.js";

// Leetcode 3

// const myFunc = function lengthOfLongestSubstring(s: string): number {
//   let longestLength = 0;
//   const seen = new Map<string, number>();

//   let l = 0;

//   for (let r = 0; r < s.length; r++) {
//     if (seen.has(s[r])) {
//       l = Math.max(l, seen.get(s[r])! + 1);
//     }

//     seen.set(s[r], r);
//     longestLength = Math.max(longestLength, r - l + 1);
//   }

//   return longestLength;
// };

// Ultra Optimized
const myFunc = function lengthOfLongestSubstring(s: string): number {
  // Array to store the last seen index + 1 of ASCII characters.
  // Initialize with 0 (which means the character hasn't been seen yet).
  const charIndexMap = new Int32Array(128);

  let maxLength = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const charCode = s.charCodeAt(right);

    // If the character was seen inside the current window,
    // jump the left pointer directly past its last recorded position.
    left = Math.max(left, charIndexMap[charCode]);

    // Update the maximum length found so far
    maxLength = Math.max(maxLength, right - left + 1);

    // Store the next index (right + 1) to eliminate the need for a "+ 1" later
    charIndexMap[charCode] = right + 1;
  }

  return maxLength;
};

// General solun
// const myFunc = function lengthOfLongestSubstring(s: string): number {
//   const seen = new Map<string, number>();

//   let maxLength = 0;
//   let l = 0;
//   let r = 0;

//   for (const ch of s) {
//     const lastSeen = seen.get(ch);
    
//     if (lastSeen !== undefined) {
//       l = Math.max(l, lastSeen);
//     }
    
//     seen.set(ch, r + 1);
//     maxLength = Math.max(maxLength, r - l + 1);
//     r++;
//   }

//   return maxLength;
// };

const inputs: TestCase<typeof myFunc>[] = [
  // Leetcode
  { input: ["abcabcbb"], output: 3 }, // "abc" or "bca" or "cab"
  { input: ["bbbbb"], output: 1 }, // "b"
  { input: ["pwwkew"], output: 3 }, // "wke"

  // Neetcode
  { input: ["zxyzxyz"], output: 3 }, // "xyz"
  { input: ["xxxx"], output: 1 },

  // Edge
  { input: ["dvdf"], output: 3 },
  { input: ["abcaef"], output: 5 },
];

runTests(myFunc, inputs);
