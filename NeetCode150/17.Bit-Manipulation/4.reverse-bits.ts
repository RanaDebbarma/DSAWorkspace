import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 190

// time: O(1) — always processes exactly 32 bits
// space: O(1) — uses constant extra space
function reverseBits(n: number): number {
  let rev = 0;

  for (let i = 0; i < 32; i++) {
    // Extract the i-th bit from the right (LSB first)
    const bit = (n >>> i) & 1;

    // Shift existing bits left and append the extracted bit on the right
    rev = (rev << 1) | bit;
  }

  // Convert signed 32-bit result to unsigned 32-bit integer
  return rev >>> 0;
}

const cases: TestCase<typeof reverseBits>[] = [
  { input: [43261596], output: 964176192 },
  // 43261596:	00000010100101000001111010011100
  // 964176192:	00111001011110000010100101000000

  { input: [2147483644], output: 1073741822 },
  {
    input: [21],
    output: 2818572288,
  },
];

runTests(reverseBits, cases);
runCompare([reverseBits], cases);
