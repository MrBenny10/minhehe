import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CrosswordGrid } from './CrosswordGrid';
import { CluesPanel } from './CluesPanel';
import { GameTimer } from './GameTimer';
import { GameControls } from './GameControls';
import { CompletionModal } from './CompletionModal';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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
  alternateSolutions?: string[];
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
  size: 13, // 13 cols × 8 rows
  clues: [
    // Across
    {
      number: 5,
      text: 'Traditional buffet, part of "smorgasbord" (7)',
      direction: 'across',
      startRow: 4,
      startCol: 1,
      length: 7,
      solution: 'SMORGAS',
    },
    {
      number: 7,
      text: 'Swedish word for "cheers!" (4)',
      direction: 'across',
      startRow: 5,
      startCol: 9,
      length: 4,
      solution: 'SKAL',
    },
    {
      number: 8,
      text: 'Swedish pop group (4)',
      direction: 'across',
      startRow: 7,
      startCol: 7,
      length: 4,
      solution: 'ABBA',
    },

    // Down
    {
      number: 1,
      text: 'Swedish university city (7)',
      direction: 'down',
      startRow: 1,
      startCol: 7,
      length: 7,
      solution: 'UPPSALA',
    },
    {
      number: 2,
      text: 'Prize named for Alfred (5)',
      direction: 'down',
      startRow: 1,
      startCol: 12,
      length: 5,
      solution: 'NOBEL',
      alternateSolutions: ['SKALL'],
    },
    {
      number: 3,
      text: 'Swedish ideal of "just right" (5)',
      direction: 'down',
      startRow: 2,
      startCol: 5,
      length: 5,
      solution: 'LAGOM',
    },
    {
      number: 4,
      text: 'Swedish carmaker (5)',
      direction: 'down',
      startRow: 3,
      startCol: 3,
      length: 5,
      solution: 'VOLVO',
    },
    {
      number: 6,
      text: 'Flat-pack furniture giant (4)',
      direction: 'down',
      startRow: 4,
      startCol: 10,
      length: 4,
      solution: 'IKEA',
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
    const cols = 13; // 13 columns
    const rows = 8;  // 8 rows
    
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

  const isValidAnswer = useCallback((cell: Cell, value: string) => {
    const cluesForCell = samplePuzzle.clues.filter(clue => {
      if (clue.direction === 'across') {
        return cell.row === clue.startRow && cell.col >= clue.startCol && cell.col < clue.startCol + clue.length;
      }
      return cell.col === clue.startCol && cell.row >= clue.startRow && cell.row < clue.startRow + clue.length;
    });

    return cluesForCell.some(clue => {
      const position = clue.direction === 'across' 
        ? cell.col - clue.startCol 
        : cell.row - clue.startRow;
      
      const solutions = [clue.solution, ...(clue.alternateSolutions || [])];
      return solutions.some(solution => solution[position] === value.toUpperCase());
    });
  }, []);

  const handleCellUpdate = useCallback((cellId: string, value: string) => {
    setCells(prev => {
      const next = prev.map(cell =>
        cell.id === cellId ? { ...cell, value: value.toUpperCase() } : cell
      );
      
      const complete = next.every(cell => {
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
  }, [gameCompleted, timeElapsed, isValidAnswer]);

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
    setCurrentClue(samplePuzzle.clues[0]); // Auto-select first clue
    // Auto-select first cell of first clue
    const firstClue = samplePuzzle.clues[0];
    setSelectedCell(`${firstClue.startRow}-${firstClue.startCol}`);
  }, [initializeGrid]);

  const handleCheck = useCallback(() => {
    setShowingErrors(true);
    const isComplete = cells.every(cell => {
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

  React.useEffect(() => {
    const t = setTimeout(() => {
      setShowLoadingScreen(false);
      handleStart();
    }, 2500);
    return () => clearTimeout(t);
  }, [handleStart]);

  if (showLoadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center animate-fade-in">
            <div className="animate-scale-in">
              <img src={minHeheLogoSrc} alt="minHehe Logo" className="h-32 w-auto mx-auto mb-6 animate-pulse" />
            </div>
            <h1 className="text-6xl font-bold text-foreground mb-4 animate-fade-in">minHehe</h1>
            <p className="text-xl text-muted-foreground animate-fade-in">Fun crosswords, no wall to pay!</p>
            <p className="text-sm text-muted-foreground mt-2 animate-fade-in">Loading your puzzle...</p>
          </div>
        </div>
        
        {/* Professional footer - positioned at bottom */}
        <div className="pb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Made by Benny in Sweden</span>
            <div className="flex">
              {/* Swedish flag heart - blue and yellow */}
              <div className="w-4 h-4 relative">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  {/* Blue heart shape */}
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="#006AA7"
                    className="animate-pulse"
                  />
                  {/* Yellow cross pattern */}
                  <rect x="9" y="2" width="6" height="20" fill="#FECC00" />
                  <rect x="2" y="9" width="20" height="6" fill="#FECC00" />
                </svg>
              </div>
            </div>
            <span>with AI</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted overflow-hidden">
      {gameStarted && currentClue && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-sm border-b border-border">
          <div className="px-2 py-1.5 md:px-4 md:py-2">
            <div className="flex items-center gap-2 text-xs md:text-sm">
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
        <div className={cn(
          "flex justify-center py-1 px-2 md:py-2 md:px-4", 
          gameStarted && currentClue ? "pt-10 md:pt-12" : "pt-1 md:pt-2"
        )}>
          <GameTimer
            timeElapsed={timeElapsed}
            setTimeElapsed={setTimeElapsed}
            isRunning={gameStarted && !gameCompleted}
            gameCompleted={gameCompleted}
          />
        </div>

        {/* Main content area - crossword grid */}
        <div className="flex-1 flex flex-col items-center justify-center px-1 py-1 md:px-2 md:py-2 min-h-0">
          <div className="w-full max-w-full flex-1 flex items-center justify-center">
            <CrosswordGrid
              cells={cells}
              selectedCell={selectedCell}
              onCellSelect={handleCellSelect}
              onCellUpdate={handleCellUpdate}
              showingErrors={showingErrors}
              gameStarted={gameStarted}
              currentClue={currentClue}
              gridSize={13}
            />
          </div>
        </div>

        {/* Controls at bottom */}
        <div className="flex justify-center py-1 px-2 md:py-2 md:px-4">
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

      {/* Day navigation buttons - only shown during game */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 flex gap-2">
        <Button variant="default" size="sm" disabled>Day 1</Button>
        <Link to="/day2">
          <Button variant="outline" size="sm">Day 2</Button>
        </Link>
      </div>
    </div>
  );
};
