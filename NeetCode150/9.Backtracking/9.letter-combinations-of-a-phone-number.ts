import { runTests } from "#functions/code-tester.js";

// LeetCode 17

function letterCombinations(digits: string): string[] {
  if (digits.length === 0) return [];

  const map: Record<string, string> = {
    "2": "abc",
    "3": "def",
    "4": "ghi",
    "5": "jkl",
    "6": "mno",
    "7": "pqrs",
    "8": "tuv",
    "9": "wxyz",
  };

  const res: string[] = [];

  backtrack(0, "");

  return res;

  // i = current digit index
  // comb = combination built so far
  function backtrack(i: number, comb: string) {
    // All digits have been processed
    if (i === digits.length) {
      res.push(comb);
      return;
    }

    // Get all letters mapped to the current digit
    const chars = map[digits[i]];

    // Try each possible letter for the current digit
    for (const char of chars) {
      backtrack(i + 1, comb + char);
    }
  }
}

runTests(
  letterCombinations,
  [
    {
      input: ["34"],
      output: ["dg", "dh", "di", "eg", "eh", "ei", "fg", "fh", "fi"],
    },
    { input: ["2"], output: ["a", "b", "c"] },
    { input: [""], output: [] },
  ],
  { showHint: false },
);
