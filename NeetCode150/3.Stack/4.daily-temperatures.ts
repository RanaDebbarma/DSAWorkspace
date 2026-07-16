import { runTests } from "#functions/code-tester.js";

// Brute Force O(n^2) time and o(1) space
// function dailyTemperatures(temperatures: number[]): number[] {
//   const result: number[] = [];

//   for (let i = 0; i < temperatures.length; i++) {
//     let days = 0;

//     for (let j = i + 1; j < temperatures.length; j++) {
//       if (temperatures[i] < temperatures[j]) {
//         days = j - i;
//         break;
//       }
//     }

//     result.push(days);
//   }

//   return result;
// }

// Optimal (monotonic stack)
function dailyTemperatures(temperatures: number[]): number[] {
  const result = new Array<number>(temperatures.length).fill(0);
  const stack: number[] = []; // stores indices

  for (let i = 0; i < temperatures.length; i++) {
    while (
      stack.length &&
      temperatures[i] > temperatures[stack[stack.length - 1]]
    ) {
      const prev = stack.pop()!;
      result[prev] = i - prev;
    }

    stack.push(i);
  }

  return result;
}

runTests(dailyTemperatures, [
  // Leetcode
  // {
  //   input: [[73, 74, 75, 71, 69, 72, 76, 73]],
  //   output: [1, 1, 4, 2, 1, 1, 0, 0],
  // },
  // { input: [[30, 40, 50, 60]], output: [1, 1, 1, 0] },
  // { input: [[30, 60, 90]], output: [1, 1, 0] },

  // Neetcode
  { input: [[30, 38, 30, 36, 35, 40, 28]], output: [1, 4, 1, 2, 1, 0, 0] },
  // { input: [[22, 21, 20]], output: [0, 0, 0] },

  // Edge
  {
    input: [[89, 62, 70, 58, 47, 47, 46, 76, 100, 70]],
    output: [8, 1, 5, 4, 3, 2, 1, 1, 0, 0],
  },
  {
    input: [[55, 38, 53, 81, 61, 93, 97, 32, 43, 78]],
    output: [3, 1, 1, 2, 1, 1, 0, 1, 1, 0],
  },
  {
    input: [[77, 77, 77, 77, 77, 41, 77, 41, 41, 77]],
    output: [0, 0, 0, 0, 0, 1, 0, 2, 1, 0],
  },
]);
