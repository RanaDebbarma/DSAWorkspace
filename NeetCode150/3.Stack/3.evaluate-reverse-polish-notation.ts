import { runTests, TestCase } from "#functions/code-tester.js";

function evalRPN(tokens: string[]): number {
  const stack: number[] = [];

  for (const token of tokens) {
    const num = Number(token);

    if (Number.isNaN(num)) {
      const right = stack.pop()!;
      const left = stack.pop()!;

      switch (token) {
        case "+":
          stack.push(left + right);
          break;
        case "-":
          stack.push(left - right);
          break;
        case "*":
          stack.push(left * right);
          break;
        case "/":
          stack.push(Math.trunc(left / right));
          break;
      }
    } else {
      stack.push(num);
    }
  }
  return stack.pop()!;
}

const inputs: TestCase<typeof evalRPN>[] = [
  { input: [["2", "1", "+", "3", "*"]], output: 9 },
  { input: [["4", "13", "5", "/", "+"]], output: 6 },
  { input: [["1", "2", "+", "3", "*", "4", "-"]], output: 5 },

  // edge
  {
    input: [
      ["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"],
    ],
    output: 22,
  },
];

runTests(evalRPN, inputs, true);
