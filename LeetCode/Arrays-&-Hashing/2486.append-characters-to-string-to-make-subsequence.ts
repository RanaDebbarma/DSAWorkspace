import { runTests } from "#functions/code-tester.js";

// LeetCode 2486

function appendCharacters(s: string, t: string): number {
  let i = 0;

  for (const ch of s) {
    if (ch === t[i]) {
      i++;
    }
  }

  return t.length - i;
}

runTests(appendCharacters, [
  { input: ["coaching", "coding"], output: 4 },
  { input: ["abcde", "a"], output: 0 },
  { input: ["z", "abcde"], output: 5 },
]);
