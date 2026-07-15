// =========================
// LINKED LIST UTILS
// =========================

export class ListNode {
  val: number;
  next: ListNode | null;

  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

export function createLinkedList(values: number[]): ListNode | null {
  const dummy = new ListNode();
  let curr = dummy;

  for (const value of values) {
    curr.next = new ListNode(value);
    curr = curr.next;
  }

  return dummy.next;
}

export function linkedListToArray(head: ListNode | null): number[] {
  const result: number[] = [];
  const visited = new Set<ListNode>();

  while (head) {
    if (visited.has(head)) break; // cycle detected
    visited.add(head);
    result.push(head.val);
    head = head.next;
  }

  return result;
}

export function compareLinkedLists(
  actual: ListNode | null,
  expected: ListNode | null,
): boolean {
  while (actual && expected) {
    if (actual.val !== expected.val) return false;

    actual = actual.next;
    expected = expected.next;
  }

  return actual === null && expected === null;
}

export function printLinkedList(head: ListNode | null): string {
  return linkedListToArray(head).join(" -> ");
}

export function linkedListToString(head: ListNode | null): string {
  if (!head) return "null";

  const nodes: ListNode[] = [];
  const indexMap = new Map<ListNode, number>();
  let curr: ListNode | null = head;

  while (curr) {
    if (indexMap.has(curr)) {
      // cyclic: show the cycle-back index
      const values = nodes.map((n) => n.val);
      return values.join(" → ") + ` → (cycle to index ${indexMap.get(curr)})`;
    }
    indexMap.set(curr, nodes.length);
    nodes.push(curr);
    curr = curr.next;
  }

  return nodes.map((n) => n.val).join(" → ") + " → null";
}

/**
 * Alias for linkedListToString — explicitly named for cyclic contexts.
 */
export function cyclicLinkedListToString(head: ListNode | null): string {
  return linkedListToString(head);
}

export function cloneLinkedList(head: ListNode | null): ListNode | null {
  if (!head) return null;

  // Map from original node → cloned node (handles both acyclic and cyclic)
  const nodeMap = new Map<ListNode, ListNode>();
  let curr: ListNode | null = head;

  // First pass: create all cloned nodes
  while (curr) {
    if (nodeMap.has(curr)) break; // cycle detected, stop
    nodeMap.set(curr, new ListNode(curr.val));
    curr = curr.next;
  }

  // Second pass: wire up next pointers (including the cycle back-pointer)
  for (const [original, clone] of nodeMap) {
    if (original.next !== null) {
      clone.next = nodeMap.get(original.next) ?? null;
    }
  }

  return nodeMap.get(head) ?? null;
}

/**
 * Creates a cyclic linked list from an array of values.
 * @param values - The node values.
 * @param pos    - The 0-based index the tail's next pointer connects back to.
 *                 Use -1 for no cycle (same as createLinkedList).
 */
export function createCyclicLinkedList(
  values: number[],
  pos: number,
): ListNode | null {
  if (values.length === 0) return null;

  const nodes = values.map((v) => new ListNode(v));

  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].next = nodes[i + 1];
  }

  if (pos >= 0 && pos < nodes.length) {
    nodes[nodes.length - 1].next = nodes[pos]; // create the cycle
  }

  return nodes[0];
}

export function cloneValue(value: unknown): unknown {
  if (value instanceof ListNode || value === null) {
    return cloneLinkedList(value as ListNode | null);
  }

  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }

  return value;
}