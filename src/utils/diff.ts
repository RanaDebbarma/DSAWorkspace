import chalk from "chalk";
import { ListNode } from "#functions/linked-list.js";
import { smartCompare } from "#utils/compare.js";
import { serializeForDisplay } from "#utils/display.js";

/**
 * Renders two arrays as inline colored strings.
 * Matching elements are gray, first mismatch is red(got)/green(expected).
 * Returns { expLine, gotLine, hint } where hint is a short text label.
 */
export function renderArrayDiff(
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
export function renderListDiff(
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
export function renderDiff(
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
