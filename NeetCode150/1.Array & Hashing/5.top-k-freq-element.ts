import { runTests, TestCase } from "#functions/code-tester.js";

// O(nlogn) due to sorting
// function topKFrequent(nums: number[], k: number): number[] {
//   const count = new Map<number, number>();

//   for (const num of nums) {
//     count.set(num, (count.get(num) || 0) + 1);
//   }

//   const res = [...count.entries()]
//     .sort((a, b) => b[1] - a[1])
//     .map((e) => e[0])
//     .slice(0, k);

//   return res;
// }

// optimal bucket sort approach for o(n) complexity
function topKFrequent(nums: number[], k: number): number[] {
  const result: number[] = [];
  const frequencyMap = new Map<number, number>();
  // const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);

  // better bucket initialization
  const buckets: number[][] = new Array(nums.length + 1);
  for (let i = 0; i < buckets.length; i++) {
    buckets[i] = [];
  }

  // count frequency
  for (const num of nums) {
    frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
  }

  // populate buckets
  frequencyMap.forEach((freq, num) => {
    buckets[freq].push(num);
  });

  // extract top k elements
  for (let i = buckets.length - 1; i >= 0; i--) {
    for (const num of buckets[i]) {
      result.push(num);
      if (result.length === k) return result;
    }
  }

  return result;
}

// o(nlogk) priority queue
class MinHeap {
  // Array stores tuples of [num, frequency]
  private heap: [number, number][] = [];

  push(val: [number, number]) {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      // Compare frequencies (index 1 of the tuple)
      if (this.heap[index][1] >= this.heap[parentIndex][1]) break;
    }
  }
}

// function topKFrequent(nums: number[], k: number): number[] {
//   const freqMap = new Map<number, number>();

//   // count frequencies -> o(n)
//   for (const num of nums) {
//     freqMap.set(num, (freqMap.get(num) || 0) + 1);
//   }

//   const minHeap = new MinHeap();
// }

const inputs: TestCase<typeof topKFrequent>[] = [
  { input: [[1, 1, 1, 2, 2, 3], 2], output: [1, 2] },
  { input: [[1], 1], output: [1] },
  { input: [[1, 2, 1, 2, 1, 2, 3, 1, 3, 2], 2], output: [1, 2] },
  // { input: [[4, 4, 5, 5, 6, 6], 1], output: [4] },
];

runTests(topKFrequent, inputs);
