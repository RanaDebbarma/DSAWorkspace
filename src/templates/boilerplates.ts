import { SignatureInfo } from "#utils/testcase-parser.js";

// ============================================================================
// Exported boilerplate template functions.
// Each accepts `fnName` (camelCase), optional `initialCases` code string,
// and optional `sig` (inferred SignatureInfo).
// ============================================================================

// 1. STANDARD SOLUTION TEMPLATE (Arrays, Strings, Math, etc.)
export function getStandardTemplate(
  fnName: string,
  initialCases?: string,
  sig?: SignatureInfo
): string {
  const cases = initialCases || "  { input: [[1, 2, 3]], output: 0 },";
  const params = sig?.paramsCode || "nums: number[]";
  const retType = sig?.returnType || "number";
  const retVal = sig?.defaultReturn || "0";

  return `import { runTests } from "#functions/code-tester.js";

function ${fnName}(${params}): ${retType} {
  return ${retVal};
}

runTests(${fnName}, [
${cases}
]);
`;
}

// 2. LINKED LIST TEMPLATE
export function getLinkedListTemplate(
  fnName: string,
  initialCases?: string,
  sig?: SignatureInfo
): string {
  const cases =
    initialCases ||
    `  {
    input: [createLinkedList([1, 2, 3])],
    output: createLinkedList([1, 2, 3]),
  },`;
  const params = sig?.paramsCode || "head: ListNode | null";
  const retType = sig?.returnType || "ListNode | null";
  const retVal = sig?.defaultReturn || "head";

  return `import { runTests } from "#functions/code-tester.js";
import { createLinkedList, ListNode } from "#ds/linked-list.js";

function ${fnName}(${params}): ${retType} {
  return ${retVal};
}

// Note: smartCompare automatically compares Linked Lists recursively!
runTests(${fnName}, [
${cases}
]);
`;
}

// 3. CYCLIC LINKED LIST TEMPLATE (e.g. LC 141 - Linked List Cycle)
export function getCyclicLinkedListTemplate(fnName: string): string {
  return `import { runTests } from "#functions/code-tester.js";
import { createCyclicLinkedList, ListNode } from "#ds/linked-list.js";

function ${fnName}(head: ListNode | null): boolean {
  return false;
}

// createCyclicLinkedList(values, pos):
//   pos = 0-based index where the tail connects back to  (-1 = no cycle)
// e.g. [3,2,0,-4] with pos=1 → tail (-4) points back to node at index 1 (value 2)
runTests(${fnName}, [
  { input: [createCyclicLinkedList([3, 2, 0, -4], 1)], output: true },
  { input: [createCyclicLinkedList([1, 2], 0)],        output: true },
  { input: [createCyclicLinkedList([1], -1)],           output: false },
]);
`;
}

// 4. BINARY TREE TEMPLATE
export function getBinaryTreeTemplate(
  fnName: string,
  initialCases?: string,
  sig?: SignatureInfo
): string {
  const cases =
    initialCases ||
    `  {
    input: [createBinaryTree([1, null, 2, 3])],
    output: createBinaryTree([1, null, 2, 3]),
  },`;
  const params = sig?.paramsCode || "root: TreeNode | null";
  const retType = sig?.returnType || "TreeNode | null";
  const retVal = sig?.defaultReturn || "root";

  return `import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#ds/tree.js";

function ${fnName}(${params}): ${retType} {
  return ${retVal};
}

// Note: smartCompare automatically compares Binary Trees recursively!
runTests(${fnName}, [
${cases}
]);
`;
}

// 5. GRAPH TEMPLATE
export function getGraphTemplate(
  fnName: string,
  initialCases?: string,
  sig?: SignatureInfo
): string {
  const cases =
    initialCases ||
    `  {
    input: [createGraph([[2, 4], [1, 3], [2, 4], [1, 3]])],
    output: createGraph([[2, 4], [1, 3], [2, 4], [1, 3]]),
  },`;
  const params = sig?.paramsCode || "node: GraphNode | null";
  const retType = sig?.returnType || "GraphNode | null";
  const retVal = sig?.defaultReturn || "node";

  return `import { runTests } from "#functions/code-tester.js";
import { createGraph, GraphNode } from "#ds/graph.js";

function ${fnName}(${params}): ${retType} {
  return ${retVal};
}

// Note: smartCompare automatically handles cycles and compares Graph structures!
runTests(${fnName}, [
${cases}
]);
`;
}

// 6. CLASS DESIGN / SYSTEM DESIGN TEMPLATE
export function getClassDesignTemplate(
  fnName: string,
  initialCases?: string
): string {
  const className = fnName.charAt(0).toUpperCase() + fnName.slice(1);
  const cases =
    initialCases ||
    `  {
    operations: ["${className}", "push", "push", "getMin", "pop", "top", "getMin"],
    args: [[], [-2], [0], [], [], [], []],
    expected: [null, null, null, -2, null, -2, -2],
  },`;
  return `import { runClassTests } from "#functions/code-tester.js";

class ${className} {
  // Implement class here...
  push(val: number): void {}
  pop(): void {}
  top(): number { return 0; }
  getMin(): number { return 0; }
}

runClassTests(${className}, [
${cases}
]);
`;
}

// 7. MULTI-PARAM TREE TEMPLATE (e.g. LCA, path problems)
export function getMultiParamTreeTemplate(fnName: string): string {
  return `import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#ds/tree.js";

function ${fnName}(
  root: TreeNode | null,
  p: TreeNode | null,
  q: TreeNode | null,
): TreeNode | null {
  return root;
}

// IMPORTANT: p and q must be references into the same tree instance (root).
// Use root.find(val) to locate the node — do NOT create separate trees.
// visualizeInput renders the full tree with p and q highlighted in color.
const tree1 = createBinaryTree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5])!;

runTests(${fnName}, [
  {
    input: [tree1, tree1.find(2), tree1.find(8)],
    output: tree1.find(6),
  },
], { visualizeInput: true });
`;
}

// ============================================================================
// Template registry for use in the CLI
// ============================================================================
export const TEMPLATES = [
  {
    label: "Standard          (arrays, strings, math)",
    value: "standard" as const,
    fn: getStandardTemplate,
  },
  {
    label: "Linked List",
    value: "linked-list" as const,
    fn: getLinkedListTemplate,
  },
  {
    label: "Cyclic Linked List",
    value: "cyclic-linked-list" as const,
    fn: getCyclicLinkedListTemplate,
  },
  {
    label: "Binary Tree",
    value: "binary-tree" as const,
    fn: getBinaryTreeTemplate,
  },
  {
    label: "Graph",
    value: "graph" as const,
    fn: getGraphTemplate,
  },
  {
    label: "Class Design      (MinStack, LRU Cache, etc.)",
    value: "class-design" as const,
    fn: getClassDesignTemplate,
  },
  {
    label: "Multi-Param Tree  (LCA, path problems)",
    value: "multi-param-tree" as const,
    fn: getMultiParamTreeTemplate,
  },
] as const;

export type TemplateValue = (typeof TEMPLATES)[number]["value"];
