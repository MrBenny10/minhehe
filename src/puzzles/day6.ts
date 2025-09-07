import type { Puzzle } from "@/components/CrosswordGame";

export const puzzle: Puzzle = {
  size: 7,
  clues: [
    // Across
    {
      number: 1,
      text: "What greets the early riser (7)",
      direction: "across",
      startRow: 3,
      startCol: 0,
      length: 7,
      solution: "SUNRISE",
    },
    {
      number: 2,
      text: "Quick wash before heading out (6)",
      direction: "across",
      startRow: 6,
      startCol: 0,
      length: 6,
      solution: "SHOWER",
    },

    // Down
    {
      number: 3,
      text: "Breakfast bakery item with jam & cream (5)",
      direction: "down",
      startRow: 0,
      startCol: 2,
      length: 5,
      solution: "SCONE",
    },
    {
      number: 4,
      text: "Soapy foam in the sink or shower (4)",
      direction: "down",
      startRow: 3,
      startCol: 0,
      length: 4,
      solution: "SUDS",
    },
    {
      number: 5,
      text: "Do this to tea or coffee (4)",
      direction: "down",
      startRow: 3,
      startCol: 5,
      length: 4,
      solution: "STIR",
    },
  ],
};
