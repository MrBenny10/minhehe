import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CrosswordGrid } from './CrosswordGrid';
import { CluesPanel } from './CluesPanel';
import { GameTimer } from './GameTimer';
import { GameControls } from './GameControls';
import { CompletionModal } from './CompletionModal';
import { cn } from '@/lib/utils';
import minHeheLogoSrc from '@/assets/minhehe-logo.png';

export interface Clue {
  number: number;
  text: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  length: number;
  solution: string;
}

export interface Cell {
  id: string;
  row: number;
  col: number;
  value: string;
  answer: string;
  isBlocked: boolean;
  number?: number;
}

export interface Puzzle {
  size: number;
  clues: Clue[];
}

const samplePuzzle: Puzzle = {
  size: 8, // 8 cols × 7 rows
  clues: [
    // Across
    {
      number: 1,
      text: 'Traditional buffet, part of "smorgasbord" (7)',
      direction: 'across',
      startRow: 3,
      startCol: 1,
      length: 7,
      solution: 'SMORGAS',
    },

    // Down
    {
      number: 2,
      text: 'Swedish university city (7)',
      direction: 'down',
      startRow: 0,
      startCol: 4,
      length: 7,
      solution: 'UPPSALA',
    },
    {
      number: 3,
      text: 'Swedish ideal of "just right" (5)',
      direction: 'down',
      startRow: 1,
      startCol: 2,
      length: 5,
      solution: 'LAGOM',
    },
    {
      number: 4,
      text: 'Swedish carmaker (5)',
      direction: 'down',
      startRow: 2,
      startCol: 6,
      length: 5,
      solution: 'VOLVO',
    },
  ],
};






export const CrosswordGame: React.FC = () => {
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

  // Initialize grid
  const initializeGrid = useCallback(() => {
    const newCells: Cell[] = [];
    const cols = 8; // 8 columns
    const rows = 7;  // 7 rows
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newCells.push({
          id: `${row}-${col}`,
          row,
          col,
          value: '',
          answer: '',
          isBlocked: true,
        });
      }
    }

    samplePuzzle.clues.forEach((clue) => {
      for (let i = 0; i < clue.length; i++) {
        const r = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
        const c = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        const idx = r * cols + c;
        if (newCells[idx] && r < rows && c < cols) {
          newCells[idx].isBlocked = false;
          newCells[idx].answer = clue.solution[i];
          if (i === 0) newCells[idx].number = clue.number;
        }
      }
    });

    setCells(newCells);
  }, []);

  const handleCellUpdate = useCallback((cellId: string, value: string) => {
    setCells(prev => {
      const next = prev.map(cell =>
        cell.id === cellId ? { ...cell, value: value.toUpperCase() } : cell
      );
      const complete = next.every(cell => cell.isBlocked || cell.value.toUpperCase() === cell.answer.toUpperCase());
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
  }, [gameCompleted, timeElapsed]);

  const handleCellSelect = useCallback((cellId: string) => {
    setSelectedCell(cellId);
    const [row, col] = cellId.split('-').map(Number);
    const matches = samplePuzzle.clues.filter(clue => {
      if (clue.direction === 'across') {
        return row === clue.startRow && col >= clue.startCol && col < clue.startCol + clue.length;
      }
      return col === clue.startCol && row >= clue.startRow && row < clue.startRow + clue.length;
    });
    if (matches.length > 0) {
      let chosen = matches[0];
      if (currentClue && matches.some(c => c.direction === currentClue.direction)) {
        chosen = matches.find(c => c.direction === currentClue.direction) || matches[0];
      }
      setCurrentClue(chosen);
    }
  }, [currentClue]);

  const handleStart = useCallback(() => {
    initializeGrid();
    setGameStarted(true);
    setGameCompleted(false);
    setShowCompletionModal(false);
    setCompletionTime(null);
    setShowingErrors(false);
    setTimeElapsed(0);
    setCurrentClue(null);
  }, [initializeGrid]);

  const handleCheck = useCallback(() => {
    setShowingErrors(true);
    const isComplete = cells.every(cell => cell.isBlocked || cell.value.toUpperCase() === cell.answer.toUpperCase());
    if (isComplete) {
      setGameCompleted(true);
      setShowCompletionModal(true);
      setCompletionTime(timeElapsed);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [cells, timeElapsed]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setShowLoadingScreen(false);
      handleStart();
    }, 2500);
    return () => clearTimeout(t);
  }, [handleStart]);

  if (showLoadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-scale-in">
            <img src={minHeheLogoSrc} alt="minHehe Logo" className="h-32 w-auto mx-auto mb-6 animate-pulse" />
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-4 animate-fade-in">minHehe</h1>
          <p className="text-xl text-muted-foreground animate-fade-in">Fun crosswords, no wall to pay!</p>
          <p className="text-sm text-muted-foreground mt-2 animate-fade-in">Loading your puzzle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted overflow-hidden">
      {gameStarted && currentClue && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-sm border-b border-border">
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {currentClue.number}{currentClue.direction === 'across' ? 'A' : 'D'}
              </span>
              <p className="text-foreground font-medium truncate">{currentClue.text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        {/* Timer at top */}
        <div className={cn("flex justify-center py-2 px-4", gameStarted && currentClue ? "pt-12" : "pt-2")}>
          <GameTimer
            timeElapsed={timeElapsed}
            setTimeElapsed={setTimeElapsed}
            isRunning={gameStarted && !gameCompleted}
            gameCompleted={gameCompleted}
          />
        </div>

        {/* Main content area - crossword grid */}
        <div className="flex-1 flex flex-col items-center justify-center px-2 py-2 min-h-0">
          <div className="w-full max-w-full flex-1 flex items-center justify-center">
            <CrosswordGrid
              cells={cells}
              selectedCell={selectedCell}
              onCellSelect={handleCellSelect}
              onCellUpdate={handleCellUpdate}
              showingErrors={showingErrors}
              gameStarted={gameStarted}
              currentClue={currentClue}
              gridSize={8}
            />
          </div>
        </div>

        {/* Controls at bottom */}
        <div className="flex justify-center py-2 px-4">
          <GameControls
            gameStarted={gameStarted}
            gameCompleted={gameCompleted}
            onStartGame={handleStart}
            onCheckAnswers={handleCheck}
          />
        </div>

        {/* Clues panel - hidden on mobile, accessible via modal/drawer if needed */}
        <div className="hidden lg:block fixed right-4 top-1/2 transform -translate-y-1/2 w-80">
          <CluesPanel clues={samplePuzzle.clues} />
        </div>
      </div>

      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        completionTime={completionTime || 0}
        onNewGame={handleStart}
      />
    </div>
  );
};
