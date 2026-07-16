import { runClassTests } from "#functions/code-tester.js";

class MinStack {
  #stack: number[] = [];
  #minstack: number[] = [];

  push(value: number): void {
    this.#stack.push(value);

    if (this.#minstack.length === 0) {
      this.#minstack.push(value);
    } else {
      const prevMin = this.#minstack[this.#minstack.length - 1];
      const newMin = value < prevMin ? value : prevMin;
      this.#minstack.push(newMin);
    }
  }

  pop(): void {
    this.#stack.pop();
    this.#minstack.pop();
  }

  top(): number {
    return this.#stack[this.#stack.length - 1];
  }

  getMin(): number | undefined {
    return this.#minstack[this.#minstack.length - 1];
  }

  print(): void {
    console.log(this.#stack);
  }
}

runClassTests(MinStack, [
  {
    operations: ["MinStack", "push", "push", "getMin", "pop", "top", "getMin"],
    args: [[], [-2], [0]],
    expected: [null, null, null, -2, null, -2, -2],
  },
  {
    operations: [
      "MinStack",
      "push",
      "push",
      "push",
      "getMin",
      "pop",
      "top",
      "getMin",
    ],
    args: [[], [1], [2], [0]],
    expected: [null, null, null, null, 0, null, 2, 1],
  },
], {showHeader: true});
