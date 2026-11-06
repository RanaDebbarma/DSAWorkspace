import chalk from "chalk";
import { performance } from "node:perf_hooks";
import { ListNode, Node } from "#ds/linked-list.js";
import { TreeNode } from "#ds/tree.js";
import { GraphNode } from "#ds/graph.js";
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
  indentAll,
  treeToString,
  matrixToString,
  graphToString,
  edgeListGraphToString,
  edgeListStringGraphToString,
  isEdgeListParam,
  isStringEdgeList,
  containsTreeNode,
  TreeHighlightMap,
  GridMode,
  GridMapping,
  detectGridMode,
  captureLines,
  padEndVisible,
  stripAnsi,
} from "#utils/display.js";
import { renderDiff } from "#utils/diff.js";
import {
  captureConsoleOutput,
  printConsoleOutput,
} from "#utils/console-capture.js";
import { runCompare } from "#functions/run-compare.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ExpectedOutput<T> =
  [T] extends [TreeNode | null] ? T | number :
  [T] extends [ListNode | null] ? T | number :
  T;

export type TestCase<F extends (...args: any[]) => any> = {
  name?: string;
  input: Parameters<F>;
  output: ExpectedOutput<ReturnType<F>>;
  compare?: (
    actual: ReturnType<F>,
    expected: any,
    actualInput: Parameters<F>,
  ) => boolean;
  cloneInput?: (input: Parameters<F>) => Parameters<F>;
  /** When true, treats array output order as insensitive for this test case. */
  unordered?: boolean;
  /** When provided, the test passes if the actual output matches ANY of these values (via smartCompare).
   * `output` is also treated as a valid answer and is used for display.
   * Ignored when a custom `compare` function is set. */
  anyOf?: ExpectedOutput<ReturnType<F>>[];
  /** Explicitly set graph direction for this test case (true for directed, false for undirected). */
  isDirected?: boolean;
  /** When true, reverses the edge direction in the graph visualization (swaps u↔v). */
  reverseEdges?: boolean;
  /** Explicitly set grid visualization mode ('auto' | 'board' | 'maze' | 'binary' | 'sudoku' | 'numeric' | 'none'). */
  gridMode?: GridMode;
  /** Custom mapping for matrix grid cell representation and color-coding. */
  gridMapping?: GridMapping;
  /** When false, disables visual table/structure rendering for expected output and diff for this test case. Defaults to true. */
  visualizeOutput?: boolean;
  /** When false, hides the inline string representation of inputs for this test case. Defaults to the suite-level value. */
  showStringInput?: boolean;
};

export type ClassTestCase = {
  name?: string;
  operations: string[];
  args: any[][];
  expected: any[];
};

export type FnLabelMode = "both" | "number" | "name";

/** Base options common to all test runners. */
export type BaseTestOptions<F extends (...args: any[]) => any = any> = {
  /** Controls whether the top header banner is displayed. Defaults to true. */
  showHeader?: boolean;
  /** When true, treats array output order as insensitive across all test cases. Defaults to false. */
  unordered?: boolean;
  /** Suite-level custom comparator. Overridden by per-test case `compare`. */
  compare?: (
    actual: ReturnType<F>,
    expected: any,
    actualInput: Parameters<F>,
  ) => boolean;
};

/** Options for standard single-function test runner (`runTests`). */
export type TestOptions<F extends (...args: any[]) => any = any> = BaseTestOptions<F> & {
  /** When false, disables rich visual diagrams (trees, 2D grids, graphs) before test execution. Defaults to true. */
  visualizeInput?: boolean;
  /** When false, disables visual table/structure rendering for expected output and diff. Defaults to true. */
  visualizeOutput?: boolean;
  /** When false, suppresses the plain `param = value` lines printed below visual input blocks. Defaults to true. */
  showStringInput?: boolean;
  /** Controls whether the index failure hint (↳ index [i]: expected X, got Y) is displayed on failure. Defaults to true. */
  showHint?: boolean;
  /** Suite-level default for graph direction (true for directed, false for undirected). Overridden by per-test case `isDirected`. */
  isDirected?: boolean;
  /** Suite-level default to reverse edge direction in graph visualizations (swaps u↔v). Overridden by per-test case `reverseEdges`. */
  reverseEdges?: boolean;
  /** Suite-level default for grid visualization mode ('auto' | 'board' | 'maze' | 'binary' | 'sudoku' | 'numeric' | 'none'). Overridden by per-test case `gridMode`. */
  gridMode?: GridMode;
  /** Custom mapping for matrix grid cell representation and color-coding. */
  gridMapping?: GridMapping;
};

/** Alias for `TestOptions`. */
export type RunTestOptions<F extends (...args: any[]) => any = any> = TestOptions<F>;

/** Format of relative speed comparison in runCompare. */
export type CompareFormat = "multiplier" | "percent" | "none" | false;

/** Mode of relative speed comparison in runCompare. */
export type CompareMode = "faster" | "slower" | "baseline";

/** @deprecated Use CompareMode instead. */
export type CompareAnchor = CompareMode | "fastest" | "slowest";

