import type { Puzzle } from "@/components/CrosswordGame";

export const puzzle: Puzzle = {
  size: 13, // 13 cols × 8 rows
  clues: [
    // Across
    {
      number: 1,
      text: "Cream-filled pastries with chocolate topping (7)",
      direction: "across",
      startRow: 4, // row 5, col 2 → 0-indexed = (4,1)
      startCol: 1,
      length: 7,
      solution: "ECLAIRS",
    },
    {
      number: 2,
      text: "Open-faced pastry with fruit or custard (4)",
      direction: "across",
      startRow: 4, // row 5, col 10 → 0-indexed = (4,9)
      startCol: 9,
      length: 4,
      solution: "TART",
    },
    {
      number: 3,
      text: "Pearled starch used in some puddings (4)",
      direction: "across",
      startRow: 7, // row 8, col 8 → 0-indexed = (7,7)
      startCol: 7,
      length: 4,
      solution: "SAGO",
    },

    // Down
    {
      number: 4,
      text: "Shiny sugar coating (5)",
      direction: "down",
      startRow: 3, // row 4, col 4 → 0-indexed = (3,3)
      startCol: 3,
      length: 5,
      solution: "GLAZE",
    },
    {
      number: 5,
      text: "Sweet topping spread on cakes (5)",
      direction: "down",
      startRow: 2, // row 3, col 6 → 0-indexed = (2,5)
      startCol: 5,
      length: 5,
      solution: "ICING",
    },
    {
      number: 6,
      text: "Airy whipped desserts (7)",
      direction: "down",
      startRow: 1, // row 2, col 8 → 0-indexed = (1,7)
      startCol: 7,
      length: 7,
      solution: "MOUSSES",
    },
    {
      number: 7,
      text: "Bean behind chocolate (5)",
      direction: "down",
      startRow: 3, // row 4, col 11 → 0-indexed = (3,10)
      startCol: 10,
      length: 5,
      solution: "CACAO",
    },
    {
      number: 8,
      text: "Ring-shaped fried treat (5)",
      direction: "down",
      startRow: 0, // row 1, col 13 → 0-indexed = (0,12)
      startCol: 12,
      length: 5,
      solution: "DONUT",
    },
  ],
};
