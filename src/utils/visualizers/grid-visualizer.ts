import chalk from "chalk";

export type GridMode = "auto" | "board" | "maze" | "binary" | "sudoku" | "numeric" | "chess";

export type MatrixToStringOptions = {
  mode?: GridMode;
};

/**
 * Automatically infers the most appropriate GridMode by inspecting the cells of the matrix.
 */
export function detectGridMode(matrix: any[][]): Exclude<GridMode, "auto"> {
  let stringCount = 0;
  let numberCount = 0;

  let generalLetterCount = 0; // letters other than S, E, X, Q
  let hasMazeMarkers = false; // '#', '*', or isolated 'S'/'E' with maze context
  let hasDigit2Through9 = false;
  let hasBinaryString = false; // '0' or '1'
  let hasSOrE = false;
  let hasChessQueen = false; // 'Q' or 'q'
  let hasNegativeNumbers = false;
  let hasNumberGreaterThanOne = false;

  for (const row of matrix) {
    if (!Array.isArray(row)) continue;
    for (const cell of row) {
      if (cell === null || cell === undefined) continue;

      if (typeof cell === "number") {
        numberCount++;
        if (cell < 0) hasNegativeNumbers = true;
        if (cell > 1) hasNumberGreaterThanOne = true;
      } else if (typeof cell === "string") {
        stringCount++;
        const s = cell.trim();
        if (s === "#" || s === "*") {
          hasMazeMarkers = true;
        } else if (s === "0" || s === "1") {
          hasBinaryString = true;
        } else if (/^[2-9]$/.test(s)) {
          hasDigit2Through9 = true;
        } else if (/^[a-zA-Z]$/.test(s)) {
          const upper = s.toUpperCase();
          if (upper === "S" || upper === "E") {
            hasSOrE = true;
          } else if (upper === "Q") {
            hasChessQueen = true;
          } else if (upper !== "X") {
            generalLetterCount++;
          }
        }
      }
    }
  }

  // 1. If primarily numbers
  if (numberCount > 0 && stringCount === 0) {
    if (!hasNegativeNumbers && !hasNumberGreaterThanOne && numberCount > 0) {
      return "binary"; // 0-1 numeric grid (e.g. islands, rotting oranges)
    }
    return "numeric";
  }

  // 2. If general alphabet letters exist (e.g., A, B, C, D in Word Search / Boggle)
  if (generalLetterCount > 0) {
    return "board";
  }

  // 3. If contains chess queen and dots/empty squares without other alphabet letters
  if (hasChessQueen && generalLetterCount === 0 && !hasMazeMarkers && !hasDigit2Through9 && numberCount === 0) {
    return "chess";
  }

  // 4. If contains digits 2-9 or dots without general letters (e.g., Sudoku)
  if (hasDigit2Through9) {
    return "sudoku";
  }

  // 5. If maze markers like '#' or '*' are present, or S/E with pathfinding context
  if (hasMazeMarkers || hasSOrE) {
    return "maze";
  }

  // 6. If primarily binary strings '0' and '1'
  if (hasBinaryString) {
    return "binary";
  }

  // Fallback
  return "board";
}

/**
 * Colors a matrix cell based on its raw value type and the active grid mode.
 */
