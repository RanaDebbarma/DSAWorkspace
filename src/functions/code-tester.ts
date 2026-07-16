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
 * Like formatValue but always returns a printable string (for inline display).
 */
function serializeForDisplay(value: unknown): string {
  if (value === null || value === undefined) return String(value);

  if (value instanceof ListNode)  return linkedListToString(value);
  if (value instanceof TreeNode)  return JSON.stringify(binaryTreeToArray(value));
  if (value instanceof GraphNode) return JSON.stringify(graphToAdjList(value));

  if (typeof value === "string") return `"${value}"`;

  return JSON.stringify(formatValue(value)) ?? String(value);
}

// =============================================================================
// DIFF RENDERING — LeetCode-style inline colored output
// =============================================================================

/**
 * Renders two arrays as inline colored strings.
 * Matching elements are gray, first mismatch is red(got)/green(expected).
 * Returns { expLine, gotLine, hint } where hint is a short text label.
 */
function renderArrayDiff(
  actual: unknown[],
  expected: unknown[],
): { expLine: string; gotLine: string; hint: string } {
  const len = Math.max(actual.length, expected.length);
  const expParts: string[] = [];
  const gotParts: string[] = [];
  let hint = "";

  for (let i = 0; i < len; i++) {
    const a = actual[i];
    const e = expected[i];
    const match = i < actual.length && i < expected.length && smartCompare(a, e);

    if (match) {
      expParts.push(chalk.gray(JSON.stringify(e)));
      gotParts.push(chalk.gray(JSON.stringify(a)));
    } else {
      if (!hint) {
        if (i >= actual.length) {
          hint = `index [${i}]: expected ${JSON.stringify(e)}, got (missing)`;
        } else if (i >= expected.length) {
          hint = `index [${i}]: got extra element ${JSON.stringify(a)}`;
        } else {
          hint = `index [${i}]: expected ${JSON.stringify(e)}, got ${JSON.stringify(a)}`;
        }
      }
      expParts.push(chalk.green.bold(JSON.stringify(e ?? "(missing)")));
      gotParts.push(chalk.red.bold(JSON.stringify(a ?? "(extra)")));
    }
  }

  if (actual.length !== expected.length && !hint) {
    hint = `length mismatch — expected ${expected.length}, got ${actual.length}`;
  }

  return {
    expLine: `[${expParts.join(", ")}]`,
    gotLine: `[${gotParts.join(", ")}]`,
    hint,
  };
}

/**
 * Renders two linked lists as inline colored strings.
 * Matching nodes are gray, first mismatch is red(got)/green(expected).
 */
function renderListDiff(
  actual: ListNode | null,
  expected: ListNode | null,
): { expLine: string; gotLine: string; hint: string } {
  const expParts: string[] = [];
  const gotParts: string[] = [];
  let hint = "";

  let a: ListNode | null = actual;
  let e: ListNode | null = expected;
  let idx = 0;
  const visitedA = new Set<ListNode>();
  const visitedE = new Set<ListNode>();

  while (a || e) {
    if (a && visitedA.has(a)) { expParts.push(chalk.gray("(cycle)")); gotParts.push(chalk.gray("(cycle)")); break; }
    if (e && visitedE.has(e)) { expParts.push(chalk.gray("(cycle)")); gotParts.push(chalk.gray("(cycle)")); break; }
    if (a) visitedA.add(a);
    if (e) visitedE.add(e);

    const match = a && e && a.val === e.val;
    if (match) {
      expParts.push(chalk.gray(String(e!.val)));
      gotParts.push(chalk.gray(String(a!.val)));
    } else {
      if (!hint) {
        if (!a) hint = `node [${idx}]: expected ${e!.val}, got (end of list)`;
        else if (!e) hint = `node [${idx}]: expected (end of list), got ${a.val}`;
        else hint = `node [${idx}]: expected ${e.val}, got ${a.val}`;
      }
      expParts.push(e ? chalk.green.bold(String(e.val)) : chalk.green.bold("(missing)"));
      gotParts.push(a ? chalk.red.bold(String(a.val))   : chalk.red.bold("(extra)"));
    }

    a = a?.next ?? null;
    e = e?.next ?? null;
    idx++;
  }

  const arrow = chalk.gray(" → ");
  return {
    expLine: expParts.join(arrow) + chalk.gray(" → null"),
    gotLine: gotParts.join(arrow) + chalk.gray(" → null"),
    hint,
  };
}

