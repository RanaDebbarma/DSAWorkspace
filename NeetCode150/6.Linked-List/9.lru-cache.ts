import { runClassTests } from "#functions/code-tester.js";

// LeetCode 146

// Production (without linkedlists)
// class LRUCache {
//     private capacity: number;
//     private cache: Map<number, number>;

//     constructor(capacity: number) {
//         this.capacity = capacity;
//         this.cache = new Map();
//     }

//     get(key: number): number {
//         if (!this.cache.has(key)) return -1;

//         const val = this.cache.get(key)!;
//         // Re-insert to update usage order
//         this.cache.delete(key);
//         this.cache.set(key, val);
//         return val;
//     }

//     put(key: number, value: number): void {
//         if (this.cache.has(key)) {
//             this.cache.delete(key);
//         }

//         this.cache.set(key, value);

//         // Evict first (oldest) entry if full
//         if (this.cache.size > this.capacity) {
//             const lruKey = this.cache.keys().next().value!;
//             this.cache.delete(lruKey);
//         }
//     }
// }

// Optimzed -------------- (Custom Doubly Linked List)
class CacheNode {
    key: number;
    value: number;
    prev: CacheNode | null = null;
    next: CacheNode | null = null;

    constructor(key: number, value: number) {
        this.key = key;
        this.value = value;
    }
}

class LRUCache {
    private capacity: number;
    private cache: Map<number, CacheNode>;
    private head: CacheNode;
    private tail: CacheNode;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map();

        // Dummy head and tail nodes to simplify edge cases
        this.head = new CacheNode(0, 0);
        this.tail = new CacheNode(0, 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private remove(node: CacheNode): void {
        const prevNode = node.prev!;
        const nextNode = node.next!;
        prevNode.next = nextNode;
        nextNode.prev = prevNode;
    }

    private addToTail(node: CacheNode): void {
        const prevNode = this.tail.prev!;
        prevNode.next = node;
        node.prev = prevNode;
        node.next = this.tail;
        this.tail.prev = node;
    }

    get(key: number): number {
        if (!this.cache.has(key)) {
            return -1;
        }

        const node = this.cache.get(key)!;
        // Move accessed node to the end (Most Recently Used)
        this.remove(node);
        this.addToTail(node);

        return node.value;
    }

    put(key: number, value: number): void {
        if (this.cache.has(key)) {
            // Remove existing node before updating
            this.remove(this.cache.get(key)!);
        }

        const newNode = new CacheNode(key, value);
        this.cache.set(key, newNode);
        this.addToTail(newNode);

        // Evict Least Recently Used (LRU) node if capacity exceeded
        if (this.cache.size > this.capacity) {
            const lruNode = this.head.next!;
            this.remove(lruNode);
            this.cache.delete(lruNode.key);
        }
    }
}

runClassTests(LRUCache, [
  {
    operations: [
      "LRUCache",
      "put",
      "put",
      "get",
      "put",
      "get",
      "put",
      "get",
      "get",
      "get",
    ],
    args: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
    expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
  },
]);
