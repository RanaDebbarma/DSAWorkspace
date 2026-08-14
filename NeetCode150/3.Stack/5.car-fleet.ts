import { runTests } from "#functions/code-tester.js";

// LeetCode 853

function carFleet(target: number, position: number[], speed: number[]): number {
  // Store each car as [position, time needed to reach the target].
  const cars = position
    .map((pos, i) => [pos, (target - pos) / speed[i]] as [number, number])

    // Process cars from closest to the target → farthest.
    .sort((a, b) => b[0] - a[0]);

  let fleets = 0;

  // Time taken by the fleet currently in front.
  let fleetTime = 0;

  // Since cars are ordered closest → farthest,
  // each car can only catch a fleet that is ahead of it.
  for (const [_, time] of cars) {
    // If this car takes longer than the fleet ahead,
    // it cannot catch that fleet → it forms a new fleet.
    if (time > fleetTime) {
      fleetTime = time;
      fleets++;
    }

    // Otherwise, time <= fleetTime:
    // this car catches up to the fleet ahead and becomes part of it.
  }

  return fleets;
}

// same but different
/*
function carFleet(target: number, position: number[], speed: number[]): number {
  const cars: [number, number][] = [];

  for (let i = 0; i < position.length; i++) {
    cars.push([position[i], speed[i]]);
  }

  cars.sort((a, b) => b[0] - a[0]);

  let fleets = 0;
  let fleetTime = 0;

  for (const [pos, spd] of cars) {
    const time = (target - pos) / spd;

    if (time > fleetTime) {
      fleetTime = time;
      fleets++;
    }
  }

  return fleets;
}
*/

runTests(carFleet, [
  { input: [12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]], output: 3 },
  { input: [10, [3], [3]], output: 1 },
  { input: [100, [0, 2, 4], [4, 2, 1]], output: 1 },
  // { input: [10, [1, 4], [3, 2]], output: 1 },
  { input: [10, [4, 1, 0, 7], [2, 2, 1, 1]], output: 3 },

  // edge
  { input: [10, [0, 5, 8], [10, 1, 2]], output: 2 },
]);