/** Options for multi-implementation runtime comparison (`runCompare`). */
export type CompareOptions<F extends (...args: any[]) => any = any> = BaseTestOptions<F> & {
  /** When false, omits inline input values in test headers. Defaults to true. */
  showStringInput?: boolean;
  /** In runCompare, controls how functions are labeled in the summary table and test rows:
   * - "number" (default): displays only badge number (e.g. `[1]`), ideal for small width terminals
   * - "both": displays badge number and function name (e.g. `[1]  myFn`)
   * - "name": displays only function name (e.g. `myFn`)
   */
  fnLabel?: FnLabelMode;
  /** Alias for `fnLabel`. */
  fnDisplay?: FnLabelMode;
  /** When false, omits function names in summary table (alias for fnLabel: "number"). Defaults to true. */
  showFnName?: boolean;
  /** When false, omits function badge numbers (alias for fnLabel: "name"). Defaults to true. */
  showFnNumber?: boolean;
  /** When true, suppresses per-test outputs and displays only the summary table. Defaults to true. */
  summaryOnly?: boolean;
  /** When false, suppresses per-test outputs (alias for summaryOnly: true). Defaults to true. */
  showTests?: boolean;
  /** When false, removes │ column separators from the summary table. Defaults to true. */
  tableBorders?: boolean;
  /** When true, renders rich visualizations (trees, grids, graphs) above timing rows for each test. Defaults to false. */
  visualizeInput?: boolean;
  /** Suite-level default for graph direction (true for directed, false for undirected). */
  isDirected?: boolean;
  /** Suite-level default to reverse edge direction in graph visualizations. */
  reverseEdges?: boolean;
  /** Suite-level default for grid visualization mode. */
  gridMode?: GridMode;
  /** Custom mapping for matrix grid cell representation and color-coding. */
  gridMapping?: GridMapping;
  /**
   * Display format for relative speed comparison:
   * - "multiplier" (default): e.g. `1.00×`, `32.58×`
   * - "percent": e.g. `—`, `+3158%`
   * - "none" | false: disables comparison column
   */
  compareFormat?: CompareFormat;
  /**
   * Relative speed comparison mode / heading:
   * - "faster" (default): header "Faster", compares vs slowest (shows how much faster / speedup)
   * - "slower": header "Slower", compares vs fastest (shows how much slower)
   * - "baseline": header "vs [1]", compares vs first function [1]
   */
  compareMode?: CompareMode;
  /** Alias for `compareMode`. */
  compareAnchor?: CompareMode | "fastest" | "slowest";
  /** Alias: when false, disables relative speed comparison (sets compareFormat: "none"). Defaults to true. */
  showPercent?: boolean;
  /**
   * When false, hides the `◀` fastest-function badge in per-test rows and
   * the summary table. Defaults to true.
   */
  showFastest?: boolean;
};

/** Alias for `CompareOptions`. */
export type RunCompareOptions<F extends (...args: any[]) => any = any> = CompareOptions<F>;

/** Options for interactive class / OOP test runner (`runClassTests`). */
export type ClassTestOptions = {
  /** Controls whether the top header banner is displayed. Defaults to true. */
  showHeader?: boolean;
  /** When true, treats array output order as insensitive across all operations. Defaults to false. */
  unordered?: boolean;
  /** Controls whether the index failure hint (↳ index [i]: expected X, got Y) is displayed on failure. Defaults to true. */
  showHint?: boolean;
};

// ── Internal Helpers ──────────────────────────────────────────────────────────

const DIRECTED_PARAM_REGEX = /directed|prereq|flight|dag|order|dependency|dependencies|topo/i;

function resolveIsDirected(
  paramName: string,
  testIsDirected?: boolean,
  suiteIsDirected?: boolean,
  fnName?: string,
): boolean {
  if (typeof testIsDirected === "boolean") {
    return testIsDirected;
  }
  if (typeof suiteIsDirected === "boolean") {
    return suiteIsDirected;
  }
  if (DIRECTED_PARAM_REGEX.test(paramName) || (fnName && DIRECTED_PARAM_REGEX.test(fnName))) {
    return true;
  }
  return false;
}

/**
 * Renders the visual and text input block for a single test case.
 * Handles tree subnode highlights, 2D grids, edge lists, and GraphNodes.
 */
