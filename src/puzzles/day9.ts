import type { Puzzle } from "@/components/CrosswordGame";

export const puzzle: Puzzle = {
  size: 9, // big enough to fit BARCELONA
  clues: [
    // Across
    {
      number: 2,
      text: "Famous for pintxos.",
      direction: "across",
      startRow: 0,
      startCol: 0,
      length: 9,
      solution: "BARCELONA",
    },
    {
      number: 4,
      text: "Famous for red buses.",
      direction: "across",
      startRow: 4,
      startCol: 0,
      length: 6,
      solution: "LONDON",
    },
    {
      number: 5,
      text: "Rough UK city with a bad accent.",
      direction: "across",
      startRow: 6,
      startCol: 0,
      length: 6,
      solution: "BOLTON",
    },

    // Down
    {
      number: 1,
      text: "Famous for trams & hills.",
      direction: "down",
      startRow: 0,
      startCol: 0,
      length: 6,
      solution: "LISBON",
    },
    {
      number: 3,
      text: "Famous for love.",
      direction: "down",
      startRow: 0,
      startCol: 2, // intersects with R in BARCELONA
      length: 5,
      solution: "PARIS",
    },
    {
      number: 6,
      text: "Nordic capital.",
      direction: "down",
      startRow: 6,
      startCol: 1, // intersects with O in BOLTON
      length: 4,
      solution: "OSLO",
    },
  ],
};
