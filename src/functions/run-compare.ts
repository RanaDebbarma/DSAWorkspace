import chalk from "chalk";
import { performance } from "node:perf_hooks";
import type { TestCase, TestOptions, FnLabelMode } from "#functions/code-tester.js";
import { smartCompare } from "#utils/compare.js";
import { cloneValue } from "#utils/clone.js";
import { captureConsoleOutput } from "#utils/console-capture.js";
import { getParamNames, formatValue } from "#utils/display.js";

export type { FnLabelMode };

// ── Internal helpers ────────────────────────────────────────────────────────

type FnResult = {
  passed: boolean;
  time: number;
  actual: any;
  error?: unknown;
};

const badgeColor = chalk.hex("#94a3b8"); // soft muted slate — higher focus than runtime, doesn't fight fastest badge
const fastestBadge = chalk.yellow.bold("◀");

function badge(i: number): string {
  return `[${i + 1}]`;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function compact(val: any): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";
  try { return JSON.stringify(val); } catch { return String(val); }
}

function padL(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s.padEnd(n);
}

function padR(s: string, n: number): string {
  return s.padStart(n);
}

function resolveFnLabelMode(options: TestOptions<any>): FnLabelMode {
  const raw = options.fnLabel ?? options.fnDisplay;
  if (typeof raw === "string") {
    const lower = raw.toLowerCase().trim();
    if (lower === "number" || lower === "num" || lower === "index" || lower === "id") {
      return "number";
    }
    if (lower === "name" || lower === "fn" || lower === "function") {
      return "name";
    }
    if (lower === "both" || lower === "all") {
      return "both";
    }
  }
  if (options.showFnName === false) return "number";
  if (options.showFnNumber === false) return "name";
  return "both";
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Runs multiple function implementations against the same test suite and
 * prints a compact per-test timing table plus an aggregated summary.
 *
 * @example
 * runCompare([solve_BF, solve_DP, solve_Greedy], tests);
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
  const maxBadgeLen = Math.max(...fns.map((_, i) => badge(i).length));
  const fnLabelMode = resolveFnLabelMode(options);
  const suiteUnordered = options.unordered ?? false;
  const suiteCompare = options.compare;
  const showHeader = options.showHeader ?? true;
  const showStringInput = options.showStringInput ?? true;
  const summaryOnly = options.summaryOnly ?? (options.showTests === false);

  // Column width calculations
  const COL_NAME = maxNameLen;
  const COL_PASS = 5;  // "6/6"
  const COL_AVG  = 9;  // "0.052 ms"
  const COL_TOT  = 9;  // "0.314 ms"

  const summaryContentWidth =
    fnLabelMode === "number"
      ? 2 + maxBadgeLen + 2 + COL_PASS + 2 + COL_AVG + 2 + COL_TOT + 3
      : fnLabelMode === "name"
        ? 2 + COL_NAME + 2 + COL_PASS + 2 + COL_AVG + 2 + COL_TOT + 3
        : 2 + maxBadgeLen + 2 + COL_NAME + 2 + COL_PASS + 2 + COL_AVG + 2 + COL_TOT + 3;

  const headerContentWidth = Math.max(
    ...fnNames.map((n) => n.length + maxBadgeLen + 4),
    35,
  );

  const baseWidth =
    fnLabelMode === "number"
      ? Math.max(summaryContentWidth, 36)
      : Math.max(summaryContentWidth, headerContentWidth, 50);
  const termCols = process.stdout.columns || 60;
  const defaultWidth = Math.min(termCols, baseWidth);

  function div(char = "─", width = defaultWidth): void {
    console.log(chalk.hex("#5d5d5d")(char.repeat(Math.min(termCols, width))));
  }

  // Per-function accumulators
  const stats = fns.map(() => ({ passed: 0, totalTime: 0 }));

  // ── Header ─────────────────────────────────────────────────────────────────
  if (showHeader) {
    div("═");
    console.log(
      `${chalk.bold.bgBlue.white(" COMPARE ")}  ` +
      chalk.gray(`${fns.length} functions · ${tests.length} tests`),
    );
    div();
    for (const [i, name] of fnNames.entries()) {
      console.log(`  ${badgeColor(badge(i))}  ${chalk.cyan(name)}`);
    }
    if (summaryOnly) console.log();
  }

  // ── Warmup pass ─────────────────────────────────────────────────────────────
  // Runs each function a few times with cloned input to warm up JIT,
  // initialize V8 Inline Caches (ICs), and ramp the CPU governor out of idle states.
  for (let w = 0; w < 5; w++) {
    for (const fn of fns) {
      try {
        const warmupInput = cloneValue(tests[0].input) as Parameters<F>;
        fn(...warmupInput);
      } catch {
        // Safe to ignore: official run handles errors and logs
      }
    }
  }

  // ── Per-test loop ──────────────────────────────────────────────────────────
  for (const [testIdx, test] of tests.entries()) {
    const { input, output, compare, unordered, anyOf } = test;
    const isUnordered = unordered ?? suiteUnordered;
    const effectiveCompare = compare ?? suiteCompare;

    const times = new Array(fns.length).fill(0);

    // Pass 1: Forward execution with console capture and result collection
    const pass1Results = fns.map((fn, i) => {
      const actualInput = cloneValue(input) as Parameters<F>;
      let start = 0;
      let end = 0;
      const execution = captureConsoleOutput(() => {
        start = performance.now();
        const val = fn(...actualInput);
        end = performance.now();
        return val;
      });
      times[i] = end - start;
      return { execution, actualInput };
    });

    // Pass 2: Symmetrical reverse execution (neutralizes positional / cache bias)
    if (fns.length > 1) {
      for (let i = fns.length - 1; i >= 0; i--) {
        if (!pass1Results[i].execution.error) {
          const actualInput = cloneValue(input) as Parameters<F>;
          const start = performance.now();
          try {
            fns[i](...actualInput);
          } catch {}
          const end = performance.now();
          times[i] = (times[i] + (end - start)) / 2;
        }
      }
    }

    // Form final results
    const results: FnResult[] = fns.map((fn, i) => {
      const { execution, actualInput } = pass1Results[i];
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

      return { passed, time: times[i], actual, error: execution.error };
    });

    // Accumulate totals
    for (const [i, res] of results.entries()) {
      if (res.passed) stats[i].passed++;
      stats[i].totalTime += res.time;
    }

    // Identify fastest passing function for this test
    let fastestIdx = -1;
    let fastestTime = Infinity;
    let secondFastestTime = Infinity;
    for (const [i, res] of results.entries()) {
      if (res.passed) {
        if (res.time < fastestTime) {
          secondFastestTime = fastestTime;
          fastestTime = res.time;
          fastestIdx = i;
        } else if (res.time < secondFastestTime) {
          secondFastestTime = res.time;
        }
      }
    }
    // Only show fastest if there are >= 2 passing functions and winner is visibly faster (>= 0.0005 ms)
    const showFastest =
      results.filter((r) => r.passed).length > 1 &&
      secondFastestTime - fastestTime >= 0.0005;

    if (!summaryOnly) {
      // ── Test block header — single line with inline inputs ─────────────────
      div();

      const effectiveShowStringInput =
        (test as any).showStringInput ?? showStringInput;
      const testTitle = test.name
        ? `Test ${testIdx + 1} — ${test.name}`
        : `Test ${testIdx + 1}`;

      if (effectiveShowStringInput) {
        const paramNames = getParamNames(fns[0]);
        const inputParts = (input as any[]).map((raw, i) => {
          const pName = paramNames[i] || `p${i + 1}`;
          const val =
            typeof raw === "string"
              ? `"${raw}"`
              : truncate(JSON.stringify(formatValue(raw)), 30);
          return `${chalk.cyan(pName)}${chalk.gray("=")}${chalk.white(val)}`;
        });
        const partsStr =
          inputParts.length > 0
            ? `  ${chalk.gray("·")}  ${inputParts.join(chalk.gray(", "))}`
            : "";
        console.log(`  ${chalk.bold.white(testTitle)}${partsStr}`);
      } else {
        console.log(`  ${chalk.bold.white(testTitle)}`);
      }
      console.log();

      // ── Timing rows ─────────────────────────────────────────────────────────
      const COL_TIME = 9; // "0.123 ms" right-aligned
      for (const [i, res] of results.entries()) {
        const b = badge(i).padEnd(maxBadgeLen);
        const timeStr = `${res.time.toFixed(3)} ms`.padStart(COL_TIME);
        const fastest = showFastest && i === fastestIdx;
        const label =
          fnLabelMode === "name"
            ? chalk.cyan(padL(fnNames[i], COL_NAME))
            : badgeColor(b);

        if (res.passed) {
          console.log(
            `  ${chalk.green("✓")}  ${label}  ${chalk.gray(timeStr)}` +
            (fastest ? `  ${fastestBadge}` : ""),
          );
        } else {
          const gotStr = res.error
            ? chalk.red(truncate(
                `Error: ${res.error instanceof Error ? res.error.message : String(res.error)}`,
                28,
              ))
            : chalk.red(truncate(compact(res.actual), 20));
          const expStr = chalk.green(truncate(compact(output), 20));
          console.log(
            `  ${chalk.red("✗")}  ${label}  ${chalk.gray(timeStr)}` +
            `  ${chalk.gray("got")} ${gotStr}  ${chalk.gray("exp")} ${expStr}`,
          );
        }
      }

      console.log();
    }
  }

  // ── Summary table ──────────────────────────────────────────────────────────
  div("═");
  console.log(`${chalk.bold.bgBlue.white(" SUMMARY ")}`);
  div();
  console.log();

  // Overall fastest = lowest totalTime among fully-passing functions
  let overallFastestIdx = -1;
  let overallFastestTime = Infinity;
  let overallSecondFastestTime = Infinity;
  let fullPassCount = 0;
  for (const [i, stat] of stats.entries()) {
    if (stat.passed === tests.length) {
      fullPassCount++;
      if (stat.totalTime < overallFastestTime) {
        overallSecondFastestTime = overallFastestTime;
        overallFastestTime = stat.totalTime;
        overallFastestIdx = i;
      } else if (stat.totalTime < overallSecondFastestTime) {
        overallSecondFastestTime = stat.totalTime;
      }
    }
  }
  // Only show overall fastest if there are >= 2 passing functions and winner is visibly faster (>= 0.0005 ms)
  const showOverallFastest =
    fullPassCount > 1 &&
    overallSecondFastestTime - overallFastestTime >= 0.0005;

  // Header row
  if (fnLabelMode === "number") {
    console.log(
      `  ${chalk.gray(padL("Fn", maxBadgeLen))}  ` +
      `${chalk.gray(padR("Pass", COL_PASS))}  ` +
      `${chalk.gray(padR("Avg", COL_AVG))}  ` +
      `${chalk.gray(padR("Total", COL_TOT))}`,
    );
  } else if (fnLabelMode === "name") {
    console.log(
      `  ${chalk.gray(padL("Function", COL_NAME))}  ` +
      `${chalk.gray(padR("Pass", COL_PASS))}  ` +
      `${chalk.gray(padR("Avg", COL_AVG))}  ` +
      `${chalk.gray(padR("Total", COL_TOT))}`,
    );
  } else {
    // "both"
    console.log(
      `${" ".repeat(maxBadgeLen + 4)}${chalk.gray(padL("Function", COL_NAME))}  ` +
      `${chalk.gray(padR("Pass", COL_PASS))}  ` +
      `${chalk.gray(padR("Avg", COL_AVG))}  ` +
      `${chalk.gray(padR("Total", COL_TOT))}`,
    );
  }
  div();

  for (const [i, stat] of stats.entries()) {
    const allPassed = stat.passed === tests.length;
    const passedStr = `${stat.passed}/${tests.length}`;
    const avgStr = `${(stat.totalTime / tests.length).toFixed(3)} ms`;
    const totStr = `${stat.totalTime.toFixed(3)} ms`;
    const fastest = showOverallFastest && i === overallFastestIdx;
    const nameColor = allPassed ? chalk.white : chalk.red;
    const passColor = allPassed ? chalk.green : chalk.red;
    const b = badge(i).padEnd(maxBadgeLen);

    if (fnLabelMode === "number") {
      console.log(
        `  ${badgeColor(b)}  ` +
        `${passColor(padR(passedStr, COL_PASS))}  ` +
        `${chalk.gray(padR(avgStr, COL_AVG))}  ` +
        `${chalk.gray(padR(totStr, COL_TOT))}` +
        (fastest ? `  ${fastestBadge}` : ""),
      );
    } else if (fnLabelMode === "name") {
      console.log(
        `  ${nameColor(padL(fnNames[i], COL_NAME))}  ` +
        `${passColor(padR(passedStr, COL_PASS))}  ` +
        `${chalk.gray(padR(avgStr, COL_AVG))}  ` +
        `${chalk.gray(padR(totStr, COL_TOT))}` +
        (fastest ? `  ${fastestBadge}` : ""),
      );
    } else {
      console.log(
        `  ${badgeColor(b)}  ${nameColor(padL(fnNames[i], COL_NAME))}  ` +
        `${passColor(padR(passedStr, COL_PASS))}  ` +
        `${chalk.gray(padR(avgStr, COL_AVG))}  ` +
        `${chalk.gray(padR(totStr, COL_TOT))}` +
        (fastest ? `  ${fastestBadge}` : ""),
      );
    }
  }

  console.log();
  div("═");
}

