import { runTests } from "#functions/code-tester.js";
// LeetCode 567

// o(n)
// const myFunc = function checkInclusion(s1: string, s2: string): boolean {
//   if (s1.length > s2.length) return false;

//   let l = 0;
//   let r = s1.length;
//   const s1_freq_map = new Int32Array(26);
//   const sub_freq_map = new Int32Array(26);

//   // create frequency map for s1
//   for (const ch of s1) {
//     const idx = ch.charCodeAt(0) - 97;
//     s1_freq_map[idx]++;
//   }

//   // initialize and check first window
//   for (let i = 0; i < s1.length; i++) {
//     const idx = s2.charCodeAt(i) - 97;
//     sub_freq_map[idx]++;
//   }

//   // validation
//   if (s1_freq_map.join("#") === sub_freq_map.join("#")) return true;

//   // check rest window
//   while (r < s2.length) {
//     sub_freq_map[s2.charCodeAt(l) - 97]--;
//     sub_freq_map[s2.charCodeAt(r) - 97]++;

//     if (s1_freq_map.join("#") === sub_freq_map.join("#")) return true;

//     l++;
//     r++;
//   }

//   return false;
// };

// Optimized
// const myFunc = function checkInclusion(s1: string, s2: string): boolean {
//   if (s1.length > s2.length) return false;

//   const need = new Int32Array(26);
//   const window = new Int32Array(26);

//   // Initialize first window
//   for (let i = 0; i < s1.length; i++) {
//     need[s1.charCodeAt(i) - 97]++;
//     window[s2.charCodeAt(i) - 97]++;
//   }

//   // Calculate initial matches
//   let matches = 0;
//   for (let i = 0; i < 26; i++) {
//     if (need[i] === window[i]) matches++;
//   }

//   let l = 0;
//   let r = s1.length;

//   // Slide the window
//   while (r < s2.length) {
//     // Check if the current window is a match
//     if (matches === 26) return true;

//     // 1. Process the outgoing character (left side)
//     const lIdx = s2.charCodeAt(l) - 97;
//     if (window[lIdx] === need[lIdx]) matches--; // It was matching, about to break it
//     window[lIdx]--;
//     if (window[lIdx] === need[lIdx]) matches++; // Check if it matches after change

//     // 2. Process the incoming character (right side)
//     const rIdx = s2.charCodeAt(r) - 97;
//     if (window[rIdx] === need[rIdx]) matches--; // It was matching, about to break it
//     window[rIdx]++;
//     if (window[rIdx] === need[rIdx]) matches++; // Check if it matches after change

//     l++;
//     r++;
//   }

//   // Check the very last window after the loop terminates
//   return matches === 26;
// };

// Clean + ultra optimized
const myFunc = function checkInclusion(s1: string, s2: string): boolean {
  // A permutation of s1 cannot fit inside a shorter string.
  if (s1.length > s2.length) return false;

  const need_window = new Int32Array(26);
  const curr_window = new Int32Array(26);

  // Build the target frequency map and the initial window.
  for (let i = 0; i < s1.length; i++) {
    need_window[s1.charCodeAt(i) - 97]++;
    curr_window[s2.charCodeAt(i) - 97]++;
  }

  // Count how many character frequencies currently match.
  let matches = 0;
  for (let i = 0; i < 26; i++) {
    curr_window[i] === need_window[i] && matches++;
  }

  // Check the initial window.
  if (matches === 26) return true;

  let l = 0;
  let r = s1.length;
  // Slide the window one character at a time.
  while (r < s2.length) {
    // Remove the leftmost character and add the next right character.
    update(s2.charCodeAt(l) - 97, -1);
    update(s2.charCodeAt(r) - 97, 1);

    // All 26 character frequencies match, so we've found a permutation.
    if (matches === 26) return true;

    l++;
    r++;
  }

  return false;

  // Updates a single character count while keeping the number of matching frequencies in sync.
  function update(idx: number, delta: 1 | -1) {
    if (curr_window[idx] === need_window[idx]) matches--;
    curr_window[idx] += delta;
    if (curr_window[idx] === need_window[idx]) matches++;
  }
};

runTests(myFunc, [
  // Leetcode
  { input: ["ab", "eidbaooo"], output: true },
  { input: ["ab", "eidboaoo"], output: false },

  // Neetcode
  { input: ["abc", "lecabee"], output: true },
  { input: ["abc", "lecaabee"], output: false },

  // Edge
]);