export function renderInputBlock(
  fn: (...args: any[]) => any,
  input: any[],
  visualizeInput: boolean,
  showStringInput: boolean,
  testIsDirected?: boolean,
  suiteIsDirected?: boolean,
  testReverseEdges?: boolean,
  suiteReverseEdges?: boolean,
  testGridMode?: GridMode,
  suiteGridMode?: GridMode,
  testGridMapping?: GridMapping,
  suiteGridMapping?: GridMapping,
): void {
  const paramNames = getParamNames(fn);
  const formattedInputs = input.map(formatValue);

  if (paramNames.length !== input.length) {
    console.dir(formattedInputs, { depth: null });
    return;
  }

  for (let i = 0; i < input.length; i++) {
    const rawVal = input[i];
    const formattedVal = formattedInputs[i];
    const pName = paramNames[i] || `param${i + 1}`;
    const resolvedDirected = resolveIsDirected(pName, testIsDirected, suiteIsDirected, fn.name);

    if (visualizeInput) {
      // Tree visualizer — detect subnodes on first param pass
      if (i === 0) {
        const treeParams: { idx: number; name: string; node: TreeNode }[] = [];
        for (let j = 0; j < input.length; j++) {
          if (input[j] instanceof TreeNode) {
            treeParams.push({ idx: j, name: paramNames[j] || `param${j + 1}`, node: input[j] });
          }
        }

        if (treeParams.length > 0) {
          const primaryTree = treeParams[0];
          const subnodeHighlights: TreeHighlightMap = new Map();
          const colors = [chalk.green, chalk.yellow, chalk.magenta];

          for (let j = 1; j < treeParams.length; j++) {
            const tp = treeParams[j];
            if (containsTreeNode(primaryTree.node, tp.node)) {
              subnodeHighlights.set(tp.node, {
                label: tp.name,
                color: colors[(j - 1) % colors.length],
              });
            }
          }

          if (subnodeHighlights.size > 0) {
            console.log(chalk.gray(`${primaryTree.name}:`));
            console.log(indentAll(treeToString(primaryTree.node, true, subnodeHighlights), 2));
            console.log();
          } else {
            for (const tp of treeParams) {
              console.log(chalk.gray(`${tp.name}:`));
              console.log(indentAll(treeToString(tp.node, true), 2));
              console.log();
            }
          }
        }
      }

      // 2D matrix / edge list visualizer
      if (Array.isArray(rawVal) && rawVal.length > 0 && Array.isArray(rawVal[0])) {
        if (isEdgeListParam(pName, rawVal)) {
          const resolvedReverse = testReverseEdges ?? suiteReverseEdges ?? false;
          if (isStringEdgeList(rawVal)) {
            console.log(edgeListStringGraphToString(rawVal, pName, resolvedDirected));
          } else {
            console.log(edgeListGraphToString(rawVal, pName, undefined, resolvedDirected, resolvedReverse));
          }
          console.log();
        } else {
          const resolvedGridMode = testGridMode ?? suiteGridMode ?? "auto";
          const effectiveMode = resolvedGridMode === "auto" ? detectGridMode(rawVal) : resolvedGridMode;
          const effectiveGridMapping = testGridMapping ?? suiteGridMapping;
          const modeColor =
            effectiveMode === "board" ? chalk.hex("#ffeaa7") :
            effectiveMode === "maze" ? chalk.hex("#00cec9") :
            effectiveMode === "binary" ? chalk.hex("#55efc4") :
            effectiveMode === "sudoku" ? chalk.hex("#fdcb6e") :
            effectiveMode === "chess" ? chalk.hex("#f1c40f") :
            chalk.cyan;

          const modeLabel = resolvedGridMode === "auto"
            ? `${chalk.gray("auto: ")}${modeColor(effectiveMode)}`
            : `${chalk.gray("mode: ")}${modeColor(resolvedGridMode)}`;

          console.log(`${chalk.gray(`${pName} (${rawVal.length}x${rawVal[0].length} · `)}${modeLabel}${chalk.gray("):")}`);
          console.log(indentAll(matrixToString(rawVal, { mode: resolvedGridMode, gridMapping: effectiveGridMapping }), 2));
          console.log();
        }
      } else if (rawVal instanceof GraphNode) {
        console.log(graphToString(rawVal, pName, resolvedDirected));
        console.log();
      }
    }

    // Plain param = value line
    if (showStringInput) {
      let serialized = "";
      if (rawVal instanceof ListNode) {
        serialized = String(formattedVal);
      } else if (rawVal instanceof TreeNode || rawVal instanceof GraphNode || rawVal instanceof Node) {
        serialized = JSON.stringify(formattedVal);
      } else if (typeof rawVal === "string") {
        serialized = `"${rawVal}"`;
      } else if (visualizeInput && Array.isArray(rawVal) && (isStringEdgeList(rawVal) || isEdgeListParam(paramNames[i] || "", rawVal))) {
        // Already visualized above — skip the redundant JSON dump
        continue;
      } else if (Array.isArray(rawVal)) {
        serialized = JSON.stringify(formattedVal);
      } else {
        serialized = String(formattedVal);
      }
      console.log(`${chalk.cyan(paramNames[i])} ${chalk.gray("=")} ${chalk.white(serialized)}`);
    }
  }
}

/**
 * Renders the result block (Expected / Got / diff or Output) for a single test case.
 */
function renderResultBlock(
  passed: boolean,
  result: any,
  output: any,
  executionError: unknown,
  showHint: boolean = true,
  actualInput?: any[],
  visualizeOutput: boolean = true,
  gridMode?: GridMode,
  gridMapping?: GridMapping,
  anyOf?: any[],
): void {
  const displayOpts = { actualInput, visualizeOutput, gridMode, gridMapping };

  if (executionError) {
    const error =
      executionError instanceof Error
        ? `${executionError.name}: ${executionError.message}`
        : String(executionError);
    const expStr = serializeForDisplay(output, displayOpts);
    console.log(chalk.green("- Expected:"));
    console.log(indentAll(chalk.green(expStr), 2));
    console.log(chalk.red("+ Received:"));
    console.log(indentAll(chalk.red(`Runtime Error: ${error}`), 2));
  } else if (passed) {
    const outStr = serializeForDisplay(result, displayOpts);
    const coloredOut = outStr.includes("\u001b") ? outStr : chalk.green(outStr);
    const visLen = stripAnsi(outStr).length;
    if (outStr.includes("\n") || visLen > 30) {
      console.log(chalk.gray("Output:"));
      console.log(indentAll(coloredOut, 2));
    } else {
      console.log(`${chalk.gray("Output:")} ${coloredOut}`);
    }
  } else {
    if (anyOf && anyOf.length > 0) {
      // Display all valid alternatives as: - Expected (any of):  "bab" | "aba"
      const allValid = [output, ...anyOf];
      const anyOfStr = allValid
        .map((v) => serializeForDisplay(v, displayOpts))
        .join(chalk.gray(" | "));
      const gotStr = serializeForDisplay(result, displayOpts);
      const isMulti = anyOfStr.includes("\n") || gotStr.includes("\n") || stripAnsi(anyOfStr).length > 25;
      if (isMulti) {
        console.log(chalk.green("- Expected (any of):"));
        console.log(indentAll(anyOfStr, 2));
        console.log(chalk.red("+ Received:"));
        console.log(indentAll(chalk.red(gotStr), 2));
      } else {
        console.log(`${chalk.green("- Expected (any of):")} ${anyOfStr}`);
        console.log(`${chalk.red("+ Received:")} ${chalk.red(gotStr)}`);
      }
    } else {
      const { expLine, gotLine, hint } = renderDiff(result, output, displayOpts);
      const isMulti = expLine.includes("\n") || gotLine.includes("\n") || stripAnsi(expLine).length > 25 || stripAnsi(gotLine).length > 25;
      if (isMulti) {
        console.log(chalk.green("- Expected:"));
        console.log(indentAll(expLine, 2));
        console.log(chalk.red("+ Received:"));
        console.log(indentAll(gotLine, 2));
      } else {
        console.log(`${chalk.green("- Expected:")} ${expLine}`);
        console.log(`${chalk.red("+ Received:")} ${gotLine}`);
      }
      if (showHint && hint) {
        console.log(`  ${chalk.yellow("↳")} ${chalk.gray(hint)}`);
      }
    }
  }
}

function formatCompactArg(val: any, maxLen = 14): string {
  if (val === undefined) return "undefined";
  if (val === null) return "null";
  if (typeof val === "string") {
    const s = JSON.stringify(val);
    return s.length > maxLen ? `${s.slice(0, maxLen - 1)}…"` : s;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    if (val.length > 3) return `[${val.length} items]`;
    const inner = val.map((item) => (typeof item === "object" && item !== null ? "{…}" : JSON.stringify(item))).join(", ");
    const full = `[${inner}]`;
    return full.length > maxLen ? `[${val.length} items]` : full;
  }
  if (typeof val === "object") {
    return "{…}";
  }
  return String(val);
}

function formatArgList(args: any[], maxTotalLen = 20): string {
  if (!args || args.length === 0) return "";
  const parts = args.map((a) => formatCompactArg(a, 10));
  const joined = parts.join(", ");
  if (joined.length <= maxTotalLen) return joined;
  return joined.slice(0, maxTotalLen - 1) + "…";
}

function formatFullArgs(args: any[]): string {
  if (!args || args.length === 0) return "";
  return args
    .map((a) => {
      if (Array.isArray(a)) {
        if (a.length <= 8) return `[${a.map((v) => JSON.stringify(v)).join(", ")}]`;
        const preview = a.slice(0, 6).map((v) => JSON.stringify(v)).join(", ");
        return `[${preview}, ... +${a.length - 6} more]`;
      }
      return JSON.stringify(a);
    })
    .join(", ");
}

/**
 * Renders the per-step trace table for a class design test case.
 */
function renderStepTable(
  operations: string[],
  args: any[][],
  expected: any[],
  actualOutputs: any[],
): void {
  const ctorArgs = args[0] ?? [];
  const ctorArgStr = formatFullArgs(ctorArgs);
  const isCtorComplex = ctorArgs.some((a) => Array.isArray(a) || typeof a === "object") || ctorArgStr.length > 12;

  if (isCtorComplex) {
    console.log();
    console.log(`  ${chalk.gray("Instance:")}  ${chalk.magenta(`new ${operations[0]}(${ctorArgStr})`)}`);
  }

  const termWidth = process.stdout.columns || 80;
  const COL_STEP = 5;

  // Build method labels first (full args, no truncation) to size the column
  const methodOpLabels = operations.map((op, i) => {
    if (i === 0) return "";
    return `${op}(${formatFullArgs(args[i] ?? [])})`;
  });

  // COL_OP driven purely by method call labels (no cap) so they always show fully
  const COL_OP = Math.max(14, ...methodOpLabels.slice(1).map((l) => l.length + 2));

  // Build rawOpLabels: methods show fully; constructor shows full if it fits, else abbreviated
  const ctorFullLabel = `${operations[0]}(${formatFullArgs(args[0] ?? [])})`;
  const rawOpLabels = operations.map((op, i) => {
    if (i === 0) {
      if (!isCtorComplex || ctorFullLabel.length + 2 <= COL_OP) return ctorFullLabel;
      return `${op}(…)`;
    }
    return `${op}(${formatFullArgs(args[i] ?? [])})`;
  });

  // Dynamically expand COL_VAL on wider terminals instead of fixed 12 cap
  const availableForVal = Math.floor((termWidth - COL_STEP - COL_OP - 22) / 2);
  const MAX_COL_VAL = Math.max(12, Math.min(availableForVal, 50));
  const COL_VAL = Math.min(
    MAX_COL_VAL,
    Math.max(8, ...expected.map((v) => (JSON.stringify(v) ?? "null").length + 2)),
  );

  const pad = (s: string, n: number) => {
    if (s.length > n) return s.slice(0, n - 1) + "…";
    return s.padEnd(n);
  };

  const borderColor = chalk.hex("#5d5d5d");
  const COL_STATUS = 8;
  const wStep = COL_STEP + 2;
  const wOp = COL_OP + 2;
  const wExp = COL_VAL + 2;
  const wGot = COL_VAL + 2;
  const wStatus = COL_STATUS + 2;

  const topBorder = borderColor("┌" + "─".repeat(wStep) + "┬" + "─".repeat(wOp) + "┬" + "─".repeat(wExp) + "┬" + "─".repeat(wGot) + "┬" + "─".repeat(wStatus) + "┐");
  const midBorder = borderColor("├" + "─".repeat(wStep) + "┼" + "─".repeat(wOp) + "┼" + "─".repeat(wExp) + "┼" + "─".repeat(wGot) + "┼" + "─".repeat(wStatus) + "┤");
  const botBorder = borderColor("└" + "─".repeat(wStep) + "┴" + "─".repeat(wOp) + "┴" + "─".repeat(wExp) + "┴" + "─".repeat(wGot) + "┴" + "─".repeat(wStatus) + "┘");

  console.log();
  console.log(topBorder);
  console.log(
    borderColor("│ ") +
    chalk.gray(padEndVisible("Step", COL_STEP)) + borderColor(" │ ") +
    chalk.gray(padEndVisible("Operation", COL_OP)) + borderColor(" │ ") +
    chalk.gray(padEndVisible("Expected", COL_VAL)) + borderColor(" │ ") +
    chalk.gray(padEndVisible("Got", COL_VAL)) + borderColor(" │ ") +
    chalk.gray(padEndVisible("Status", COL_STATUS)) + borderColor(" │")
  );
  console.log(midBorder);

  for (let i = 0; i < operations.length; i++) {
    const opLabel = rawOpLabels[i];

    const expVal = i < expected.length ? expected[i] : undefined;
    const gotVal = i < actualOutputs.length ? actualOutputs[i] : undefined;

    const expStr = JSON.stringify(expVal) ?? "null";
    const gotStr = JSON.stringify(gotVal) ?? "null";

    const isConstructor = i === 0;
    const stepMatch = smartCompare(gotVal, expVal);
    const isFail = !isConstructor && !stepMatch;

    const stepLabel = chalk.gray(`#${String(i + 1).padStart(2, "0")}`);
    const opColor = isConstructor ? chalk.magenta : chalk.white;
    const expColor = chalk.gray;
    const gotColor = isFail ? chalk.red : chalk.green;
    const status = isConstructor
      ? chalk.gray("new")
      : isFail
        ? chalk.red("✗ FAIL")
        : chalk.green("✓");

    console.log(
      borderColor("│ ") +
      padEndVisible(stepLabel, COL_STEP) + borderColor(" │ ") +
      opColor(padEndVisible(pad(opLabel, COL_OP), COL_OP)) + borderColor(" │ ") +
      expColor(padEndVisible(pad(expStr, COL_VAL), COL_VAL)) + borderColor(" │ ") +
      gotColor(padEndVisible(pad(gotStr, COL_VAL), COL_VAL)) + borderColor(" │ ") +
      padEndVisible(status, COL_STATUS) + borderColor(" │")
    );
  }

  console.log(botBorder);
}

// ── Column layout ─────────────────────────────────────────────────────────────

export type RenderedTestBlock = {
  passed: boolean;
  testIndex: number;
  name?: string;
  timeStr: string;
  timeMs: number;
  body: string[];
  naturalWidth: number;
};

const GAP_X = "   "; // 3 spaces between cards (visually balances the 1-line vertical gap)
const GAP_X_LEN = 3;

/**
 * Prints test blocks as individual cards (┌─┐, ├─┤, └─┘) with a clean gap between them.
 * Tests are greedily packed into rows as columns based on their measured width.
 * Shorter cells in the same row are vertically padded to match the tallest cell.
 * Returns the maximum row width, which is used to size outer dividers dynamically.
 */
function printCardBlockColumns(blocks: RenderedTestBlock[]): number {
  if (blocks.length === 0) return 0;
  const termWidth = process.stdout.columns || 80;
  const borderColor = chalk.hex("#5d5d5d");

  // Greedy row packing:
  // Each card takes `w + 4` characters (┌ + w+2 + ┐)
  // Plus (N - 1) * GAP_X_LEN spaces between cards
  const rows: { blocks: RenderedTestBlock[]; colWidths: number[]; rowWidth: number }[] = [];
  let currentRow: RenderedTestBlock[] = [];
  let currentWidths: number[] = [];

  for (const b of blocks) {
    const w = b.naturalWidth;
    const nextCols = currentRow.length + 1;
    const nextTotalWidth =
      [...currentWidths, w].reduce((acc, val) => acc + val + 4, 0) +
      (nextCols - 1) * GAP_X_LEN;

    if (currentRow.length === 0 || nextTotalWidth <= termWidth) {
      currentRow.push(b);
      currentWidths.push(w);
    } else {
      const rowWidth =
        currentWidths.reduce((acc, val) => acc + val + 4, 0) +
        (currentRow.length - 1) * GAP_X_LEN;
      rows.push({ blocks: currentRow, colWidths: currentWidths, rowWidth });
      currentRow = [b];
      currentWidths = [w];
    }
  }
  if (currentRow.length > 0) {
    const rowWidth =
      currentWidths.reduce((acc, val) => acc + val + 4, 0) +
      (currentRow.length - 1) * GAP_X_LEN;
    rows.push({ blocks: currentRow, colWidths: currentWidths, rowWidth });
  }

  // Maximum width across all rows (used to size outer HRs dynamically)
  const maxSuiteWidth = Math.min(termWidth, Math.max(45, ...rows.map((r) => r.rowWidth)));

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const { blocks: rBlocks, colWidths } = rows[rIdx];

    // 1. Top borders
    const topBorder = rBlocks
      .map((_, i) => borderColor("┌" + "─".repeat(colWidths[i] + 2) + "┐"))
      .join(GAP_X);
    console.log(topBorder);

    // 2. Badge + timing line (always line 1 of every card)
    const divider = rBlocks
      .map((_, i) => borderColor("├" + "─".repeat(colWidths[i] + 2) + "┤"))
      .join(GAP_X);

    const badgeTimingLine = rBlocks.map((b, i) => {
      const w = colWidths[i];
      const badge = b.passed ? chalk.bold.bgGreen.black(" PASS ") : chalk.bold.bgRed.white(" FAIL ");
      const indexLabel = chalk.cyan.bold(`Test ${b.testIndex}`);
      const right = b.timeStr;
      const leftPart = `${badge}  ${indexLabel}`;
      const leftLen = stripAnsi(leftPart).length;
      const rightLen = stripAnsi(right).length;
      const space = w - leftLen - rightLen;
      const inner = space >= 1
        ? leftPart + " ".repeat(space) + right
        : padEndVisible(leftPart + "  " + right, w);
      return borderColor("│ ") + inner + borderColor(" │");
    });
    console.log(badgeTimingLine.join(GAP_X));

    // 3. Name row (optional — only printed if any card in the row has a name)
    const rowHasName = rBlocks.some((b) => b.name);
    if (rowHasName) {
      console.log(divider);
      const nameLineCells = rBlocks.map((b, i) => {
        const w = colWidths[i];
        if (!b.name) return borderColor("│ ") + " ".repeat(w) + borderColor(" │");
        // Truncate with "…" if the name exceeds the box width
        const maxNameLen = w;
        const displayName = b.name.length <= maxNameLen ? b.name : b.name.slice(0, maxNameLen - 1) + "…";
        const nameStr = chalk.cyan(displayName);
        return borderColor("│ ") + padEndVisible(nameStr, w) + borderColor(" │");
      });
      console.log(nameLineCells.join(GAP_X));
    }

    // 4. Body separator (between header section and body)
    console.log(divider);

    // 5. Body rows
    const maxBodyHeight = Math.max(1, ...rBlocks.map((b) => b.body.length));
    for (let lineIdx = 0; lineIdx < maxBodyHeight; lineIdx++) {
      const lineCells = rBlocks.map((b, i) => {
        const line = b.body[lineIdx] ?? "";
        return borderColor("│ ") + padEndVisible(line, colWidths[i]) + borderColor(" │");
      });
      console.log(lineCells.join(GAP_X));
    }

    // 5. Bottom border
    const botBorder = rBlocks
      .map((_, i) => borderColor("└" + "─".repeat(colWidths[i] + 2) + "┘"))
      .join(GAP_X);
    console.log(botBorder);

    if (rIdx < rows.length - 1) {
      console.log();
    }
  }

  return maxSuiteWidth;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Runs test cases for a standard function and prints a formatted result report.
 */
export function runTests<F extends (...args: any[]) => any>(fn: F, tests: TestCase<F>[], options?: boolean | TestOptions<F>): void;
/**
 * Runs multiple function implementations against the same test suite individually.
 * Equivalent to calling `runTests(fn, tests, options)` for each function in sequence.
 */
export function runTests<F extends (...args: any[]) => any>(fns: F[], tests: TestCase<F>[], options?: boolean | TestOptions<F>): void;
export function runTests<F extends (...args: any[]) => any>(
  fn: F | F[],
  tests: TestCase<F>[],
  options: boolean | TestOptions<F> = true,
) {
  if (Array.isArray(fn)) {
    for (const f of fn) {
      runTests(f, tests, options);
    }
    return;
  }
  if (tests.length === 0) {
    console.log(chalk.yellow("⚠ No test cases provided."));
    return;
  }

  const showHeader = typeof options === "boolean" ? true : (options?.showHeader ?? true);
  const visualizeInput = typeof options === "boolean" ? true : (options?.visualizeInput ?? true);
  const visualizeOutput = typeof options === "boolean" ? true : (options?.visualizeOutput ?? true);
  const showStringInput = typeof options === "boolean" ? true : (options?.showStringInput ?? true);
  const suiteUnordered = typeof options === "object" ? (options?.unordered ?? false) : false;
  const suiteCompare = typeof options === "object" ? options?.compare : undefined;
  const showHint = typeof options === "boolean" ? true : (options?.showHint ?? true);
  const suiteIsDirected = typeof options === "object" ? options?.isDirected : undefined;
  const suiteReverseEdges = typeof options === "object" ? options?.reverseEdges : undefined;
  const suiteGridMode = typeof options === "object" ? options?.gridMode : undefined;
  const suiteGridMapping = typeof options === "object" ? options?.gridMapping : undefined;

  let passedCount = 0;
  const allBlocks: RenderedTestBlock[] = [];

  for (const [index, test] of tests.entries()) {
    const { name, input, output, compare, cloneInput, unordered, anyOf } = test;

    const actualInput = cloneInput
      ? cloneInput(input)
      : (cloneValue(input) as Parameters<F>);

    const start = performance.now();
    const execution = captureConsoleOutput(() => fn(...actualInput));
    const end = performance.now();
    const result = execution.value as ReturnType<F>;

    const isUnordered = unordered ?? suiteUnordered;
    const effectiveCompare = compare ?? suiteCompare;

    const passed = execution.error
      ? false
      : effectiveCompare
        ? effectiveCompare(result, output, actualInput)
        : anyOf
          ? // output is also a valid answer; anyOf lists additional valid alternatives
            [output, ...anyOf].some((alt) =>
              smartCompare(result, alt, actualInput, { unordered: isUnordered, fnName: fn.name }),
            )
          : smartCompare(result, output, actualInput, {
              unordered: isUnordered,
              fnName: fn.name,
            });

    if (passed) passedCount++;

    const timeMs = end - start;
    const timeStr = chalk.gray(`${timeMs.toFixed(3)} ms`);
    const effectiveShowStringInput = test.showStringInput ?? showStringInput;
    const shouldVisualizeOutput = test.visualizeOutput ?? visualizeOutput;
    const effectiveGridMode = test.gridMode ?? suiteGridMode;
    const effectiveGridMapping = test.gridMapping ?? suiteGridMapping;

    const body = captureLines(() => {
      try {
        renderInputBlock(
          fn,
          Array.from(input),
          visualizeInput,
          effectiveShowStringInput,
          test.isDirected,
          suiteIsDirected,
          test.reverseEdges,
          suiteReverseEdges,
          test.gridMode,
          suiteGridMode,
          test.gridMapping,
          suiteGridMapping,
        );
      } catch {
        console.log(JSON.stringify(input.map(formatValue)));
      }
      effectiveShowStringInput && console.log();

      printConsoleOutput(execution.logs);
      renderResultBlock(
        passed,
        result,
        output,
        execution.error,
        showHint,
        actualInput,
        shouldVisualizeOutput,
        effectiveGridMode,
        effectiveGridMapping,
        anyOf,
      );
    });

    // Trim leading and trailing empty lines from body
    while (body.length > 0 && body[0].trim() === "") body.shift();
    while (body.length > 0 && body[body.length - 1].trim() === "") body.pop();

    const maxLineLen = body.reduce((max, l) => Math.max(max, stripAnsi(l).length), 0);
    // Box width is driven by body content only — the name wraps inside the header if needed
    const naturalWidth = Math.max(26, maxLineLen);

    allBlocks.push({
      passed,
      testIndex: index + 1,
      name,
      timeStr,
      timeMs,
      body,
      naturalWidth,
    });
  }

  // Pre-calculate suite width to dynamically size top header and bottom summary banner
  const termWidth = process.stdout.columns || 80;
  const totalTime = allBlocks.reduce((sum, b) => sum + b.timeMs, 0);
  const avgTime = tests.length > 0 ? totalTime / tests.length : 0;

  const isAllPassed = passedCount === tests.length;
  const statusIcon = isAllPassed ? chalk.green.bold("✔") : chalk.red.bold("✖");
  const countMsg = isAllPassed
    ? `${chalk.gray("passed:")} ${chalk.green.bold(`${passedCount}/${tests.length}`)}`
    : `${chalk.gray("passed:")} ${chalk.red.bold(`${passedCount}/${tests.length} (${tests.length - passedCount} failed)`)}`;
  const timeMsg = `${chalk.gray("·  avg:")} ${chalk.white(`${avgTime.toFixed(3)} ms`)}  ${chalk.gray("·  total:")} ${chalk.white(`${totalTime.toFixed(3)} ms`)}`;
  const fullSummaryLine = `  ${statusIcon}  ${countMsg}  ${timeMsg}`;
  const fullSummaryWidth = stripAnsi(fullSummaryLine).length;

  let testSuiteWidth = 45;
  {
    let currentCols = 0;
    let currentW = 0;
    for (const b of allBlocks) {
      const nextCols = currentCols + 1;
      const nextTotal = currentW + b.naturalWidth + 4 + (nextCols - 1) * GAP_X_LEN;
      if (currentCols === 0 || nextTotal <= termWidth) {
        currentCols = nextCols;
        currentW += b.naturalWidth + 4;
      } else {
        const rowW = currentW + (currentCols - 1) * GAP_X_LEN;
        testSuiteWidth = Math.max(testSuiteWidth, rowW);
        currentCols = 1;
        currentW = b.naturalWidth + 4;
      }
    }
    if (currentCols > 0) {
      const rowW = currentW + (currentCols - 1) * GAP_X_LEN;
      testSuiteWidth = Math.max(testSuiteWidth, rowW);
    }
    if (fullSummaryWidth <= termWidth) {
      testSuiteWidth = Math.max(testSuiteWidth, fullSummaryWidth);
    }
    testSuiteWidth = Math.min(termWidth, testSuiteWidth);
  }

  // Top header banner (dynamic width matching the suite)
  if (showHeader) {
    drawDivider("═", testSuiteWidth);
    console.log(`${chalk.bold.bgMagenta.black(" RUNS ")}  ${chalk.magenta.bold(`${fn.name || "solve"}()`)}`);
    drawDivider("─", testSuiteWidth);
  }

  // Print test cards
  printCardBlockColumns(allBlocks);

  // Sleek final summary banner (handles narrow terminals with clean line-wrapping)
  drawDivider("─", testSuiteWidth);

  if (fullSummaryWidth <= testSuiteWidth) {
    console.log(fullSummaryLine);
  } else {
    console.log(`  ${statusIcon}  ${countMsg}`);
    const timeShort = `     ${chalk.gray("avg:")} ${chalk.white(`${avgTime.toFixed(3)} ms`)}  ${chalk.gray("·  total:")} ${chalk.white(`${totalTime.toFixed(3)} ms`)}`;
    if (stripAnsi(timeShort).length <= testSuiteWidth) {
      console.log(timeShort);
    } else {
      console.log(`     ${chalk.gray("avg:")} ${chalk.white(`${avgTime.toFixed(3)} ms`)}`);
      console.log(`     ${chalk.gray("total:")} ${chalk.white(`${totalTime.toFixed(3)} ms`)}`);
    }
  }
  drawDivider("═", testSuiteWidth);
}

/**
 * Runs test cases for class design / interactive problems (e.g. MinStack, LRUCache).
 */
export function runClassTests<C extends new (...args: any[]) => any>(
  cls: C,
  tests: ClassTestCase[],
  options: boolean | ClassTestOptions = true,
) {
  if (tests.length === 0) {
    console.log(chalk.yellow("⚠ No test cases provided."));
    return;
  }

  const showHeader = typeof options === "boolean" ? true : (options?.showHeader ?? true);
  const suiteUnordered = typeof options === "object" ? (options?.unordered ?? false) : false;
  const showHint = typeof options === "boolean" ? true : (options?.showHint ?? true);

  let passedCount = 0;

  drawDivider("═");
  if (showHeader) {
    console.log(`${chalk.bold.bgMagenta.black(" RUNS ")}  ${chalk.magenta.bold(`new ${cls.name || "Class"}()`)}`);
  }

  for (const [index, test] of tests.entries()) {
    const { name, operations, args, expected } = test;
    const actualOutputs: any[] = [];
    let instance: any = null;
    let failedIdx = -1;
    let runtimeError: unknown;

    const start = performance.now();
    const execution = captureConsoleOutput(() => {
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        const opArgs = args[i] || [];

        if (i === 0) {
          instance = new cls(...opArgs);
          actualOutputs.push(null);
        } else {
          if (!instance) throw new Error("Instance was not initialized on first operation");
          if (typeof instance[op] !== "function") throw new Error(`Method "${op}" is not defined on class`);
          const res = instance[op](...opArgs);
          actualOutputs.push(res !== undefined ? res : null);
        }
      }
    });
    if (execution.error) {
      runtimeError = execution.error;
      actualOutputs.push(null);
    }
    const end = performance.now();

    let passed = true;
    if (runtimeError || actualOutputs.length !== expected.length) {
      passed = false;
    } else {
      for (let i = 0; i < expected.length; i++) {
        if (!smartCompare(actualOutputs[i], expected[i], undefined, { unordered: suiteUnordered })) {
          passed = false;
          failedIdx = i;
          break;
        }
      }
    }

    if (passed) passedCount++;

    // Header
    drawDivider();
    const classBadge = passed ? chalk.bold.bgGreen.black(" PASS ") : chalk.bold.bgRed.white(" FAIL ");
    const classTime = chalk.gray(`${(end - start).toFixed(3)} ms`);
    console.log(`${classBadge}  ${chalk.cyan.bold(`Test ${index + 1}${name ? ` — ${name}` : ""}`)}  ${classTime}`);
    drawDivider();

    // Step table + failure diff
    renderStepTable(operations, args, expected, actualOutputs);
    console.log();

    printConsoleOutput(execution.logs);

    if (runtimeError) {
      const error = runtimeError instanceof Error
        ? `${runtimeError.name}: ${runtimeError.message}`
        : String(runtimeError);
      console.log(`${chalk.red("Runtime Error:")} ${chalk.gray(error)}`);
      console.log();
    }

    if (!passed && failedIdx !== -1) {
      const { expLine, gotLine, hint } = renderDiff(actualOutputs[failedIdx], expected[failedIdx]);
      console.log(
        chalk.red(`✗ Step #${failedIdx + 1}: `) +
          chalk.white(`${operations[failedIdx]}(${(args[failedIdx] ?? []).join(", ")})`),
      );
      if (expLine.includes("\n") || gotLine.includes("\n")) {
        console.log(`${chalk.green("- Expected:")}\n${indentAll(expLine, 2)}`);
        console.log();
        console.log(`${chalk.red("+ Received:")}\n${indentAll(gotLine, 2)}`);
        if (showHint && hint) {
          console.log();
          console.log(`  ${chalk.yellow("↳")} ${chalk.gray(hint)}`);
        }
      } else {
        console.log(`${chalk.green("- Expected:")}  ${padMultiline(expLine, 14)}`);
        console.log(`${chalk.red("+ Received:")}  ${padMultiline(gotLine, 14)}`);
        if (showHint && hint) console.log(`  ${chalk.yellow("↳")} ${chalk.gray(hint)}`);
      }
      console.log();
    }
  }

  drawDivider();
  if (passedCount === tests.length) {
    console.log(chalk.green.bold(`🎉 All ${passedCount}/${tests.length} tests passed!`));
  } else {
    console.log(chalk.red.bold(`❌ Passed ${passedCount}/${tests.length} tests`));
  }
  drawDivider("═");
}

// Re-export utilities for general import and backward compatibility
export {
  cloneValue,
  formatValue,
  smartCompare,
  compareUnorderedArrays,
  compareUnordered2DArrays,
  compareGroupAnagrams,
  compare3Sum,
  matrixToString,
  runCompare,
};
