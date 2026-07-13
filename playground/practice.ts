import { runTests, TestCase } from "#functions/code-tester.js";

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

const inputs: TestCase<typeof myFunc>[] = [
  // Leetcode
  { input: ["ab", "eidbaooo"], output: true },
  { input: ["ab", "eidboaoo"], output: false },
  { input: ["ab", "ab"], output: true },

  // Neetcode
  { input: ["abc", "lecabee"], output: true },
  { input: ["abc", "lecaabee"], output: false },

  // Edge
];

runTests(myFunc, inputs);
