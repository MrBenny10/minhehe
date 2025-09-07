import type { Puzzle } from "@/components/CrosswordGame";

export const puzzle: Puzzle = {
  size: 7,
  clues: [
    // Across
    {
      number: 1,
      text: "Runway seen at fashion week (7)",
      direction: "across",
      startRow: 3,
      startCol: 0,
      length: 7,
      solution: "CATWALK",
    },
    {
      number: 2,
      text: "Psychedelic fabric style (6)",
      direction: "across",
      startRow: 6,
      startCol: 0,
      length: 6,
      solution: "TIEDYE",
    },

    // Down
    {
      number: 3,
      text: "Fashion footwear staple (5)",
      direction: "down",
      startRow: 0,
      startCol: 2,
      length: 5,
      solution: "BOOTS",
    },
    {
      number: 4,
      text: "Outerwear garment (4)",
      direction: "down",
      startRow: 3,
      startCol: 0,
      length: 4,
      solution: "COAT",
    },
    {
      number: 5,
      text: "Delicate openwork fabric (4)",
      direction: "down",
      startRow: 3,
      startCol: 5,
      length: 4,
      solution: "LACE",
    },
  ],
};
