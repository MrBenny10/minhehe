import React, { useState, useCallback, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { CrosswordGrid } from "@/components/CrosswordGrid";
import { CluesPanel } from "@/components/CluesPanel";
import { GameTimer } from "@/components/GameTimer";
import { GameControls } from "@/components/GameControls";
import { CompletionModal } from "@/components/CompletionModal";
import { cn } from "@/lib/utils";
import minHeheLogoSrc from "@/assets/minhehe-logo.png";

/* ✅ Types */
export type Clue = {
  number: number;
  text: string;
  direction: "across" | "down";
  startRow: number;
  startCol: number;
  length: number;
  solution: string;
};

export type Cell = {
  id: string;
  row: number;
  col: number;
  value: string;
  answer: string;
  isBlocked: boolean;
  number?: number;
};

export type Puzzle = {
  size: number;
  clues: Clue[];
  theme?: string;
  background?: React.ReactNode;
  logo?: string; // optional logo image
};

interface CrosswordGameProps {
  day: number;
  puzzle: Puzzle;
}

const CrosswordGame: React.FC<CrosswordGameProps> = ({ day, puzzle }) => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showingErrors, setShowingErrors] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [currentClue, setCurrentClue] = useState<Clue | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // === Initialize grid ===
  const initializeGrid = useCallback(() => {
    const newCells: Cell[] = [];
    const gridSize = puzzle.size;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        newCells.push({
          id: `${row}-${col}`,
          row,
          col,
          value: "",
          answer: "",
          isBlocked: true,
        });
      }
    }

    puzzle.clues.forEach((clue) => {
      for (let i = 0; i < clue.length; i++) {
        const r = clue.direction === "across" ? clue.startRow : clue.startRow + i;
        const c = clue.direction === "across" ? clue.startCol + i : clue.startCol;
        const idx = r * gridSize + c;
        if (newCells[idx]) {
          newCells[idx].isBlocked = false;
          newCells[idx].answer = clue.solution[i];
          if (i === 0) newCells[idx].number = clue.number;
        }
      }
    });

    setCells(newCells);
  }, [puzzle]);

  const isValidAnswer = useCallback(
    (cell: Cell, value: string) => {
      const cluesForCell = puzzle.clues.filter((clue) => {
        if (clue.direction === "across") {
          return (
            cell.row === clue.startRow &&
            cell.col >= clue.startCol &&
            cell.col < clue.startCol + clue.length
          );
        }
        return (
          cell.col === clue.startCol &&
          cell.row >= clue.startRow &&
          cell.row < clue.startRow + clue.length
        );
      });

      return cluesForCell.some((clue) => {
        const position =
          clue.direction === "across"
            ? cell.col - clue.startCol
            : cell.row - clue.startRow;
        return clue.solution[position] === value.toUpperCase();
      });
    },
    [puzzle]
  );

  const handleCellUpdate = useCallback(
    (cellId: string, value: string) => {
      setCells((prev) => {
        const next = prev.map((cell) =>
          cell.id === cellId ? { ...cell, value: value.toUpperCase() } : cell
        );

        const complete = next.every((cell) => {
          if (cell.isBlocked) return true;
          return isValidAnswer(cell, cell.value);
        });

        if (complete && !gameCompleted) {
          setGameCompleted(true);
          setShowCompletionModal(true);
          setCompletionTime(timeElapsed);
          setTimeout(() => {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }, 100);
        }
        return next;
      });
    },
    [gameCompleted, timeElapsed, isValidAnswer]
  );

  const handleCellSelect = useCallback(
    (cellId: string) => {
      setSelectedCell(cellId);
      const [row, col] = cellId.split("-").map(Number);
      const matches = puzzle.clues.filter((clue) => {
        if (clue.direction === "across") {
          return (
            row === clue.startRow &&
            col >= clue.startCol &&
            col < clue.startCol + clue.length
          );
        }
        return (
          col === clue.startCol &&
          row >= clue.startRow &&
          row < clue.startRow + clue.length
        );
      });
      if (matches.length > 0) {
        let chosen = matches[0];
        if (currentClue && matches.some((c) => c.direction === currentClue.direction)) {
          chosen =
            matches.find((c) => c.direction === currentClue.direction) ||
            matches[0];
        }
        setCurrentClue(chosen);
      }
    },
    [currentClue, puzzle]
  );

  const handleStart = useCallback(() => {
    initializeGrid();
    setGameStarted(true);
    setGameCompleted(false);
    setShowCompletionModal(false);
    setCompletionTime(null);
    setShowingErrors(false);
    setTimeElapsed(0);
    setSelectedCell("0-0");
    setCurrentClue(puzzle.clues[0]);
  }, [initializeGrid, puzzle]);

  const handleCheck = useCallback(() => {
    setShowingErrors(true);
    const isComplete = cells.every((cell) => {
      if (cell.isBlocked) return true;
      return isValidAnswer(cell, cell.value);
    });
    if (isComplete) {
      setGameCompleted(true);
      setShowCompletionModal(true);
      setCompletionTime(timeElapsed);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [cells, timeElapsed, isValidAnswer]);

  useEffect(() => {
    const t = setTimeout(() => {
      setShowLoadingScreen(false);
      handleStart();
    }, 1500);
    return () => clearTimeout(t);
  }, [handleStart]);

  // === Loading Screen ===
  if (showLoadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col justify-center items-center px-4">
        <div className="text-center animate-fade-in">
          <img
            src={minHeheLogoSrc}
            alt="minHehe Logo"
            className="h-32 w-auto mx-auto mb-6 animate-pulse"
          />
          <h1 className="text-6xl font-bold text-foreground mb-4 animate-fade-in">
            minHehe
          </h1>
          <p className="text-xl text-muted-foreground animate-fade-in">
            {puzzle.theme ? `${puzzle.theme} Edition` : "Gym Edition"} – Day {day}
          </p>
          <p className="text-sm text-muted-foreground mt-2 animate-fade-in">
            Loading your puzzle...
          </p>
        </div>
      </div>
    );
  }

  // === Main Game ===
  return (
    <div
      className={cn(
        "h-[100dvh] relative overflow-hidden",
        puzzle.theme === "Coldplay"
          ? "bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900"
          : "bg-gradient-to-br from-background via-background to-muted"
      )}
    >
      {/* Custom background */}
      {puzzle.background && (
        <div className="absolute inset-0 z-0">{puzzle.background}</div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        {/* Clue bar */}
        {gameStarted && currentClue && (
          <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="px-2 py-2 md:px-4 md:py-3 flex items-center gap-2 text-xs md:text-sm">
              <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {currentClue.number}
                {currentClue.direction === "across" ? "A" : "D"}
              </span>
              <p className="text-foreground font-medium leading-snug break-words">
                {currentClue.text}
              </p>
            </div>
          </div>
        )}

        {/* Timer */}
        <div className="fixed top-1 right-1 z-50">
          <GameTimer
            timeElapsed={timeElapsed}
            setTimeElapsed={setTimeElapsed}
            isRunning={gameStarted && !gameCompleted}
            gameCompleted={gameCompleted}
          />
        </div>

        {/* Grid */}
        <div className="flex flex-col h-full">
          <div className="flex-1 flex items-center justify-center pb-20 md:pb-0">
            <CrosswordGrid
              cells={cells}
              selectedCell={selectedCell}
              onCellSelect={handleCellSelect}
              onCellUpdate={handleCellUpdate}
              showingErrors={showingErrors}
              gameStarted={gameStarted}
              currentClue={currentClue}
              gridSize={puzzle.size}
              fontSize="lg"
            />
          </div>
        </div>

        {/* Logo (optional per puzzle) */}
        {puzzle.logo && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
            <img src={puzzle.logo} alt="Puzzle Logo" className="w-32 h-auto" />
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center py-2">
          <GameControls
            gameStarted={gameStarted}
            gameCompleted={gameCompleted}
            onStartGame={handleStart}
            onCheckAnswers={handleCheck}
          />
        </div>

        {/* Clues Panel (desktop) */}
        <div className="hidden lg:block fixed right-4 top-1/2 transform -translate-y-1/2 w-80">
          <CluesPanel clues={puzzle.clues} />
        </div>
      </div>

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        completionTime={completionTime || 0}
        onNewGame={handleStart}
      />
    </div>
  );
};

export default CrosswordGame;
