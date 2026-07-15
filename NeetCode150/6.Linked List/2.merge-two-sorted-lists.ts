import { runTests } from "#functions/code-tester.js";
import { createLinkedList, ListNode } from "#functions/linked-list.js";

// LeetCode 21

function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null,
): ListNode | null {
  // ---------------------- Approach 1 ------------------
  if (!list1) return list2;
  if (!list2) return list1;
  
  const dummy = new ListNode(0);
  let curr = dummy;

  while (list1 && list2) {
    if (list1.val <= list2.val) {
      curr.next = list1;
      list1 = list1.next;
    } else {
      curr.next = list2;
      list2 = list2.next;
    }
    curr = curr.next;
  }

  curr.next = list1 ?? list2;

  return dummy.next;

  // ---------------------- Approach 1 ------------------
}

runTests(
  mergeTwoLists,
  [
    {
      input: [createLinkedList([1, 2, 4]), createLinkedList([1, 3, 4])],
      output: createLinkedList([1, 1, 2, 3, 4, 4]),
    },
    {
      input: [createLinkedList([]), createLinkedList([])],
      output: createLinkedList([]),
    },
    {
      input: [createLinkedList([]), createLinkedList([0])],
      output: createLinkedList([0]),
    },
    {
      input: [createLinkedList([0]), createLinkedList([0])],
      output: createLinkedList([0, 0]),
    },
  ],
  true,
);
