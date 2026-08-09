import chalk from "chalk";
import { ListNode } from "#ds/linked-list.js";
import { TreeNode, binaryTreeToArray } from "#ds/tree.js";
import { GraphNode } from "#ds/graph.js";
import { smartCompare } from "#utils/compare.js";
import { serializeForDisplay, treeToString, graphToString, TreeHighlightMap } from "#utils/display.js";

/**
 * Helper to check if a value is an Array or TypedArray (e.g. Int32Array).
 */
function isArrayLike(val: any): boolean {
  return Array.isArray(val) || (ArrayBuffer.isView(val) && !(val instanceof DataView));
}

/**
 * Renders two arrays/typed-arrays as inline colored strings.
 * Matching elements are green, mismatched elements are red (Received) / green bold (Expected).
 * Returns { expLine, gotLine, hint } where hint is a short text label.
 */
export function renderArrayDiff(
  actualInput: unknown,
  expectedInput: unknown,
): { expLine: string; gotLine: string; hint: string } {
  const actual = Array.from((actualInput ?? []) as any[]);
  const expected = Array.from((expectedInput ?? []) as any[]);

  const expParts: string[] = [];
  const gotParts: string[] = [];
  let hint = "";

  const minLen = Math.min(actual.length, expected.length);

  for (let i = 0; i < minLen; i++) {
    const a = actual[i];
    const e = expected[i];
    const match = smartCompare(a, e);

    if (match) {
      expParts.push(chalk.green(JSON.stringify(e)));
      gotParts.push(chalk.green(JSON.stringify(a)));
    } else {
      if (!hint) {
        hint = `index [${i}]: expected ${JSON.stringify(e)}, got ${JSON.stringify(a)}`;
      }
      expParts.push(chalk.green.bold(JSON.stringify(e)));
      gotParts.push(chalk.red.bold(JSON.stringify(a)));
    }
  }

  // Handle remaining expected elements if actual is shorter
  for (let i = minLen; i < expected.length; i++) {
    expParts.push(chalk.green.bold(JSON.stringify(expected[i])));
  }

  // Handle remaining actual elements if actual is longer
  for (let i = minLen; i < actual.length; i++) {
    gotParts.push(chalk.red.bold(JSON.stringify(actual[i])));
  }

  if (actual.length !== expected.length) {
    if (!hint) {
      hint = `length mismatch — expected ${expected.length} elements, got ${actual.length}`;
    }
  }

  return {
    expLine: `[${expParts.join(", ")}]`,
    gotLine: `[${gotParts.join(", ")}]`,
    hint,
  };
}

/**
 * Renders two linked lists as inline colored strings.
 * Matching nodes are green, mismatched nodes are red(got)/green bold(expected).
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
      expParts.push(chalk.green(String(e!.val)));
      gotParts.push(chalk.green(String(a!.val)));
    } else {
      if (!hint) {
        if (!a) hint = `node [${idx}]: expected ${e!.val}, got (end of list)`;
        else if (!e) hint = `node [${idx}]: expected (end of list), got ${a.val}`;
        else hint = `node [${idx}]: expected ${e.val}, got ${a.val}`;
      }
      if (e) expParts.push(chalk.green.bold(String(e.val)));
      if (a) gotParts.push(chalk.red.bold(String(a.val)));
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
 * Helper to traverse actual and expected tree nodes in parallel
 * and build highlight maps for diff rendering.
 */
function buildTreeDiffMaps(
  actual: TreeNode | null,
  expected: TreeNode | null,
): {
  actualHighlights: TreeHighlightMap;
  expectedHighlights: TreeHighlightMap;
} {
  const actualHighlights: TreeHighlightMap = new Map();
  const expectedHighlights: TreeHighlightMap = new Map();

  function traverse(a: TreeNode | null, e: TreeNode | null) {
    if (!a && !e) return;

    if (a && e) {
      const match = a.val === e.val;
      actualHighlights.set(a, { color: match ? chalk.cyan : chalk.red.bold });
      expectedHighlights.set(e, { color: match ? chalk.cyan : chalk.green.bold });
      traverse(a.left, e.left);
      traverse(a.right, e.right);
    } else if (a) {
      actualHighlights.set(a, { color: chalk.red.bold });
      traverse(a.left, null);
      traverse(a.right, null);
    } else if (e) {
      expectedHighlights.set(e, { color: chalk.green.bold });
      traverse(null, e.left);
      traverse(null, e.right);
    }
  }

  traverse(actual, expected);
  return { actualHighlights, expectedHighlights };
}

/**
 * Renders two binary trees as node-by-node colored ASCII tree diagrams.
 * Matching nodes are green, mismatched nodes are red (Received) / bold green (Expected).
 */
export function renderTreeDiff(
  actual: TreeNode | null,
  expected: TreeNode | null,
): { expLine: string; gotLine: string; hint: string } {
  const { actualHighlights, expectedHighlights } = buildTreeDiffMaps(actual, expected);

  const expLine = treeToString(expected, true, expectedHighlights);
  const gotLine = treeToString(actual, true, actualHighlights);

  const actualArr = binaryTreeToArray(actual);
  const expectedArr = binaryTreeToArray(expected);

  let hint = "";
  const maxLen = Math.max(actualArr.length, expectedArr.length);
  for (let i = 0; i < maxLen; i++) {
    const act = actualArr[i];
    const exp = expectedArr[i];
    if (act !== exp) {
      hint = `tree node mismatch at index [${i}]: expected ${exp ?? "null"}, got ${act ?? "null"}`;
      break;
    }
  }

  return { expLine, gotLine, hint };
}

/**
 * Main diff renderer. Returns { expLine, gotLine, hint } for any value pair.
 * Falls back to plain serializeForDisplay when no structured diff is possible.
 */
export function renderDiff(
  actual: unknown,
  expected: unknown,
): { expLine: string; gotLine: string; hint: string } {
  // Array / TypedArray diff
  if (isArrayLike(actual) && isArrayLike(expected)) {
    return renderArrayDiff(actual, expected);
  }

  // Linked list diff
  if (actual instanceof ListNode || expected instanceof ListNode) {
    return renderListDiff(
      actual instanceof ListNode ? actual : null,
      expected instanceof ListNode ? expected : null,
    );
  }

  // Tree diff
  if (actual instanceof TreeNode || expected instanceof TreeNode) {
    return renderTreeDiff(
      actual instanceof TreeNode ? actual : null,
      expected instanceof TreeNode ? expected : null,
    );
  }

  // Graph diff
  if (actual instanceof GraphNode || expected instanceof GraphNode) {
    return {
      expLine: chalk.green(graphToString(expected instanceof GraphNode ? expected : null)),
      gotLine: chalk.red(graphToString(actual instanceof GraphNode ? actual : null)),
      hint: "",
    };
  }

  // String: highlight matching chars in green, first mismatch in red/bold green
  if (typeof actual === "string" && typeof expected === "string") {
    const len = Math.max(actual.length, expected.length);
    let hint = "";
    let expLine = '"';
    let gotLine = '"';
    for (let i = 0; i < len; i++) {
      const ec = expected[i], ac = actual[i];
      if (ec === ac) {
        expLine += chalk.green(ec ?? "");
        gotLine += chalk.green(ac ?? "");
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
