import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 763

// time: O(n)
// space: O(1) — fixed 26-character alphabet
// greedy
function partitionLabels_G(s: string): number[] {
  const lastIdx = new Int32Array(26);

  for (let i = 0; i < s.length; i++) {
    lastIdx[s.charCodeAt(i) - 97] = i;
  }

  const groups = [];
  let start = 0;
  let end = 0;

  for (let i = 0; i < s.length; i++) {
    const chIdx = s.charCodeAt(i) - 97;
    end = Math.max(end, lastIdx[chIdx]);

    if (end === i) {
      groups.push(end - start + 1);
      start = end + 1;
    }
  }

  return groups;
}

const cases: TestCase<typeof partitionLabels_G>[] = [
  { input: ["ababcbacadefegdehijhklij"], output: [9, 7, 8] },
  // [ababcbaca] [defegde] [hijhklij]
  { input: ["eccbbbbdec"], output: [10] },
  { input: ["xyxxyzbzbbisl"], output: [5, 5, 1, 1, 1] },
  { input: ["abcabc"], output: [6] },
];

runTests(partitionLabels_G, cases);
runCompare([partitionLabels_G], cases);
