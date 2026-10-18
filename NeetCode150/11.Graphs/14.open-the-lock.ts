import { runTests } from "#functions/code-tester.js";

// LeetCode 752

// time: O(n)
// space: O(n)
function openLock(deadends: string[], target: string): number {
  const deadendsSet = new Set(deadends);

  if (deadendsSet.has("0000")) return -1;
  if (target === "0000") return 0;

  const visited = new Set<string>(["0000"]);

  const queue: string[] = ["0000"];
  let head = 0;
  let turns = -1;

  while (head < queue.length) {
    const lvlSize = queue.length - head;
    turns++;

    for (let lvl = 0; lvl < lvlSize; lvl++) {
      const combination = queue[head++];

      if (combination === target) return turns;

      for (const next of nextCombinations(combination)) {
        if (visited.has(next) || deadendsSet.has(next)) continue;

        visited.add(next);
        queue.push(next);
      }
    }
  }

  return -1;

  function nextCombinations(combination: string): string[] {
    const next: string[] = [];

    for (let i = 0; i < 4; i++) {
      const comb = [...combination];
      const num = Number(comb[i]);

      // backwards
      comb[i] = num === 0 ? "9" : String(num - 1);
      next.push(comb.join(""));

      // forwards
      comb[i] = num === 9 ? "0" : String(num + 1);
      next.push(comb.join(""));
    }

    return next;
  }
}

runTests(
  openLock,
  [
    { input: [["1111", "0120", "2020", "3333"], "5555"], output: 20 },
    {
      input: [
        ["4443", "4445", "4434", "4454", "4344", "4544", "3444", "5444"],
        "4444",
      ],
      output: -1,
    },
    { input: [["0201", "0101", "0102", "1212", "2002"], "0202"], output: 6 },
    { input: [["8888"], "0009"], output: 1 },
    {
      input: [
        ["8887", "8889", "8878", "8898", "8788", "8988", "7888", "9888"],
        "8888",
      ],
      output: -1,
    },
  ],
  { showStringInput: false },
);
