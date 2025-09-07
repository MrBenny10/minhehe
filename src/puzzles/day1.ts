import type { Puzzle } from "@/components/CrosswordGame";

export const puzzle: Puzzle = {
  size: 13, // 13 cols × 8 rows
  theme: "London",
  background: undefined, // ✅ keep default background
  clues: [
    // Across
    {
      number: 1,
      text: "Area home to Borough Market (7)",
      direction: "across",
      startRow: 4,
      startCol: 1,
      length: 7,
      solution: "BOROUGH",
    },
    {
      number: 2,
      text: "West End nightlife district (4)",
      direction: "across",
      startRow: 4,
      startCol: 9,
      length: 4,
      solution: "SOHO",
    },
    {
      number: 3,
      text: "Scotland ___ (Met Police HQ) (4)",
      direction: "across",
      startRow: 7,
      startCol: 7,
      length: 4,
      solution: "YARD",
    },

    // Down
    {
      number: 4,
      text: "___ Lane, Covent Garden street (5)",
      direction: "down",
      startRow: 3,
      startCol: 3,
      length: 5,
      solution: "DRURY",
    },
    {
      number: 5,
      text: 'Word before "Bank" on the Thames (5)',
      direction: "down",
      startRow: 2,
      startCol: 5,
      length: 5,
      solution: "SOUTH",
    },
    {
      number: 6,
      text: "North London area & Tube station (7)",
      direction: "down",
      startRow: 1,
      startCol: 7,
      length: 7,
      solution: "ARCHWAY",
    },
    {
      number: 7,
      text: "Currency used in London (5)",
      direction: "down",
      startRow: 3,
      startCol: 10,
      length: 5,
      solution: "POUND",
    },
    {
      number: 8,
      text: "BBC broadcast medium (5)",
      direction: "down",
      startRow: 0,
      startCol: 12,
      length: 5,
      solution: "RADIO",
    },
  ],
};
