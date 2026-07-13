import { runTests, TestCase } from "#functions/code-tester.js";
import {
  createLinkedList,
  ListNode,
} from "#functions/linked-list.js";

// LeetCode 206

const myLink = function reverseList(head: ListNode | null): ListNode | null {

  let prev = null;
  let curr = head;

  while(curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  return prev;
};

const ll_inputs: TestCase<typeof myLink>[] = [
  {
    input: [createLinkedList([1, 2, 3, 4, 5])],
    output: createLinkedList([5, 4, 3, 2, 1]),
  },
  {
    input: [createLinkedList([1, 2])],
    output: createLinkedList([2, 1]),
  },
  {
    input: [createLinkedList([])],
    output: createLinkedList([]),
  },
  {
    input: [createLinkedList([1])],
    output: createLinkedList([1]),
  },
];

runTests(myLink, ll_inputs, true);
