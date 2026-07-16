import chalk from "chalk";
import { performance } from "node:perf_hooks";
import { ListNode } from "#functions/linked-list.js";
import { TreeNode } from "#functions/tree.js";
import { GraphNode } from "#functions/graph.js";
import {
  smartCompare,
  compareUnorderedArrays,
  compareUnordered2DArrays,
  compareGroupAnagrams,
  compare3Sum,
} from "#utils/compare.js";
import { cloneValue } from "#utils/clone.js";
import {
  getParamNames,
  formatValue,
  serializeForDisplay,
  drawDivider,
  padMultiline,
} from "#utils/display.js";
import { renderDiff } from "#utils/diff.js";

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
 * Generic runner for standard functions.
 */
export type TestOptions = {
  showHeader?: boolean;
};

export function runTests<F extends (...args: any[]) => any>(
  fn: F,
  tests: TestCase<F>[],
  options: boolean | TestOptions = false,
) {
  if (tests.length === 0) {
    console.log(chalk.yellow("⚠ No test cases provided."));
    return;
  }

  const showHeader = typeof options === "boolean" ? false : (options?.showHeader ?? false);

  let passedCount = 0;

  drawDivider("═");
  if (showHeader) {
    const fnName = fn.name || "solve";
    console.log(
      `${chalk.bgCyan.black(" RUNS ")}  ${chalk.cyan.bold(`${fnName}()`)}`,
    );
  }

  for (const [index, test] of tests.entries()) {
    // if (index > 0) drawDivider();
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

    // ── Header ───────────────────────────────────────────────────────────────
    drawDivider();
    const statusBadge = passed
      ? chalk.bgGreen.black(" PASS ")
      : chalk.bgRed.white(" FAIL ");
    const timeStr = chalk.gray(`${(end - start).toFixed(3)} ms`);
    console.log(
      `${statusBadge}  ${chalk.cyan.bold(`Test ${index + 1}${name ? ` — ${name}` : ""}`)}  ${timeStr}`,
    );
    drawDivider();

    // ── Input block ───────────────────────────────────────────────────────────
    console.log();
    try {
      const paramNames = getParamNames(fn);
      const formattedInputs = input.map(formatValue);

      if (paramNames.length === input.length) {
        for (let i = 0; i < input.length; i++) {
          const rawVal = input[i];
          const formattedVal = formattedInputs[i];
          let serialized = "";

          if (rawVal instanceof ListNode) {
            serialized = String(formattedVal);
          } else if (
            rawVal instanceof TreeNode ||
            rawVal instanceof GraphNode
          ) {
            serialized = JSON.stringify(formattedVal);
          } else if (typeof rawVal === "string") {
            serialized = `"${rawVal}"`;
          } else if (Array.isArray(rawVal)) {
            serialized = JSON.stringify(formattedVal);
          } else {
            serialized = String(formattedVal);
          }

          console.log(
            `  ${chalk.cyan(paramNames[i])} ${chalk.gray("=")} ${chalk.white(serialized)}`,
          );
        }
      } else {
        console.dir(formattedInputs, { depth: null });
      }
    } catch {
      console.dir(input.map(formatValue), { depth: null });
    }

    // ── Expected / Got block ─────────────────────────────────────────────────
    console.log();
    if (passed) {
      console.log(
        `  ${chalk.gray("Output  ")}  ${padMultiline(chalk.green(serializeForDisplay(result)), 12)}`,
      );
    } else {
      const { expLine, gotLine, hint } = renderDiff(result, output);
      console.log(
        `  ${chalk.hex("#cc6e0f")("Expected")}  ${padMultiline(expLine, 12)}`,
      );
      console.log(
        `  ${chalk.hex("#cc6e0f")("Got     ")}  ${padMultiline(gotLine, 12)}`,
      );
      if (hint) console.log(`  ${chalk.red("↳")} ${chalk.gray(hint)}`);
    }
    console.log();
  }

  drawDivider()
  if (passedCount === tests.length) {
    console.log(
      chalk.green.bold(`🎉 All ${passedCount}/${tests.length} tests passed!`),
    );
  } else {
    console.log(
      chalk.red.bold(`❌ Passed ${passedCount}/${tests.length} tests`),
    );
  }

  drawDivider("═");
}

/**
 * Runner for Interactive/Class Design LeetCode problems (e.g. MinStack, LRUCache).
 */
