import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 846

// time: O(n²)
// space: O(n)
// First approach
function isNStraightHand_BF(hand: number[], groupSize: number): boolean {
  const n = hand.length;
  const visited = new Set();

  if (n % groupSize !== 0) return false;

  hand.sort((a, b) => a - b);

  for (let i = 0; i < n; i++) {
    if (visited.has(i)) continue;

    createGroup(i);
    if (visited.size === n) return true;
  }

  return false;

  function createGroup(start: number): void {
    const group: number[] = [];

    for (let i = start; i < n; i++) {
      if (visited.has(i)) continue;

      if (group.length < 1 || hand[i] === hand[group.at(-1)!] + 1) {
        group.push(i);
      }

      if (group.length === groupSize) {
        group.forEach((val) => visited.add(val));
        break;
      }
    }
  }
}

// time: O(n log n)
// space: O(n)
// Greedy + Frequency Map
function isNStraightHand(hand: number[], groupSize: number): boolean {
  const n = hand.length;

  if (n % groupSize !== 0) return false;

  hand.sort((a, b) => a - b);

  // Count occurrences of each card.
  const freq = new Map<number, number>();

  for (const card of hand) {
    freq.set(card, (freq.get(card) ?? 0) + 1);
  }

  // Process the smallest remaining card first.
  for (const card of hand) {
    const count = freq.get(card) ?? 0;

    if (count === 0) continue;

    // Form a group of consecutive cards.
    for (let next = card; next < card + groupSize; next++) {
      const remaining = freq.get(next) ?? 0;

      if (remaining === 0) return false;

      // Consume one occurrence of the card.
      freq.set(next, remaining - 1);
    }
  }

  return true;
}

function generateInput() {
  const range = { min: 1, max: 100 };
  let i = range.max;
  return Array.from(
    { length: range.max - range.min + 1 },
    () =>
      Math.floor(Math.random() * (range.max - range.min) + range.min),
      // i--,
  );
}

const bigInput = generateInput();

const cases: TestCase<typeof isNStraightHand>[] = [
  { input: [[1, 2, 3, 6, 2, 3, 4, 7, 8], 3], output: true },
  { input: [[1, 2, 3, 4, 5], 4], output: false },
  { input: [[1, 2, 4, 2, 3, 5, 3, 4], 4], output: true },
  { input: [[1, 2, 3, 3, 4, 5, 6, 7], 4], output: false },
  {
    input: [bigInput, 4],
    output: isNStraightHand(bigInput, 4),
    // output: true,
    showStringInput: false,
  },
];

runTests(isNStraightHand, cases);
runCompare([isNStraightHand_BF, isNStraightHand], cases);
