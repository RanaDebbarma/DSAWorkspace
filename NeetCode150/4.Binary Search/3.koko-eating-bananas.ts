import { runTests, TestCase } from "#functions/code-tester.js";

// Leetcode 875
// const myFunc = function minEatingSpeed(piles: number[], h: number): number {
//   let l = 1;
//   let r =  Math.max(...piles);
//   let minSpeed = r;

//   // Binary search
//   while (l <= r) {
//     const mid = l + Math.floor((r - l) / 2);

//     // find minSpeed
//     let hours = 0;
//     for (const pile of piles) {
//       hours += Math.ceil(pile / mid);
//     }

//     if (hours <= h) {
//       minSpeed = mid;
//       r = mid - 1;
//     } else {
//       l = mid + 1;
//     }
//   }

//   return minSpeed;
// };

// Approach 2 (proffesional)
const myFunc = function minEatingSpeed(piles: number[], h: number): number {
  let l = 1;
  let r = Math.max(...piles);

  while (l < r) {
    const mid = l + Math.floor((r - l) / 2);

    if (canEatAll(piles, mid, h)) {
      r = mid;
    } else {
      l = mid + 1;
    }
  }

  return l;
};

// helper
function canEatAll(piles: number[], speed: number, h: number) {
  let hours = 0;
  for (const pile of piles) {
    hours += Math.ceil(pile / speed);
  }
  return hours <= h;
}

const inputs: TestCase<typeof myFunc>[] = [
  // Leetcode
  { input: [[3, 6, 7, 11], 8], output: 4 },
  { input: [[30, 11, 23, 4, 20], 5], output: 30 },
  { input: [[30, 11, 23, 4, 20], 6], output: 23 },

  // // Neetcode
  { input: [[1, 4, 3, 2], 9], output: 2 },
  { input: [[25, 10, 23, 4], 4], output: 25 },
];

runTests(myFunc, inputs);