export function runClassTests<C extends new (...args: any[]) => any>(
  cls: C,
  tests: ClassTestCase[],
  options: boolean | TestOptions = false,
) {
  if (tests.length === 0) {
    console.log(chalk.yellow("⚠ No test cases provided."));
    return;
  }

  const showHeader = typeof options === "boolean" ? false : (options?.showHeader ?? false);

  let passedCount = 0;

  drawDivider("═");
  if (showHeader) {
    const className = cls.name || "Class";
    console.log(
      `${chalk.bgCyan.black(" RUNS ")}  ${chalk.cyan.bold(`new ${className}()`)}`,
    );
  }

  for (const [index, test] of tests.entries()) {
    const { name, operations, args, expected } = test;
    const actualOutputs: any[] = [];
    let instance: any = null;
    let failedIdx = -1;

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

    // ── Header (badge style matching runTests) ───────────────────────────────
    drawDivider();
    const classBadge = passed
      ? chalk.bgGreen.black(" PASS ")
      : chalk.bgRed.white(" FAIL ");
    const classTime = chalk.gray(`${(end - start).toFixed(3)} ms`);
    console.log(
      `${classBadge}  ${chalk.cyan.bold(`Test ${index + 1}${name ? ` — ${name}` : ""}`)}  ${classTime}`,
    );
    drawDivider();

    // ── Per-step trace table ──────────────────────────────────────────────────
    const COL_STEP = 5;
    const COL_OP = Math.max(
      16,
      ...operations.map((op, i) => {
        const argStr = args[i]?.length
          ? JSON.stringify(args[i]).slice(1, -1)
          : "";
        return `${op}(${argStr})`.length + 2;
      }),
    );
    const COL_VAL = Math.max(
      10,
      ...expected.map((v) => (JSON.stringify(v) ?? "null").length + 2),
    );
    const COL_OK = 7;

    const pad = (s: string, n: number) => s.slice(0, n).padEnd(n);
    const hr = chalk.gray(
      "─".repeat(COL_STEP + COL_OP + COL_VAL + COL_VAL + COL_OK + 10),
    );

    console.log();
    console.log(
      "  " +
      chalk.gray(
        `${pad("Step", COL_STEP)}  ${pad("Operation", COL_OP)}  ${pad("Expected", COL_VAL)}  ${pad("Got", COL_VAL)}  Status`,
      ),
    );
    console.log(hr);

    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      const opArgs = args[i] ?? [];
      const argStr = opArgs.length ? JSON.stringify(opArgs).slice(1, -1) : "";
      const opLabel = `${op}(${argStr})`;

      const expVal = i < expected.length ? expected[i] : undefined;
      const gotVal = i < actualOutputs.length ? actualOutputs[i] : undefined;

      const expStr = JSON.stringify(expVal) ?? "null";
      const gotStr = JSON.stringify(gotVal) ?? "null";

      const stepMatch = smartCompare(gotVal, expVal);
      const isConstructor = i === 0;
      const isFail = !isConstructor && !stepMatch;

      const stepLabel = chalk.gray(`#${String(i + 1).padStart(2, "0")}  `);
      const opColor = isConstructor ? chalk.magenta : chalk.white;
      const expColor = chalk.gray;
      const gotColor = isFail ? chalk.red : chalk.green;
      const status = isConstructor
        ? chalk.gray("new")
        : isFail
          ? chalk.red("✗ FAIL")
          : chalk.green("✓");

      console.log(
        `  ${stepLabel}${opColor(pad(opLabel, COL_OP))}  ${expColor(pad(expStr, COL_VAL))}  ${gotColor(pad(gotStr, COL_VAL))}  ${status}`,
      );
    }

    console.log(hr);
    console.log();

    if (!passed && failedIdx !== -1) {
      const { expLine, gotLine, hint } = renderDiff(
        actualOutputs[failedIdx],
        expected[failedIdx],
      );
      console.log(
        chalk.red(`  ✗ Step #${failedIdx + 1}: `) +
        chalk.white(
          `${operations[failedIdx]}(${(args[failedIdx] ?? []).join(", ")})`,
        ),
      );
      console.log(
        `  ${chalk.hex("#cc6e0f")("Expected")}  ${padMultiline(expLine, 12)}`,
      );
      console.log(
        `  ${chalk.hex("#cc6e0f")("Got     ")}  ${padMultiline(gotLine, 12)}`,
      );
      if (hint) console.log(`  ${chalk.red("↳")} ${chalk.gray(hint)}`);
      console.log();
    }
  }

  drawDivider();

  if (passedCount === tests.length) {
    console.log(
      chalk.green.bold(`🎉 All ${passedCount}/${tests.length} tests passed!`),
    );
  } else {
    console.log(
      chalk.red.bold(`❌ Passed ${passedCount}/${tests.length} tests`),
    );
  }

  drawDivider("═");
}

// Re-export variables/functions for general utility import and backward compatibility
export {
  cloneValue,
  formatValue,
  smartCompare,
  compareUnorderedArrays,
  compareUnordered2DArrays,
  compareGroupAnagrams,
  compare3Sum,
};
