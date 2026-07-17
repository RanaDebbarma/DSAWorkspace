import { runTests } from "#functions/code-tester.js";
import { createLinkedList, ListNode } from "#functions/linked-list.js";

// LeetCode 19

// first approach
// function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
//   let size = 0;
//   let curr = head;
//   while (curr) {
//     curr = curr.next;
//     size++;
//   }

//   if (size - n === 0) {
//     return head ? head.next : null;
//   }

//   let i = 0;
//   curr = head;
//   let prev = null;
//   while (i < size - n) {
//     prev = curr;
//     curr = curr!.next;
//     i++;
//   }

//   if (prev && curr) {
//     prev.next = curr.next;
//   }

//   return head;
// }

// better approach
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);

  let left: ListNode | null = dummy;
  let right: ListNode | null = dummy;

  // Create a gap of n nodes between left and right
  for (let i = 0; i < n; i++) {
    right = right!.next;
  }

  // Move both pointers until right reaches the last node
  while (right?.next) {
    left = left!.next;
    right = right.next;
  }

  // left.next is the node to remove
  left!.next = left!.next!.next;

  return dummy.next;
}

runTests(removeNthFromEnd, [
  {
    input: [createLinkedList([1, 2, 3, 4, 5]), 2],
    output: createLinkedList([1, 2, 3, 5]),
  },
  {
    input: [createLinkedList([1]), 1],
    output: createLinkedList([]),
  },
  {
    input: [createLinkedList([1, 2]), 1],
    output: createLinkedList([1]),
  },
  {
    input: [createLinkedList([1, 2, 3]), 3],
    output: createLinkedList([2, 3]),
  },
]);
