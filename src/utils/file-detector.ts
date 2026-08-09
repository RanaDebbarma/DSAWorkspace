import fs from "node:fs";
import path from "node:path";

export interface DetectedFile {
  relativePath: string;
  absolutePath: string;
  mtime: number;
  isInTargetDir: boolean;
}

/** Find the root directory of the workspace (where package.json or .git resides) */
export function getWorkspaceRoot(startDir: string = process.cwd()): string {
  let curr = path.resolve(startDir);
  while (curr) {
    if (fs.existsSync(path.join(curr, "package.json")) || fs.existsSync(path.join(curr, ".git"))) {
      return curr;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return path.resolve(startDir);
}

/** Recursively find all .ts files in the workspace, sorted by mtime (newest first). */
export function findWorkspaceTsFiles(
  targetDir: string = process.cwd(),
  options: { includeSrc?: boolean } = {}
): DetectedFile[] {
  const wsRoot = getWorkspaceRoot(targetDir);
  const results: DetectedFile[] = [];

  const ignoreDirs = new Set(["node_modules", ".git", ".next", "dist", "build", "coverage", ".gemini", ".vscode"]);
  if (!options.includeSrc) {
    ignoreDirs.add("src");
  }

  const normalizedTargetDir = path.resolve(targetDir).toLowerCase();

  function scan(dir: string) {
    if (!fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!ignoreDirs.has(entry.name)) {
            scan(fullPath);
          }
        } else if (entry.isFile()) {
          if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
            try {
              const stat = fs.statSync(fullPath);
              const abs = path.resolve(fullPath);
              const rel = path.relative(wsRoot, abs).replace(/\\/g, "/");
              const inTargetDir = path.dirname(abs).toLowerCase() === normalizedTargetDir;

              results.push({
                relativePath: rel,
                absolutePath: abs,
                mtime: stat.mtimeMs,
                isInTargetDir: inTargetDir,
              });
            } catch {
              // skip unstatable file
            }
          }
        }
      }
    } catch {
      // skip unreadable directory
    }
  }

  scan(wsRoot);

  // Sort: most recently modified first (the file you're actively working on floats to top)
  results.sort((a, b) => b.mtime - a.mtime);

  return results;
}
