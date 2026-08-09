import { runTests } from "#functions/code-tester.js";
import { createLinkedList, ListNode } from "#ds/linked-list.js";

// LeetCode 23

const solve = function mergeKLists(
  lists: Array<ListNode | null>,
): ListNode | null {
  let interval = 1;

  while (interval < lists.length) {
    for (let i = 0; i + interval < lists.length; i += interval * 2) {
      lists[i] = mergeTwoLists(lists[i], lists[i + interval]);
    }

    interval *= 2;
  }

  return lists[0] ?? null;

  function mergeTwoLists(
    list1: ListNode | null,
    list2: ListNode | null,
  ): ListNode | null {
    const dummy = new ListNode();
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
  }
};

runTests(solve, [
  {
    input: [
      [
        createLinkedList([1, 2, 4]),
        createLinkedList([1, 3, 5]),
        createLinkedList([3, 6]),
      ],
    ],
    output: createLinkedList([1, 1, 2, 3, 3, 4, 5, 6]),
  },
  {
    input: [[]],
    output: createLinkedList([]),
  },
  {
    input: [[createLinkedList([])]],
    output: createLinkedList([]),
  },
]);
