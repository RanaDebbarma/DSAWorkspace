import { runTests } from "#functions/code-tester.js";
import { createCyclicLinkedList, ListNode } from "#functions/linked-list.js";

// LeetCode 141

// o(n) time and o(n) space
// const solve = function hasCycle(head: ListNode | null): boolean {
//   let curr = head;
//   const seen = new Set<ListNode>();

//   while (curr) {
//     if (seen.has(curr)) return true;
//     seen.add(curr);
//     curr = curr.next;
//   }

//   return false;
// };

// o(n) time and o(1) space ------- (Floyd's Tortoise and Hare algorithm)
const solve = function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;

    if (fast === slow) return true;
  }

  return false;
};

runTests(solve, [
  {
    input: [createCyclicLinkedList([3, 2, 0, -4], 1)],
    output: true,
  },
  {
    input: [createCyclicLinkedList([1, 2], 0)],
    output: true,
  },
  {
    input: [createCyclicLinkedList([1], -1)],
    output: false,
  },
  // Edge
  {
    input: [createCyclicLinkedList([1, 2, 1], -1)],
    output: false,
  },
]);
