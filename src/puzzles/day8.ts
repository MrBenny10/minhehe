import type Puzzle from "@/components/CrosswordGame";

export const puzzle: Puzzle = {
  size: 7,
  clues: [
    // Across
    {
      number: 7,
      text: "Prefix in yoga practice meaning \"eight,\" as in ____nga.",
      direction: "across",
      startRow: 2,
      startCol: 0,
      length: 5,
      solution: "ASHTA",
    },
    {
      number: 15,
      text: "Compound move that hammers quads, glutes, and core.",
      direction: "across",
      startRow: 4,
      startCol: 0,
      length: 6,
      solution: "SQUATS",
    },
    {
      number: 21,
      text: "Diet plan high in fat and low in carbs, popular in weight loss circles.",
      direction: "across",
      startRow: 6,
      startCol: 3,
      length: 4,
      solution: "KETO",
    },
    // Down
    {
      number: 1,
      text: "Thigh muscles that burn on leg day.",
      direction: "down",
      startRow: 0,
      startCol: 0,
      length: 4,
      solution: "QUADS",
    },
    {
      number: 2,
      text: "Place to recover with steam after a heavy workout.",
      direction: "down",
      startRow: 0,
      startCol: 4,
      length: 3,
      solution: "SPA",
    },
    {
      number: 3,
      text: "Fitness goal often paired with \"muscle.\"",
      direction: "down",
      startRow: 0,
      startCol: 6,
      length: 4,
      solution: "TONE",
    },
    {
      number: 10,
      text: "Oval where sprinters push for personal bests.",
      direction: "down",
      startRow: 2,
      startCol: 3,
      length: 5,
      solution: "TRACK",
    },
  ],
};