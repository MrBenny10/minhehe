import type { Puzzle } from "@/components/CrosswordGame";

export const puzzle: Puzzle = {
  size: 13, // 13 cols × 8 rows
  clues: [
    // Across
    {
      number: 1,
      text: "Curly cheese-flavoured corn snack brand (7)",
      direction: "across",
      startRow: 4, // row 5, col 2 → 0-indexed = (4,1)
      startCol: 1,
      length: 7,
      solution: "QUAVERS",
    },
    {
      number: 2,
      text: "First half of a tangy classic (4)",
      direction: "across",
      startRow: 4, // row 5, col 10 → 0-indexed = (4,9)
      startCol: 9,
      length: 4,
      solution: "SALT",
    },
    {
      number: 3,
      text: 'Very plain crisps are "___" salted (5)',
      direction: "across",
      startRow: 7, // row 8, col 8 → 0-indexed = (7,7)
      startCol: 7,
      length: 5,
      solution: "READY",
    },

    // Down
    {
      number: 4,
      text: "Smoky flavour you'll find on crisps (5)",
      direction: "down",
      startRow: 3, // row 4, col 4 → 0-indexed = (3,3)
      startCol: 3,
      length: 5,
      solution: "BACON",
    },
    {
      number: 5,
      text: "Giant UK crisps brand (7)",
      direction: "down",
      startRow: 0, // row 1, col 6 → 0-indexed = (0,5)
      startCol: 5,
      length: 7,
      solution: "WALKERS",
    },
    {
      number: 6,
      text: "___ Munch, pickled onion favourite (7)",
      direction: "down",
      startRow: 1, // row 2, col 8 → 0-indexed = (1,7)
      startCol: 7,
      length: 7,
      solution: "MONSTER",
    },
    {
      number: 7,
      text: "Lighter style in a Walkers range (5)",
      direction: "down",
      startRow: 3, // row 4, col 11 → 0-indexed = (3,10)
      startCol: 10,
      length: 5,
      solution: "BAKED",
    },
    {
      number: 8,
      text: "Triangular tortilla chips brand (7)",
      direction: "down",
      startRow: 0, // row 1, col 13 → 0-indexed = (0,12)
      startCol: 12,
      length: 7,
      solution: "DORITOS",
    },
  ],
};
