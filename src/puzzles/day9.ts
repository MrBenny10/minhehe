import type { Puzzle } from "@/components/CrosswordGame";

export const puzzle: Puzzle = {
  size: 7,
  clues: [
    // Across
    {
      number: 4,
      text: "Core exercise where you hold a push-up position.",
      direction: "across",
      startRow: 1,
      startCol: 1,
      length: 5,
      solution: "PLANK",
    },
    {
      number: 9,
      text: "Machine used for cardiovascular workouts, simulates running indoors.",
      direction: "across",
      startRow: 3,
      startCol: 0,
      length: 9,
      solution: "TREADMILL",
    },
    {
      number: 14,
      text: "Weightlifting movement: bench ___",
      direction: "across",
      startRow: 5,
      startCol: 2,
      length: 5,
      solution: "PRESS",
    },

    // Down
    {
      number: 1,
      text: "Common warm-up activity, also a cardio workout.",
      direction: "down",
      startRow: 0,
      startCol: 2,
      length: 3,
      solution: "RUN",
    },
    {
      number: 2,
      text: "Essential nutrient, builds muscle mass.",
      direction: "down",
      startRow: 0,
      startCol: 5,
      length: 7,
      solution: "PROTEIN",
    },
    {
      number: 3,
      text: "Cool-down exercise often involves stretching this.",
      direction: "down",
      startRow: 2,
      startCol: 6,
      length: 4,
      solution: "LEGS",
    },
  ],
};