export function colorMatrixCell(val: any, str: string, mode: Exclude<GridMode, "auto"> = "board"): string {
  if (val === null || val === undefined) return chalk.dim(str);

  if (typeof val === "boolean") {
    return val
      ? chalk.bold.hex("#55efc4")(str)   // true  ➔ mint green
      : chalk.bold.hex("#ff7675")(str);  // false ➔ warm red
  }

  if (typeof val === "number") {
    if (mode === "binary") {
      if (val === 0) return chalk.hex("#74b9ff")(str);  // water ➔ light blue
      if (val === 1) return chalk.hex("#55efc4")(str);  // land / fresh ➔ mint green
      if (val === 2) return chalk.hex("#fdcb6e")(str);  // rotten / obstacle ➔ amber
    }
    if (val < 0)   return chalk.hex("#ff7675")(str);  // negative ➔ warm red
    if (val === 0) return chalk.hex("#636e72")(str);  // zero     ➔ muted gray
    return chalk.cyan(str);                            // positive ➔ cyan
  }

  if (typeof val === "string") {
    // Mode: "chess" (N-Queens, chessboards)
    if (mode === "chess") {
      const upper = val.toUpperCase();
      if (upper === "Q") {
        return chalk.bold.hex("#f1c40f")(str.replace(/q/gi, "♛"));
      }
      if (val === ".") {
        return chalk.hex("#555f6e")(str.replace(/\./g, "·"));
      }
      return chalk.white(str);
    }

    // Mode: "board" (Word Search, letters, Boggle)
    // S, E, X are regular characters! Only explicit traversal markers remain styled.
    if (mode === "board") {
      switch (val) {
        case ".": return chalk.hex("#555f6e")(str);          // placeholder ➔ dark gray
        case "#": return chalk.hex("#e17055")(str);          // obstacle / backtrack mark ➔ coral red
        case "*": return chalk.hex("#fdcb6e")(str);          // path / visited ➔ amber
        default:
          if (val.length === 1) return chalk.hex("#ffeaa7")(str); // single char ➔ light gold
          return chalk.white(str);
      }
    }

    // Mode: "sudoku" (digits 1-9, empty dots)
    if (mode === "sudoku") {
      if (val === ".") return chalk.hex("#555f6e")(str);      // empty cell ➔ dark gray
      if (/^[0-9]$/.test(val)) return chalk.hex("#ffeaa7")(str); // uniform gold for all digits
      return chalk.white(str);
    }

    // Mode: "binary" (Number of Islands, etc.)
    if (mode === "binary") {
      switch (val) {
        case "0": return chalk.hex("#74b9ff")(str);          // water ➔ light blue
        case "1": return chalk.hex("#55efc4")(str);          // land ➔ mint green
        case "2": return chalk.hex("#fdcb6e")(str);          // obstacle / rotten ➔ amber
        case ".": return chalk.hex("#555f6e")(str);          // dark gray
        default:
          return val.length === 1 ? chalk.hex("#ffeaa7")(str) : chalk.white(str);
      }
    }

    // Mode: "maze" (Pathfinding BFS/DFS)
    if (mode === "maze") {
      switch (val) {
        case ".":  return chalk.hex("#555f6e")(str);          // empty placeholder ➔ dark gray
        case "#":  return chalk.hex("#e17055")(str);          // wall / obstacle   ➔ coral red
        case "*":  return chalk.hex("#fdcb6e")(str);          // path / visited    ➔ amber
        case "0":  return chalk.hex("#74b9ff")(str);          // string zero       ➔ light blue
        case "1":  return chalk.hex("#55efc4")(str);          // string one        ➔ mint green
        case "X":
        case "x":  return chalk.hex("#ff7675")(str);          // blocked / invalid ➔ warm red
        case "S":  return chalk.bold.hex("#00cec9")(str);     // start node        ➔ teal
        case "E":  return chalk.bold.hex("#fd79a8")(str);     // end node          ➔ pink
        default:
          if (val.length === 1) return chalk.hex("#ffeaa7")(str);
          return chalk.white(str);
      }
    }

    // Mode: "numeric"
    if (val.length === 1) return chalk.hex("#ffeaa7")(str);
    return chalk.white(str);
  }

  return chalk.white(str);
}

/**
 * Visualizes a 2D array / matrix grid or 1D string array (as rows) as an aligned ASCII table.
 */
export function matrixToString(
  rawMatrix: any[][] | string[],
  options?: MatrixToStringOptions | GridMode,
): string {
  if (!Array.isArray(rawMatrix) || rawMatrix.length === 0) return "[]";

  // Normalize string[] into char[][]
  const matrix: any[][] = typeof rawMatrix[0] === "string"
    ? (rawMatrix as string[]).map((row) => (typeof row === "string" ? row.split("") : row))
    : (rawMatrix as any[][]);

  if (!Array.isArray(matrix[0])) return JSON.stringify(rawMatrix);

  const rawMode: GridMode = typeof options === "string" ? options : (options?.mode ?? "auto");
  const resolvedMode: Exclude<GridMode, "auto"> =
    rawMode === "auto" ? detectGridMode(matrix) : rawMode;

  const rows = matrix.length;
  const cols = Math.max(...matrix.map((r) => (Array.isArray(r) ? r.length : 0)));
  if (cols === 0) return "[]";

  const colWidths = Array(cols).fill(1);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const valStr = String(matrix[r]?.[c] ?? "");
      colWidths[c] = Math.max(colWidths[c], valStr.length);
    }
  }

  const topBorder = "┌" + colWidths.map((w) => "─".repeat(w + 2)).join("┬") + "┐";
  const midBorder = "├" + colWidths.map((w) => "─".repeat(w + 2)).join("┼") + "┤";
  const botBorder = "└" + colWidths.map((w) => "─".repeat(w + 2)).join("┴") + "┘";

  const lines: string[] = [chalk.gray(topBorder)];

  for (let r = 0; r < rows; r++) {
    const cells = [];
    for (let c = 0; c < cols; c++) {
      const rawVal = matrix[r]?.[c];
      const valStr = String(rawVal ?? "").padStart(colWidths[c]);
      cells.push(` ${colorMatrixCell(rawVal, valStr, resolvedMode)} `);
    }
    lines.push(chalk.gray("│") + cells.join(chalk.gray("│")) + chalk.gray("│"));
    if (r < rows - 1) {
      lines.push(chalk.gray(midBorder));
    }
  }

  lines.push(chalk.gray(botBorder));
  return lines.join("\n");
}

