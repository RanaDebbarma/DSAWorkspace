import { runTests } from "#functions/code-tester.js";
import { createLinkedList, ListNode } from "#functions/linked-list.js";

// LeetCode 143

function reorderList(head: ListNode | null): void {
  // Base case: 0, 1, or 2 nodes don't need reordering
  if (!head || !head.next || !head.next.next) return;

  // 1. Find the split point (slow will point to the end of the 1st half)
  let slow: ListNode = head;
  let fast: ListNode | null = head;

  while (fast && fast.next) {
    slow = slow.next!;
    fast = fast.next.next;
  }

  // Split the list and isolate the second half
  let second: ListNode | null = slow.next;
  slow.next = null;

  // 2. Reverse the second half in-place
  let prev: ListNode | null = null;
  while (second) {
    const nextTemp: ListNode | null = second.next;
    second.next = prev;
    prev = second;
    second = nextTemp;
  }

  // 3. Interleave the two halves
  let first: ListNode | null = head;
  second = prev; // This is now the head of the reversed second half

  while (second) {
    const firstNext: ListNode | null = first!.next;
    const secondNext: ListNode | null = second.next;

    first!.next = second;
    second.next = firstNext;

    first = firstNext;
    second = secondNext;
  }
}

function solve(head: ListNode | null): ListNode | null {
  reorderList(head);
  return head;
}

runTests(
  solve,
  [
    {
      input: [createLinkedList([1, 2, 3, 4])],
      output: createLinkedList([1, 4, 2, 3]),
    },
    {
      input: [createLinkedList([1, 2, 3, 4, 5])],
      output: createLinkedList([1, 5, 2, 4, 3]),
    },
    {
      input: [createLinkedList([1, 2, 3, 4, 5, 6])],
      output: createLinkedList([1, 6, 2, 5, 3, 4]),
    },
    // Edge
    {
      input: [createLinkedList([])],
      output: createLinkedList([]),
    },
  ],
  true,
);
