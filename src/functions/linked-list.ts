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

  while (head) {
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

  const values: number[] = [];

  while (head) {
    values.push(head.val);
    head = head.next;
  }

  return values.join(" → ") + " → null";
}

export function cloneLinkedList(head: ListNode | null): ListNode | null {
  if (!head) return null;

  const dummy = new ListNode();
  let tail = dummy;
  let curr: ListNode | null = head;

  while (curr) {
    tail.next = new ListNode(curr.val);
    tail = tail.next;
    curr = curr.next;
  }

  return dummy.next;
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