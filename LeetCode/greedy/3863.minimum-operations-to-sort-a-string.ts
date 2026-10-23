import { runTests } from "#functions/code-tester.js";

// LeetCode 3863

function minOperations(s: string): number {
  const n = s.length;

  let sorted = true;

  for (let i = 1; i < n; i++) {
    if (s[i] < s[i - 1]) {
      sorted = false;
      break;
    }
  }

  if (sorted) return 0;
  if (n === 2) return -1;

  let min = s[0];
  let max = s[0];

  for (const c of s) {
    if (c < min) min = c;
    if (c > max) max = c;
  }

  if (s[0] === min || s[n - 1] === max) return 1;

  for (let i = 1; i < n - 1; i++) {
    if (s[i] === min || s[i] === max) {
      return 2;
    }
  }

  return 3;
}

runTests(minOperations, [
  { input: ["dog"], output: 1 },
  { input: ["card"], output: 2 },
  { input: ["gf"], output: -1 },

  { input: ["klo"], output: 0 },
  { input: ["edc"], output: 3 },
]);
