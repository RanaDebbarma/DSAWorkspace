import { runTests } from "#functions/code-tester.js";
import { createLinkedList, ListNode } from "#functions/linked-list.js";

// LeetCode 2

const solve = function addTwoNumbers(
  l1: ListNode | null,
  l2: ListNode | null,
): ListNode | null {
  const dummy = new ListNode();
  let curr = dummy;
  let carry = 0;

  while (l1 || l2 || carry) {
    const val1 = l1 ? l1.val : 0;
    const val2 = l2 ? l2.val : 0;

    const sum = val1 + val2 + carry;
    carry = Math.trunc(sum / 10);

    curr.next = new ListNode(sum % 10);
    curr = curr.next;

    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }

  return dummy.next;
};

runTests(solve, [
  {
    input: [createLinkedList([2, 4, 3]), createLinkedList([5, 6, 4])],
    output: createLinkedList([7, 0, 8]),
  },
  {
    input: [createLinkedList([0]), createLinkedList([0])],
    output: createLinkedList([0]),
  },
  {
    input: [createLinkedList([9, 9]), createLinkedList([9, 9])],
    output: createLinkedList([8, 9, 1]),
  },
  {
    input: [
      createLinkedList([9, 9, 9, 9, 9, 9, 9]),
      createLinkedList([9, 9, 9, 9]),
    ],
    output: createLinkedList([8, 9, 9, 9, 0, 0, 0, 1]),
  },
]);
