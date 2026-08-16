import { runTests } from "#functions/code-tester.js";

function longestCommonPrefix(strs: string[]): string {
  if (!strs.length) return "";

  for (let i = 0; i < strs[0].length; i++) {
    const ch = strs[0][i];

    for (let j = 1; j < strs.length; j++) {
      if (i === strs[j].length || strs[j][i] !== ch) {
        return strs[0].slice(0, i);
      }
    }
  }

  return strs[0];
}

runTests(
  longestCommonPrefix,
  [
    { input: [["bat", "bag", "bank", "band"]], output: "ba" },
    { input: [["dance", "dag", "danger", "damage"]], output: "da" },
    { input: [["neet", "feet"]], output: "" },
    { input: [["flow", "flower", "flight"]], output: "fl" },
    { input: [["dog", "racecar", "car"]], output: "" },
  ],
  { showHint: false },
);
