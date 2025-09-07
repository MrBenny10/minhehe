import type { Puzzle } from "@/components/CrosswordGame";

export const puzzle: Puzzle = {
  size: 13,
  theme: "Coldplay",
  logo: "/lovable-uploads/2e1f1a16-b2f4-465f-892d-62a0aa54e6cb.png", // ✅ your Coldplay logo
  background: (
    <>
      {/* ⭐ Stars */}
      {[...Array(50)].map((_, i) => (
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

      {/* 🌍 Planets */}
      <div className="absolute top-20 left-16 w-16 h-16 rounded-full bg-blue-500 animate-float shadow-2xl" />
      <div className="absolute bottom-24 right-20 w-20 h-20 rounded-full bg-pink-500 animate-float shadow-2xl" />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-yellow-500 animate-float shadow-2xl" />

      {/* 🌌 Nebula */}
      <div className="absolute top-10 left-1/2 w-32 h-32 bg-purple-500/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-blue-500/20 blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-8 w-24 h-24 bg-pink-500/20 blur-3xl animate-pulse" />
    </>
  ),
  clues: [
    { number: 1, text: "2000 single from Parachutes (7)", direction: "across", startRow: 4, startCol: 1, length: 7, solution: "TROUBLE" },
    { number: 2, text: "First word of '___ la Vida' (4)", direction: "across", startRow: 4, startCol: 9, length: 4, solution: "VIVA" },
    { number: 3, text: '"A Sky Full of ___" (5)', direction: "across", startRow: 7, startCol: 7, length: 5, solution: "STARS" },
    { number: 4, text: '"Higher ___" (2021 single) (5)', direction: "down", startRow: 3, startCol: 3, length: 5, solution: "POWER" },
    { number: 5, text: "A Rush of Blood to the Head, for one (5)", direction: "down", startRow: 2, startCol: 5, length: 5, solution: "ALBUM" },
    { number: 6, text: "2021 LP Music of the ___ (7)", direction: "down", startRow: 1, startCol: 7, length: 7, solution: "SPHERES" },
    { number: 7, text: "Desk used to blend audio live/in-studio (5)", direction: "down", startRow: 3, startCol: 10, length: 5, solution: "MIXER" },
    { number: 8, text: "Rihanna collab 'Princess of ___' (2012) (5)", direction: "down", startRow: 0, startCol: 12, length: 5, solution: "CHINA" },
  ],
};
