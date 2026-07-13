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

// Output: [null,null,null,null,0,null,2,1]

// Explanation:
// const minStack = new MinStack();
// minStack.push(1);
// minStack.push(2);
// minStack.push(0);
// minStack.getMin(); // return 0
// minStack.pop();
// minStack.top(); // return 2
// minStack.getMin(); // return 1
// minStack.print();

// ---------------------------------------------

const minStack = new MinStack();
minStack.push(-2);
minStack.push(0);
minStack.push(-3);
const min1 = minStack.getMin(); // return -3
minStack.pop();
const top = minStack.top(); // return 0
const min2 = minStack.getMin(); // return -2

// ------- Test ----------
minStack.print();
console.log("");
// console.log(minStack, "\n");
console.log("min:", min1);
console.log("top:", top);
console.log("min:", min2);
