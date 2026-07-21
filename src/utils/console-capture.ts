import chalk from "chalk";
import { formatWithOptions, inspect, type InspectOptions } from "node:util";

export type CapturedExecution<T> = {
  logs: string[];
  value?: T;
  error?: unknown;
};

export function captureConsoleOutput<T>(callback: () => T): CapturedExecution<T> {
  const logs: string[] = [];
  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    dir: console.dir,
  };

  const capture = (...args: unknown[]) => {
    logs.push(formatWithOptions({ colors: chalk.level > 0 }, ...args));
  };

  console.log = capture;
  console.info = capture;
  console.warn = capture;
  console.error = capture;
  console.dir = (item?: unknown, options?: InspectOptions) => {
    logs.push(inspect(item, { colors: chalk.level > 0, ...options }));
  };

  try {
    return { logs, value: callback() };
  } catch (error) {
    return { logs, error };
  } finally {
    console.log = original.log;
    console.info = original.info;
    console.warn = original.warn;
    console.error = original.error;
    console.dir = original.dir;
  }
}

export function printConsoleOutput(logs: string[]) {
  if (logs.length === 0) return;

  console.log();
  console.log(`${chalk.grey("Console:")}`);
  for (const entry of logs) {
    for (const line of entry.split("\n")) {
      console.log(`  ${line}`);
    }
  }
}
