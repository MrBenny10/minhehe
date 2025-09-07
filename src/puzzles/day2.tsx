import type { Puzzle } from "@/components/CrosswordGame";
import coldplayImg from "@/assets/coldplay.png"; // ✅ add image to src/assets/

export const puzzle: Puzzle = {
  size: 13,
  theme: "Coldplay",
  background: (
    <>
      {/* Animated stars */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Floating planets */}
      <div className="absolute top-20 left-16 w-16 h-16 rounded-full bg-blue-500 animate-float shadow-2xl" />
      <div className="absolute top-32 right-12 w-12 h-12 rounded-full bg-pink-500 animate-float shadow-2xl" />
      <div className="absolute bottom-32 right-20 w-16 h-16 rounded-full bg-red-500 animate-float shadow-2xl" />

      {/* Coldplay logo */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-40">
        <img
          src={coldplayImg}
          alt="Coldplay"
          className="w-32 h-auto opacity-90"
        />
      </div>
    </>
  ),
  clues: [
    // Across
    {
      number: 1,
      text: "2000 single from Parachutes (7)",
      direction: "across",
      startRow: 4,
      startCol: 1,
      length: 7,
      solution: "TROUBLE",
    },
    {
      number: 2,
      text: 'First word of "___ la Vida" (4)',
      direction: "across",
      startRow: 4,
      startCol: 9,
      length: 4,
      solution: "VIVA",
    },
    {
      number: 3,
      text: '"A Sky Full of ___" (5)',
      direction: "across",
      startRow: 7,
      startCol: 7,
      length: 5,
      solution: "STARS",
    },

    // Down
    {
      number: 4,
      text: '"Higher ___" (2021 single) (5)',
      direction: "down",
      startRow: 3,
      startCol: 3,
      length: 5,
      solution: "POWER",
    },
    {
      number: 5,
      text: "A Rush of Blood to the Head, for one (5)",
      direction: "down",
      startRow: 2,
      startCol: 5,
      length: 5,
      solution: "ALBUM",
    },
    {
      number: 6,
      text: "2021 LP Music of the ___ (7)",
      direction: "down",
      startRow: 1,
      startCol: 7,
      length: 7,
      solution: "SPHERES",
    },
    {
      number: 7,
      text: "Desk used to blend audio live/in-studio (5)",
      direction: "down",
      startRow: 3,
      startCol: 10,
      length: 5,
      solution: "MIXER",
    },
    {
      number: 8,
      text: "Rihanna collab 'Princess of ___' (2012) (5)",
      direction: "down",
      startRow: 0,
      startCol: 12,
      length: 5,
      solution: "CHINA",
    },
  ],
};
