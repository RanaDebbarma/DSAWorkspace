import { runTests, TestCase } from "#functions/code-tester.js";
import { createLinkedList, ListNode, printLinkedList } from "#functions/linked-list.js";

// LeetCode 21

const myLink = function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null,
): ListNode | null {
  const dummy = new ListNode(0);
  let tail = dummy;

  while (list1 && list2) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }

  tail.next = list1 ?? list2;
  
  return dummy.next;
}

const ll_inputs: TestCase<typeof myLink>[] = [
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
];

runTests(myLink, ll_inputs, true);
