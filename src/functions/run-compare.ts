import chalk from "chalk";
import { performance } from "node:perf_hooks";
import type { TestCase, TestOptions } from "#functions/code-tester.js";
import { smartCompare } from "#utils/compare.js";
import { cloneValue } from "#utils/clone.js";
import { captureConsoleOutput } from "#utils/console-capture.js";
import { getParamNames, formatValue, drawDivider } from "#utils/display.js";

// ── Internal helpers ───────────────────────────────────────────────────────────

type FnResult = {
  passed: boolean;
  time: number;
  actual: any;
  error?: unknown;
};

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function compact(val: any): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Runs multiple function implementations against the same test suite and
 * prints a compact per-test timing table plus an aggregated summary.
 *
 * @example
 * runCompare([solve_BF, solve_DP, solve_Greedy], tests);
 *
 * @example
 * // Also accessible via the runTests overload:
 * runTests([solve_BF, solve_DP, solve_Greedy], tests);
 */
export function runCompare<F extends (...args: any[]) => any>(
  fns: F[],
  tests: TestCase<F>[],
  options: TestOptions<F> = {},
): void {
  if (fns.length === 0) {
    console.log(chalk.yellow("⚠ No functions provided."));
    return;
  }
  if (tests.length === 0) {
    console.log(chalk.yellow("⚠ No test cases provided."));
    return;
  }

  const fnNames = fns.map((fn, i) => fn.name || `fn${i + 1}`);
  const maxNameLen = Math.max(...fnNames.map((n) => n.length), 8);
  const suiteUnordered = options.unordered ?? false;
  const suiteCompare = options.compare;

  // Per-function accumulators
  const stats = fns.map(() => ({ passed: 0, totalTime: 0 }));

  // ── Header ──────────────────────────────────────────────────────────────────
  drawDivider("═");
  console.log(
    `${chalk.bold.bgCyan.black(" COMPARE ")}  ${fnNames.map((n) => chalk.cyan.bold(n)).join(chalk.gray(" · "))}`,
  );

  // ── Per-test loop ────────────────────────────────────────────────────────────
  for (const [testIdx, test] of tests.entries()) {
    const { input, output, compare, unordered, anyOf } = test;
    const isUnordered = unordered ?? suiteUnordered;
    const effectiveCompare = compare ?? suiteCompare;

    // Run every function with its own deep-cloned input
    const results: FnResult[] = fns.map((fn) => {
      const actualInput = cloneValue(input) as Parameters<F>;
      const start = performance.now();
      const execution = captureConsoleOutput(() => fn(...actualInput));
      const end = performance.now();
      const actual = execution.value as ReturnType<F>;

      const passed = execution.error
        ? false
        : effectiveCompare
          ? effectiveCompare(actual, output, actualInput)
          : anyOf
            ? [output, ...anyOf].some((alt) =>
                smartCompare(actual, alt, actualInput, {
                  unordered: isUnordered,
                  fnName: fn.name,
                }),
              )
            : smartCompare(actual, output, actualInput, {
                unordered: isUnordered,
                fnName: fn.name,
              });

      return { passed, time: end - start, actual, error: execution.error };
    });

    // Accumulate totals
    for (const [i, res] of results.entries()) {
      if (res.passed) stats[i].passed++;
      stats[i].totalTime += res.time;
    }

    // Identify fastest passing function for this test
    let fastestIdx = -1;
    let fastestTime = Infinity;
    for (const [i, res] of results.entries()) {
      if (res.passed && res.time < fastestTime) {
        fastestTime = res.time;
        fastestIdx = i;
      }
    }
    const showFastest = results.filter((r) => r.passed).length > 1;

    // ── Test block header ──────────────────────────────────────────────────────
    drawDivider();
    console.log(chalk.cyan.bold(` Test ${testIdx + 1}`));
    drawDivider();
    console.log();

    // Input display — compact param = value lines
    const paramNames = getParamNames(fns[0]);
    for (let i = 0; i < (input as any[]).length; i++) {
      const raw = (input as any[])[i];
      const pName = paramNames[i] || `param${i + 1}`;
      const serialized =
        typeof raw === "string"
          ? `"${raw}"`
          : truncate(JSON.stringify(formatValue(raw)), 80);
      console.log(
        `${chalk.cyan(pName)} ${chalk.gray("=")} ${chalk.white(serialized)}`,
      );
    }
    console.log();

    // ── Timing rows ────────────────────────────────────────────────────────────
    const COL_TIME = 10; // " 0.123 ms" right-aligned
    for (const [i, res] of results.entries()) {
      const name = fnNames[i].padEnd(maxNameLen);
      const timeStr = `${res.time.toFixed(3)} ms`.padStart(COL_TIME);
      const badge =
        showFastest && i === fastestIdx ? chalk.yellow("  ◀ fastest") : "";

      if (res.passed) {
        console.log(
          `  ${chalk.green("✓")}  ${chalk.white(name)}  ${chalk.gray(timeStr)}${badge}`,
        );
      } else {
        const gotStr = res.error
          ? chalk.red(
              truncate(
                `Runtime Error: ${res.error instanceof Error ? res.error.message : String(res.error)}`,
                32,
              ),
            )
          : chalk.red(truncate(compact(res.actual), 24));
        const expStr = chalk.green(truncate(compact(output), 24));
        console.log(
          `  ${chalk.red("✗")}  ${chalk.red(name)}  ${chalk.gray(timeStr)}   ${chalk.gray("got")} ${gotStr}   ${chalk.gray("exp")} ${expStr}`,
        );
      }
    }

    console.log();
  }

  // ── Summary table ──────────────────────────────────────────────────────────
  drawDivider("═");
  console.log(chalk.bold.white(" SUMMARY"));
  drawDivider();
  console.log();

  // Overall fastest = lowest totalTime among fully-passing functions
  let overallFastestIdx = -1;
  let overallFastestTime = Infinity;
  let fullPassCount = 0;
  for (const [i, stat] of stats.entries()) {
    if (stat.passed === tests.length) {
      fullPassCount++;
      if (stat.totalTime < overallFastestTime) {
        overallFastestTime = stat.totalTime;
        overallFastestIdx = i;
      }
    }
  }
  const showOverallFastest = fullPassCount > 1;

  const COL_NAME = maxNameLen;
  const COL_PASS = 10; // "  6 / 6  " right-aligned
  const COL_AVG  = 11; // "  0.052 ms"
  const COL_TOT  = 11; // "  0.314 ms"

  const padL = (s: string, n: number) =>
    s.length > n ? s.slice(0, n - 1) + "…" : s.padEnd(n);
  const padR = (s: string, n: number) => s.padStart(n);

  // Header row
  console.log(
    `  ${chalk.gray(padL("Function", COL_NAME))}  ` +
    `${chalk.gray(padR("Passed", COL_PASS))}  ` +
    `${chalk.gray(padR("Avg Time", COL_AVG))}  ` +
    `${chalk.gray(padR("Total", COL_TOT))}`,
  );
  drawDivider();

  for (const [i, stat] of stats.entries()) {
    const allPassed = stat.passed === tests.length;
    const passedStr = `${stat.passed} / ${tests.length}`;
    const avgStr = `${(stat.totalTime / tests.length).toFixed(3)} ms`;
    const totStr = `${stat.totalTime.toFixed(3)} ms`;
    const badge =
      showOverallFastest && i === overallFastestIdx
        ? chalk.yellow("  ◀ fastest")
        : "";
    const nameColor = allPassed ? chalk.white : chalk.red;
    const passColor = allPassed ? chalk.green : chalk.red;

    console.log(
      `  ${nameColor(padL(fnNames[i], COL_NAME))}  ` +
      `${passColor(padR(passedStr, COL_PASS))}  ` +
      `${chalk.gray(padR(avgStr, COL_AVG))}  ` +
      `${chalk.gray(padR(totStr, COL_TOT))}${badge}`,
    );
  }

  console.log();
  drawDivider("═");
}
