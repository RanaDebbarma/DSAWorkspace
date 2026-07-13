import chalk from "chalk";
import { performance } from "node:perf_hooks";
import { ListNode, cloneLinkedList, linkedListToString } from "#functions/linked-list.js";
import { TreeNode, cloneBinaryTree, binaryTreeToArray } from "#functions/tree.js";
import { GraphNode, cloneGraph, graphToAdjList } from "#functions/graph.js";
import {
  smartCompare,
  compareUnorderedArrays,
  compareUnordered2DArrays,
  compareGroupAnagrams,
  compare3Sum
} from "#functions/compare.js";

export type TestCase<F extends (...args: any[]) => any> = {
  name?: string;
  input: Parameters<F>;
  output: ReturnType<F>;
  compare?: (actual: ReturnType<F>, expected: ReturnType<F>) => boolean;
  cloneInput?: (input: Parameters<F>) => Parameters<F>;
};

export type ClassTestCase = {
  name?: string;
  operations: string[];
  args: any[][];
  expected: any[];
};

/**
 * Extracts the parameter names of a function at runtime.
 */
function getParamNames(fn: Function): string[] {
  const fnStr = fn.toString().replace(/[\r\n\s]+/g, " ").trim();
  
  let paramsStr = "";
  // Check for parenthesis signature (regular functions, async functions, arrow functions)
  const parenMatch = fnStr.match(/^(?:async\s+)?(?:function\s*[^(]*\s*)?\(([^)]*)\)/);
  if (parenMatch) {
    paramsStr = parenMatch[1];
  } else {
    // Arrow function without parenthesis: x => ...
    const arrowMatch = fnStr.match(/^([^=]+)=>/);
    if (arrowMatch) {
      paramsStr = arrowMatch[1].trim();
    }
  }

  if (!paramsStr.trim()) return [];

  return paramsStr
    .split(",")
    .map((p) => {
      // Remove default assignments (e.g. x = 1 ➔ x)
      let name = p.split("=")[0].trim();
      // Remove comments
      name = name.replace(/\/\*.*?\*\//g, "").trim();
      return name;
    })
    .filter((p) => p !== "");
}

/**
 * Formats a value recursively into a clean, human-readable JSON/string format.
 * Automatically serializes ListNodes, TreeNodes, and GraphNodes.
 */
export function formatValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof ListNode) {
    return linkedListToString(value);
  }

  if (value instanceof TreeNode) {
    return binaryTreeToArray(value);
  }

  if (value instanceof GraphNode) {
    return graphToAdjList(value);
  }

  if (Array.isArray(value)) {
    return value.map(formatValue);
  }

  return value;
}

/**
 * Deep clones any value recursively.
 * Special-cases ListNodes, TreeNodes, and GraphNodes.
 */
export function cloneValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof ListNode) {
    return cloneLinkedList(value);
  }

  if (value instanceof TreeNode) {
    return cloneBinaryTree(value);
  }

  if (value instanceof GraphNode) {
    return cloneGraph(value);
  }

  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }

  if (typeof value === "object") {
    try {
      return structuredClone(value);
    } catch {
      return value; // fallback
    }
  }

  return value;
}

/**
 * Generic runner for standard functions.
 */
export function runTests<F extends (...args: any[]) => any>(
  fn: F,
  tests: TestCase<F>[],
  showOutput = false,
) {
  if (tests.length === 0) {
    console.log(chalk.yellow("⚠ No test cases provided."));
    return;
  }

  let passedCount = 0;

  for (const [index, test] of tests.entries()) {
    drawDivider();

    const { name, input, output, compare, cloneInput } = test;

    const actualInput = cloneInput
      ? cloneInput(input)
      : (cloneValue(input) as Parameters<F>);

    const start = performance.now();
    const result = fn(...actualInput);
    const end = performance.now();

    const passed = compare
      ? compare(result, output)
      : smartCompare(result, output);

    if (passed) passedCount++;

    console.log(
      chalk.cyan.bold(`\nTest ${index + 1}${name ? ` - ${name}` : ""}`),
    );

    console.log(chalk.gray("Input:"));
    try {
      const paramNames = getParamNames(fn);
      const formattedInputs = input.map(formatValue);
      if (paramNames.length === input.length) {
        const inputStrings = paramNames.map((name, i) => {
          const rawVal = input[i];
          const formattedVal = formattedInputs[i];

          let serializedValue = "";
          if (rawVal instanceof ListNode) {
            serializedValue = String(formattedVal);
          } else if (rawVal instanceof TreeNode || rawVal instanceof GraphNode) {
            serializedValue = JSON.stringify(formattedVal);
          } else if (typeof rawVal === "string") {
            serializedValue = `"${rawVal}"`;
          } else if (Array.isArray(rawVal)) {
            serializedValue = JSON.stringify(formattedVal);
          } else {
            serializedValue = String(formattedVal);
          }
          return `${name}: ${serializedValue}`;
        });
        console.log(inputStrings.join(", \n"));
<<<<<<< HEAD
        console.log();
=======
>>>>>>> 9ea2e2e6b111b035a06385d97b9bfcaa775bf915
      } else {
        console.dir(formattedInputs, { depth: null });
      }
    } catch {
      console.dir(input.map(formatValue), { depth: null });
    }

    if (!passed) {
      console.log(chalk.hex("#cc6e0f")("Expected:"));
      console.dir(formatValue(output), { depth: null });
      console.log();

      console.log(chalk.hex("#cc6e0f")("Received:"));
      console.dir(formatValue(result), { depth: null });
      console.log();
    }

    if (passed && showOutput) {
      console.log(chalk.gray("Output:"));
      console.dir(formatValue(result), { depth: null });
    }

    console.log(passed ? chalk.green("✅ Passed") : chalk.red("❌ Failed"));
    console.log(chalk.gray(`Time: ${(end - start).toFixed(3)} ms`));
    console.log();

    drawDivider();
  }

  console.log();

  if (passedCount === tests.length) {
    console.log(
      chalk.green.bold(`🎉 All ${passedCount}/${tests.length} tests passed!`),
    );
  } else {
    console.log(
      chalk.red.bold(`❌ Passed ${passedCount}/${tests.length} tests`),
    );
  }
}