/**
 * Main diff renderer. Returns { expLine, gotLine, hint } for any value pair.
 * Falls back to plain serializeForDisplay when no structured diff is possible.
 */
function renderDiff(
  actual: unknown,
  expected: unknown,
): { expLine: string; gotLine: string; hint: string } {
  // Array diff
  if (Array.isArray(actual) && Array.isArray(expected)) {
    return renderArrayDiff(actual, expected);
  }

  // Linked list diff
  if (actual instanceof ListNode || expected instanceof ListNode) {
    return renderListDiff(
      actual instanceof ListNode ? actual : null,
      expected instanceof ListNode ? expected : null,
    );
  }

  // String: highlight first differing char
  if (typeof actual === "string" && typeof expected === "string") {
    const len = Math.max(actual.length, expected.length);
    let hint = "";
    let expLine = '"';
    let gotLine = '"';
    for (let i = 0; i < len; i++) {
      const ec = expected[i], ac = actual[i];
      if (ec === ac) {
        expLine += chalk.gray(ec ?? "");
        gotLine += chalk.gray(ac ?? "");
      } else {
        if (!hint) hint = `char [${i}]: expected ${ec !== undefined ? `'${ec}'` : "(end)"}, got ${ac !== undefined ? `'${ac}'` : "(end)"}`;
        expLine += ec !== undefined ? chalk.green.bold(ec) : "";
        gotLine += ac !== undefined ? chalk.red.bold(ac)   : "";
      }
    }
    return { expLine: expLine + '"', gotLine: gotLine + '"', hint };
  }

  // Fallback: plain display, no inline diff possible
  return {
    expLine: chalk.green(serializeForDisplay(expected)),
    gotLine: chalk.red(serializeForDisplay(actual)),
    hint: "",
  };
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

  drawDivider();

  for (const [index, test] of tests.entries()) {
    if (index > 0) drawDivider();
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
    const statusBadge = passed ? chalk.bgGreen.black(" PASS ") : chalk.bgRed.white(" FAIL ");
    const timeStr     = chalk.gray(`${(end - start).toFixed(3)} ms`);
    console.log(
      `\n  ${statusBadge}  ${chalk.cyan.bold(`Test ${index + 1}${name ? ` — ${name}` : ""}`)}  ${timeStr}`
    );

    // ── Input block ───────────────────────────────────────────────────────────
    console.log();
    try {
      const paramNames    = getParamNames(fn);
      const formattedInputs = input.map(formatValue);

      if (paramNames.length === input.length) {
        for (let i = 0; i < input.length; i++) {
          const rawVal      = input[i];
          const formattedVal = formattedInputs[i];
          let serialized    = "";

          if (rawVal instanceof ListNode) {
            serialized = String(formattedVal);
          } else if (rawVal instanceof TreeNode || rawVal instanceof GraphNode) {
            serialized = JSON.stringify(formattedVal);
          } else if (typeof rawVal === "string") {
            serialized = `"${rawVal}"`;
          } else if (Array.isArray(rawVal)) {
            serialized = JSON.stringify(formattedVal);
          } else {
            serialized = String(formattedVal);
          }

          console.log(`  ${chalk.cyan(paramNames[i])} ${chalk.gray("=")} ${chalk.white(serialized)}`);
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
      console.log(`  ${chalk.gray("Output  ")}  ${chalk.green(serializeForDisplay(result))}`);
    } else {
      const { expLine, gotLine, hint } = renderDiff(result, output);
      console.log(`  ${chalk.hex("#cc6e0f")("Expected")}  ${expLine}`);
      console.log(`  ${chalk.hex("#cc6e0f")("Got     ")}  ${gotLine}`);
      if (hint) console.log(`  ${chalk.red("↳")} ${chalk.gray(hint)}`);
    }
    console.log();
  }

  drawDivider("═");

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

  drawDivider("═");

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
    const classBadge = passed ? chalk.bgGreen.black(" PASS ") : chalk.bgRed.white(" FAIL ");
    const classTime  = chalk.gray(`${(end - start).toFixed(3)} ms`);
    console.log(
      `\n  ${classBadge}  ${chalk.cyan.bold(`Test ${index + 1}${name ? ` — ${name}` : ""}`)}  ${classTime}`
    );

    // ── Per-step trace table ──────────────────────────────────────────────────
    const COL_STEP = 5;
    const COL_OP   = Math.max(16, ...operations.map((op, i) => {
      const argStr = args[i]?.length ? JSON.stringify(args[i]).slice(1, -1) : "";
      return (`${op}(${argStr})`).length + 2;
    }));
    const COL_VAL  = Math.max(10, ...expected.map(v => (JSON.stringify(v) ?? "null").length + 2));
    const COL_OK   = 7;

    const pad = (s: string, n: number) => s.slice(0, n).padEnd(n);
    const hr  = chalk.gray("─".repeat(COL_STEP + COL_OP + COL_VAL + COL_VAL + COL_OK + 10));

    console.log();
    console.log(
      "  " + chalk.gray(
        `${pad("Step", COL_STEP)}  ${pad("Operation", COL_OP)}  ${pad("Expected", COL_VAL)}  ${pad("Got", COL_VAL)}  Status`
      )
    );
    console.log(hr);

    for (let i = 0; i < operations.length; i++) {
      const op      = operations[i];
      const opArgs  = args[i] ?? [];
      const argStr  = opArgs.length ? JSON.stringify(opArgs).slice(1, -1) : "";
      const opLabel = `${op}(${argStr})`;

      const expVal  = i < expected.length      ? expected[i]      : undefined;
      const gotVal  = i < actualOutputs.length ? actualOutputs[i] : undefined;

      const expStr  = JSON.stringify(expVal) ?? "null";
      const gotStr  = JSON.stringify(gotVal) ?? "null";

      const stepMatch = smartCompare(gotVal, expVal);
      // Constructor row: always null → null, show neutral
      const isConstructor = i === 0;
      const isFail = !isConstructor && !stepMatch;

      const stepLabel = chalk.gray(`#${String(i + 1).padStart(2, "0")}  `);
      const opColor   = isConstructor ? chalk.magenta : chalk.white;
      const expColor  = chalk.gray;
      const gotColor  = isFail ? chalk.red : chalk.green;
      const status    = isConstructor
        ? chalk.gray("new")
        : isFail
          ? chalk.red("✗ FAIL")
          : chalk.green("✓");

      console.log(
        `  ${stepLabel}${opColor(pad(opLabel, COL_OP))}  ${expColor(pad(expStr, COL_VAL))}  ${gotColor(pad(gotStr, COL_VAL))}  ${status}`
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
        chalk.white(`${operations[failedIdx]}(${(args[failedIdx] ?? []).join(", ")})`)
      );
      console.log(`  ${chalk.hex("#cc6e0f")("Expected")}  ${expLine}`);
      console.log(`  ${chalk.hex("#cc6e0f")("Got     ")}  ${gotLine}`);
      if (hint) console.log(`  ${chalk.red("↳")} ${chalk.gray(hint)}`);
      console.log();
    }

    if (passed && showOutput) {
      console.log(chalk.gray("Outputs:"));
      console.dir(formatValue(actualOutputs), { depth: null });
    }
  }

  drawDivider("═");

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

function drawDivider(char = "─", colorFn = chalk.gray) {
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
