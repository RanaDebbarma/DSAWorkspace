import { runTests } from "#functions/code-tester.js";

// LeetCode 131

function partition(s: string): string[][] {
  const partitions: string[][] = [];

  backtrack(0, []);

  return partitions;

  function backtrack(start: number, palindromes: string[]) {
    // Reached the end → found a valid partition
    if (start === s.length) {
      partitions.push([...palindromes]);
      return;
    }

    // Try every substring starting at `start`
    for (let end = start; end < s.length; end++) {
      // Skip if s[start...end] is not a palindrome
      if (!isPalindrome(start, end)) continue;

      // Choose the palindrome
      palindromes.push(s.substring(start, end + 1));

      // Explore the remaining substring
      backtrack(end + 1, palindromes);

      // Undo the choice
      palindromes.pop();
    }
  }

  function isPalindrome(l: number, r: number): boolean {
    while (l < r) {
      if (s[l] !== s[r]) return false;
      l++;
      r--;
    }

    return true;
  }
}

runTests(
  partition,
  [
    {
      input: ["aab"],
      output: [
        ["a", "a", "b"],
        ["aa", "b"],
      ],
    },
    { input: ["a"], output: [["a"]] },
  ],
  { showHint: false },
);
