import { runClassTests } from "#functions/code-tester.js";

// LeetCode 981

class TimeMap {
  private keyStore: Map<string, [number, string][]>;

  constructor() {
    this.keyStore = new Map();
  }

  set(key: string, value: string, timestamp: number): void {
    const entries = this.keyStore.get(key);

    if (entries) {
      entries.push([timestamp, value]);
    } else {
      this.keyStore.set(key, [[timestamp, value]]);
    }
  }

  get(key: string, timestamp: number): string {
    const entries = this.keyStore.get(key);
    if (!entries) return "";

    const idx = this.binarySearch(entries, timestamp);
    if (idx === -1) return "";

    return entries[idx][1];
  }

  private binarySearch(arr: [number, string][], target: number): number {
    let ans = -1;
    let l = 0;
    let r = arr.length - 1;

    while (l <= r) {
      // const mid = l + Math.floor((r - l) / 2);
      const mid = (l + r) >> 1;

      if (arr[mid][0] <= target) {
        ans = mid;
        l = mid + 1;
      } else {
        r = mid - 1;
      }
    }

    return ans;
  }
}

runClassTests(TimeMap, [
  {
    operations: ["TimeMap", "set", "get", "get", "set", "get", "get"],
    args: [
      [],
      ["foo", "bar", 1],
      ["foo", 1],
      ["foo", 3],
      ["foo", "bar2", 4],
      ["foo", 4],
      ["foo", 5],
    ],
    expected: [null, null, "bar", "bar", null, "bar2", "bar2"],
  },
  {
    operations: ["TimeMap", "set", "get", "get", "set", "get"],
    args: [
      [],
      ["alice", "happy", 1],
      ["alice", 1],
      ["alice", 2],
      ["alice", "sad", 3],
      ["alice", 3],
    ],
    expected: [null, null, "happy", "happy", null, "sad"],
  },
]);
