import { runTests } from "#functions/code-tester.js";
import { Node, createRandomList } from "#functions/linked-list.js";

// LeetCode 138

function copyRandomList(head: Node | null): Node | null {
  if (!head) return null;

  // Step 1: Create interleaved cloned nodes (A -> A' -> B -> B')
  let curr: Node | null = head;
  while (curr) {
    const clone: Node = new Node(curr.val);
    clone.next = curr.next;
    curr.next = clone;
    curr = clone.next;
  }

  // Step 2: Assign random pointers for cloned nodes
  curr = head;
  while (curr) {
    const clone: Node = curr.next!;
    if (curr.random) {
      clone.random = curr.random.next;
    }
    curr = clone.next;
  }

  // Step 3: De-interleave the two lists
  const dummy = new Node(0);
  let cloneTail: Node | null = dummy;
  curr = head;
  while (curr) {
    const clone: Node = curr.next!;
    curr.next = clone.next;

    cloneTail.next = clone;
    cloneTail = clone;

    curr = curr.next;
  }

  return dummy.next;
}

runTests(copyRandomList, [
  {
    input: [createRandomList([[7, null], [13, 0], [11, 4], [10, 2], [1, 0]])],
    output: createRandomList([[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]),
  },
  {
    input: [createRandomList([[1, 1], [2, 1]])],
    output: createRandomList([[1, 1], [2, 1]]),
  },
  {
    input: [createRandomList([[3, null], [3, 0], [3, null]])],
    output: createRandomList([[3, null], [3, 0], [3, null]]),
  }
]);

