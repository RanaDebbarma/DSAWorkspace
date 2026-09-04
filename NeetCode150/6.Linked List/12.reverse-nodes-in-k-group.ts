import { runTests } from "#functions/code-tester.js";
import { createLinkedList, ListNode } from "#ds/linked-list.js";

// LeetCode 25

// recursive
// function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
//   if (!head) return null;

//   // Check if there are at least k nodes to reverse.
//   let node: ListNode | null = head;

//   for (let i = 0; i < k; i++) {
//     if (!node) return head;
//     node = node.next;
//   }

//   // Reverse k nodes.
//   let prev = null;
//   let curr = head;

//   for (let i = 0; i < k; i++) {
//     const next = curr.next!;
//     curr.next = prev;
//     prev = curr;
//     curr = next;
//   }

//   // Original head is now the tail.
//   head.next = reverseKGroup(curr, k);

//   return prev;
// }

// itterative
function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
  if (!head || k === 1) return head;

  const dummy = new ListNode(0, head);
  let groupPrev: ListNode = dummy;

  while (true) {
    // Find the kth node in the current group.
    let kth: ListNode | null = groupPrev;

    for (let i = 0; i < k; i++) {
      kth = kth.next;
      if (!kth) return dummy.next;
    }

    const groupNext = kth.next;

    // Reverse the current group.
    let prev = groupNext;
    let curr = groupPrev.next;

    while (curr !== groupNext) {
      const next = curr!.next;
      curr!.next = prev;
      prev = curr;
      curr = next;
    }

    // Connect the previous group to the reversed group.
    const oldGroupHead = groupPrev.next!;
    groupPrev.next = kth;

    // Old head is now the tail.
    groupPrev = oldGroupHead;
  }
}

runTests(reverseKGroup, [
  {
    input: [createLinkedList([1, 2, 3, 4, 5, 6]), 3],
    output: createLinkedList([3, 2, 1, 6, 5, 4]),
  },
  {
    input: [createLinkedList([1, 2, 3, 4, 5]), 3],
    output: createLinkedList([3, 2, 1, 4, 5]),
  },
  {
    input: [createLinkedList([1, 2, 3, 4, 5]), 2],
    output: createLinkedList([2, 1, 4, 3, 5]),
  },
]);
