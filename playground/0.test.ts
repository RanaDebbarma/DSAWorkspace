import { runTests, TestCase } from "#functions/code-tester.js";
import {
  compareLinkedLists,
  createLinkedList,
  ListNode,
} from "#functions/linked-list.js";

// LeetCode 21

const myLink = function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null,
): ListNode | null {
  return list1;
};

const ll_inputs: TestCase<typeof myLink>[] = [
  {
    input: [createLinkedList([1, 2, 4]), createLinkedList([1, 3, 4])],
    output: createLinkedList([1, 1, 2, 3, 4, 4]),
    compare: compareLinkedLists,
  },
  {
    input: [createLinkedList([]), createLinkedList([])],
    output: createLinkedList([]),
    compare: compareLinkedLists,
  },
  {
    input: [createLinkedList([]), createLinkedList([0])],
    output: createLinkedList([0]),
    compare: compareLinkedLists,
  },
];

runTests(myLink, ll_inputs, true);