/**
 * Runner for Interactive/Class Design LeetCode problems (e.g. MinStack, LRUCache).
 */
export function runClassTests<C extends new (...args: any[]) => any>(
  cls: C,
  tests: ClassTestCase[],
  showOutput = false,
) {
  if (tests.length === 0) {
    console.log(chalk.yellow("⚠ No test cases provided."));
    return;
  }

  let passedCount = 0;

  for (const [index, test] of tests.entries()) {
    drawDivider();

    const { name, operations, args, expected } = test;
    const actualOutputs: any[] = [];
    let instance: any = null;
    let failedIdx = -1;

    console.log(
      chalk.cyan.bold(`\nTest ${index + 1}${name ? ` - ${name}` : ""}`),
    );

    const start = performance.now();
    try {
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        const opArgs = args[i] || [];

        if (i === 0) {
          instance = new cls(...opArgs);
          actualOutputs.push(null);
        } else {
          if (!instance) {
            throw new Error("Instance was not initialized on first operation");
          }
          if (typeof instance[op] !== "function") {
            throw new Error(`Method "${op}" is not defined on class`);
          }
          const res = instance[op](...opArgs);
          actualOutputs.push(res !== undefined ? res : null);
        }
      }
    } catch (err: any) {
      console.log(chalk.red(`Runtime Error: ${err.message}`));
      actualOutputs.push(null);
    }
    const end = performance.now();

    let passed = true;
    if (actualOutputs.length !== expected.length) {
      passed = false;
    } else {
      for (let i = 0; i < expected.length; i++) {
        if (!smartCompare(actualOutputs[i], expected[i])) {
          passed = false;
          failedIdx = i;
          break;
        }
      }
    }

    if (passed) passedCount++;

    console.log(chalk.gray("Operations:"));
    console.log(JSON.stringify(operations));
    console.log(chalk.gray("Arguments:"));
    console.log(JSON.stringify(args));

    if (!passed) {
      console.log(chalk.hex("#cc6e0f")("Expected:"));
      console.dir(formatValue(expected), { depth: null });

      console.log(chalk.hex("#cc6e0f")("Received:"));
      console.dir(formatValue(actualOutputs), { depth: null });

      if (failedIdx !== -1) {
        console.log(chalk.red(`Failed at step ${failedIdx}: operation "${operations[failedIdx]}" with args ${JSON.stringify(args[failedIdx])}`));
      }
    }

    if (passed && showOutput) {
      console.log(chalk.gray("Output:"));
      console.dir(formatValue(actualOutputs), { depth: null });
    }

    console.log(passed ? chalk.green("✅ Passed") : chalk.red("❌ Failed"));
    console.log(chalk.gray(`Time: ${(end - start).toFixed(3)} ms`));

    drawDivider();
  }

  console.log();

  if (passedCount === tests.length) {
    console.log(
      chalk.green.bold(`🎉 All ${passedCount}/${tests.length} tests passed!`),
    );
  } else {
    console.log(
      chalk.red.bold(`❌ Passed ${passedCount}/${tests.length} tests`),
    );
  }
}

function drawDivider(char = "-", colorFn = chalk.gray) {
  const width = process.stdout.columns || 80;
  const line = char.repeat(width);
  console.log(colorFn(line));
}

// Re-export comparators for general utility import
export {
  smartCompare,
  compareUnorderedArrays,
  compareUnordered2DArrays,
  compareGroupAnagrams,
  compare3Sum
};
