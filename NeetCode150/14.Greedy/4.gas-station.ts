import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 134

// time: O(n²)
// space: O(n)
// Brute-Force
function canCompleteCircuit_BF(gas: number[], cost: number[]): number {
  const n = gas.length;

  for (let i = 0; i < n; i++) {
    if (driveNext(i, i, 0)) return i;
  }

  return -1;

  function driveNext(start: number, curr: number, tank: number): boolean {
    tank += gas[curr] - cost[curr];

    if (tank < 0) return false;

    const next = (curr + 1) % n;
    if (next === start) return true;

    return driveNext(start, next, tank);
  }
}

// time: O(n)
// space: O(1)
// Greedy
function canCompleteCircuit_G(gas: number[], cost: number[]): number {
  const n = gas.length;
  let start = 0;
  let total = 0;
  let tank = 0;

  for (let i = 0; i < n; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;

    if (tank < 0) {
      // None of the stations from start to i can be a valid starting point.
      start = i + 1;
      tank = 0;
    }
  }

  // A complete circuit is possible only if total gas >= total cost.
  return total >= 0 && start < n ? start : -1;
}

function generateInput() {
  const range = { min: 1, max: 1000 };
  return Array.from({ length: 1000 }, () =>
    Math.floor(Math.random() * (range.max - range.min) + range.min),
  );
}

const bigInputGas = generateInput();
const bigInputCost = generateInput();

const cases: TestCase<typeof canCompleteCircuit_G>[] = [
  {
    input: [
      [1, 2, 3, 4, 5],
      [3, 4, 5, 1, 2],
    ],
    output: 3,
  },
  {
    input: [
      [2, 3, 4],
      [3, 4, 3],
    ],
    output: -1,
  },
  {
    input: [
      [1, 2, 3, 4],
      [2, 2, 4, 1],
    ],
    output: 3,
  },
  {
    input: [
      [1, 2, 3],
      [2, 3, 2],
    ],
    output: -1,
  },

  // edge
  {
    input: [bigInputGas, bigInputCost],
    output: canCompleteCircuit_G(bigInputGas, bigInputCost),
    showStringInput: false,
  },
];

runTests(canCompleteCircuit_G, cases);
runCompare([canCompleteCircuit_BF, canCompleteCircuit_G], cases);
