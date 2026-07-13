// Bucket sort yt
// function topKFrequent(nums, k) {
//   let map = {}
//   let bucket = []
//   let result = []

//   for (let i = 0; i < nums.length; i++) {
//     if (!map[nums[i]]) {
//       map[nums[i]] = 1
//     } else {
//       map[nums[i]]++
//     }
//   }

//   for (let [num, freq] of Object.entries(map)) {
//     if (!bucket[freq]) {
//       bucket[freq] = new Set().add(num)
//     } else {
//       bucket[freq] = bucket[freq].add(num)
//     }
//   }

//   console.log(bucket)

//   for (let i = bucket.length - 1; i >= 0; i--) {
//     if (bucket[i]) result.push(...bucket[i]);
//     if (result.length === k) break;
//   }

//   return result
// }

// Qwen 3.5
function topKFrequent(nums, k) {
  // Step 1: Count frequencies using a Map (O(n))
  const map = new Map();
  for (const num of nums) {
    map.set(num, (map.get(num) || 0) + 1);
  }

  const result = [];

  // Step 2: Prepare Buckets
  // The index represents the frequency. 
  // Since max frequency <= nums.length, we need size nums.length + 1.
  const buckets = new Array(nums.length + 1).fill(null).map(() => []);
    
  for (const [num, count] of map.entries()) {
    buckets[count].push(num);
  }

  console.log(buckets)
    
  // Step 3: Collect results from highest frequency down (O(n))
  // We iterate backwards from max possible frequency to 1.
  for (let i = nums.length; i > 0; i--) {
    if (buckets[i].length === 0) continue; // Skip empty buckets

    const currentBucket = buckets[i];
    
    // Add up to k elements remaining needed
    let countToAdd = Math.min(currentBucket.length, k - result.length);
    
    for (let j = 0; j < countToAdd; j++) {
      result.push(currentBucket[j]);
      
      // If we have collected enough, stop early
      if (result.length === k) break;
    }

    // Stop immediately if we have found k elements
    if (result.length === k) break;
  }

  return result;
}

let nums = [1, 2, 2, 3, 3, 3];
let k = 2;
console.log(topKFrequent(nums, k)); // [2, 3]

nums = [7, 7];
k = 1;
// console.log(topKFrequent(nums, k)); // [7]