/**
 * Checks if a value is a single NxN chessboard represented as string[].
 */
export function isChessBoard(val: unknown): val is string[] {
  if (!Array.isArray(val) || val.length === 0) return false;
  if (typeof val[0] !== "string") return false;
  const n = val.length;
  let hasQueen = false;
  for (const row of val) {
    if (typeof row !== "string" || row.length !== n) return false;
    for (let i = 0; i < row.length; i++) {
      const c = row[i];
      if (c === "Q" || c === "q") hasQueen = true;
      else if (c !== ".") return false;
    }
  }
  return hasQueen;
}

/**
 * Checks if a value is a collection of NxN chessboards (string[][]).
 */
export function isChessBoardList(val: unknown): val is string[][] {
  if (!Array.isArray(val) || val.length === 0) return false;
  return val.every(isChessBoard);
}

/**
 * Strips ANSI escape codes from a string to measure visible length.
 */
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Visualizes multiple chessboard configurations side-by-side (if terminal width allows) or stacked.
 */
export function chessBoardsToString(boards: string[][], maxBoards = 4): string {
  if (!Array.isArray(boards) || boards.length === 0) return "[]";
  const displayCount = Math.min(boards.length, maxBoards);
  const termWidth = process.stdout.columns || 80;

  const boardBlocks: { header: string; lines: string[]; width: number }[] = [];

  for (let i = 0; i < displayCount; i++) {
    const rawHeader = `Solution ${i + 1} of ${boards.length}:`;
    const header = chalk.gray(rawHeader);
    const rendered = matrixToString(boards[i], { mode: "chess" });
    const lines = rendered.split("\n");
    const boardWidth = Math.max(...lines.map((l) => stripAnsi(l).length));
    const colWidth = Math.max(rawHeader.length, boardWidth);
    boardBlocks.push({ header, lines, width: colWidth });
  }

  const GAP = 4;
  const totalWidth = boardBlocks.reduce((acc, b) => acc + b.width, 0) + (boardBlocks.length - 1) * GAP;

  const resultLines: string[] = [];

  if (totalWidth <= termWidth) {
    // Render side-by-side
    const headerLine = boardBlocks
      .map((b) => b.header + " ".repeat(Math.max(0, b.width - stripAnsi(b.header).length)))
      .join(" ".repeat(GAP));
    resultLines.push(headerLine);

    const maxLines = Math.max(...boardBlocks.map((b) => b.lines.length));
    for (let r = 0; r < maxLines; r++) {
      const rowLine = boardBlocks
        .map((b) => {
          const l = b.lines[r] ?? "";
          const visibleLen = stripAnsi(l).length;
          const padLen = Math.max(0, b.width - visibleLen);
          return l + " ".repeat(padLen);
        })
        .join(" ".repeat(GAP));
      resultLines.push(rowLine);
    }
  } else {
    // Stack vertically
    for (let i = 0; i < boardBlocks.length; i++) {
      const b = boardBlocks[i];
      resultLines.push(b.header);
      resultLines.push(...b.lines);
      if (i < boardBlocks.length - 1) {
        resultLines.push("");
      }
    }
  }

  if (boards.length > displayCount) {
    resultLines.push("");
    resultLines.push(chalk.gray(`... and ${boards.length - displayCount} more solution(s)`));
  }

  return resultLines.join("\n");
}
